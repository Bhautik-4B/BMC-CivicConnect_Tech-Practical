import mongoose from 'mongoose';
import { Complaint, IComplaintDocument } from '../models/Complaint.js';
import { Category } from '../models/Category.js';
import { Department } from '../models/Department.js';
import { Ward } from '../models/Ward.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import { GeoService } from './geo.service.js';
import { AppError, BadRequestError, NotFoundError, ForbiddenError } from '../utils/appError.js';
import { getSocketIO } from '../sockets/socket.js';
import {
  ComplaintStatuses,
  ComplaintStatus,
  Priorities,
  Priority,
  PrioritySLAHours,
  UserRoles,
  UserRole,
  canTransitionStatus,
  CreateComplaintInput,
  AssignComplaintInput,
  SubmitResolutionInput,
  VerifyResolutionInput
} from '@bmc/shared';

export class ComplaintService {
  /**
   * Generates formatted ticket ID e.g. BMC-2026-001245
   */
  private static async generateTicketId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await Complaint.countDocuments();
    const sequence = String(count + 1).padStart(6, '0');
    return `BMC-${year}-${sequence}`;
  }

  /**
   * Create a new complaint by a citizen
   */
  public static async createComplaint(
    citizenId: string,
    citizenName: string,
    input: CreateComplaintInput
  ): Promise<IComplaintDocument> {
    const [lng, lat] = input.location.coordinates;

    // 1. Smart Ward Detection
    let ward: any = input.wardId ? await Ward.findById(input.wardId) : null;
    if (!ward) {
      ward = await GeoService.detectWard(lng, lat);
    }
    if (!ward) {
      throw new BadRequestError('Could not determine municipal ward for the provided location coordinates.');
    }

    // 2. Category & Auto Department Suggestion
    const category = await Category.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError('Category');
    }

    // 3. Priority & SLA Calculation
    const priority = input.priority || category.defaultPriority || Priorities.NORMAL;
    const slaHours = PrioritySLAHours[priority] || 72;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    // 4. Duplicate Check
    const duplicates = await GeoService.findDuplicates(category._id, [lng, lat], 500);
    const isDuplicate = duplicates.length > 0;
    const parentComplaintId = isDuplicate ? duplicates[0]._id : undefined;

    // 5. Generate Ticket ID & Create Complaint
    const ticketId = await this.generateTicketId();

    const complaint = new Complaint({
      ticketId,
      citizenId: new mongoose.Types.ObjectId(citizenId),
      categoryId: category._id,
      subcategory: input.subcategory,
      title: input.title,
      description: input.description,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        address: input.location.address,
        landmark: input.location.landmark
      },
      zoneId: ward.zoneId,
      wardId: ward._id,
      status: ComplaintStatuses.SUBMITTED,
      priority,
      assignedDepartmentId: category.defaultDepartmentId, // Auto-route suggestion
      slaTargetHours: slaHours,
      slaDeadline,
      slaBreached: false,
      citizenAttachments: input.attachments.map((att) => ({
        url: att.url,
        fileType: att.fileType,
        uploadedAt: new Date()
      })),
      isDuplicate,
      parentComplaintId
    });

    await complaint.save();

    // 6. Record Audit Log
    await AuditLog.create({
      complaintId: complaint._id,
      actorId: new mongoose.Types.ObjectId(citizenId),
      actorRole: UserRoles.CITIZEN,
      actorName: citizenName,
      action: 'COMPLAINT_CREATED',
      toState: ComplaintStatuses.SUBMITTED,
      comment: `Complaint created with Ticket ID ${ticketId}`
    });

    // 7. Emit Realtime Event
    const io = getSocketIO();
    if (io) {
      io.emit('ticket:new', {
        id: complaint._id.toString(),
        ticketId: complaint.ticketId,
        title: complaint.title,
        status: complaint.status,
        priority: complaint.priority,
        wardId: complaint.wardId.toString(),
        departmentId: complaint.assignedDepartmentId?.toString()
      });
    }

    return complaint;
  }

  /**
   * Assign or Reassign Department and Field Staff
   */
  public static async assignComplaint(
    complaintId: string,
    actor: { id: string; name: string; role: UserRole },
    input: AssignComplaintInput
  ): Promise<IComplaintDocument> {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint');
    }

    const previousStatus = complaint.status;
    const targetStatus = input.fieldStaffId ? ComplaintStatuses.ASSIGNED : ComplaintStatuses.ASSIGNED;

    const transitionCheck = canTransitionStatus(previousStatus, targetStatus, actor.role);
    if (!transitionCheck.allowed) {
      throw new BadRequestError(transitionCheck.reason || 'Invalid status transition');
    }

    complaint.assignedDepartmentId = new mongoose.Types.ObjectId(input.departmentId);
    if (input.supervisorId) {
      complaint.assignedSupervisorId = new mongoose.Types.ObjectId(input.supervisorId);
    }
    if (input.fieldStaffId) {
      complaint.assignedFieldStaffId = new mongoose.Types.ObjectId(input.fieldStaffId);
    }
    if (input.priority) {
      complaint.priority = input.priority;
      const hours = PrioritySLAHours[input.priority];
      complaint.slaTargetHours = hours;
      complaint.slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    complaint.status = targetStatus;
    await complaint.save();

    // Audit Log
    await AuditLog.create({
      complaintId: complaint._id,
      actorId: new mongoose.Types.ObjectId(actor.id),
      actorRole: actor.role,
      actorName: actor.name,
      action: 'ASSIGNMENT_UPDATED',
      fromState: previousStatus,
      toState: targetStatus,
      comment: input.notes || 'Department/Staff assignment updated'
    });

    // Notification to citizen
    await Notification.create({
      recipientId: complaint.citizenId,
      title: 'Ticket Assigned',
      message: `Your ticket ${complaint.ticketId} has been assigned for resolution.`,
      ticketId: complaint.ticketId,
      complaintId: complaint._id,
      type: 'STATUS_UPDATE'
    });

    const io = getSocketIO();
    if (io) {
      io.emit('ticket:status_changed', {
        ticketId: complaint.ticketId,
        status: complaint.status,
        assignedDepartmentId: complaint.assignedDepartmentId?.toString(),
        assignedFieldStaffId: complaint.assignedFieldStaffId?.toString()
      });
    }

    return complaint;
  }

  /**
   * Field Staff starts on-ground work
   */
  public static async startWork(
    complaintId: string,
    fieldStaff: { id: string; name: string; role: UserRole }
  ): Promise<IComplaintDocument> {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint');
    }

    if (
      fieldStaff.role === UserRoles.FIELD_STAFF &&
      complaint.assignedFieldStaffId?.toString() !== fieldStaff.id
    ) {
      throw new ForbiddenError('You are not the assigned field worker for this ticket');
    }

    const previousStatus = complaint.status;
    complaint.status = ComplaintStatuses.IN_PROGRESS;
    complaint.workStartedAt = new Date();
    await complaint.save();

    await AuditLog.create({
      complaintId: complaint._id,
      actorId: new mongoose.Types.ObjectId(fieldStaff.id),
      actorRole: fieldStaff.role,
      actorName: fieldStaff.name,
      action: 'WORK_STARTED',
      fromState: previousStatus,
      toState: ComplaintStatuses.IN_PROGRESS,
      comment: 'Field worker arrived at location and commenced repair work.'
    });

    const io = getSocketIO();
    if (io) {
      io.emit('ticket:status_changed', {
        ticketId: complaint.ticketId,
        status: complaint.status
      });
    }

    return complaint;
  }

  /**
   * Field Staff submits resolution proof (Before/After photos + resolution note)
   */
  public static async submitResolutionProof(
    complaintId: string,
    fieldStaff: { id: string; name: string; role: UserRole },
    input: SubmitResolutionInput
  ): Promise<IComplaintDocument> {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint');
    }

    complaint.status = ComplaintStatuses.AWAITING_VERIFICATION;
    complaint.workCompletedAt = new Date();
    complaint.resolvedAt = new Date();
    complaint.resolutionEvidence = {
      beforePhotoUrl: input.beforePhotoUrl,
      afterPhotoUrl: input.afterPhotoUrl,
      resolutionNote: input.resolutionNote,
      submittedBy: new mongoose.Types.ObjectId(fieldStaff.id),
      submittedAt: new Date()
    };

    await complaint.save();

    await AuditLog.create({
      complaintId: complaint._id,
      actorId: new mongoose.Types.ObjectId(fieldStaff.id),
      actorRole: fieldStaff.role,
      actorName: fieldStaff.name,
      action: 'RESOLUTION_SUBMITTED',
      fromState: ComplaintStatuses.IN_PROGRESS,
      toState: ComplaintStatuses.AWAITING_VERIFICATION,
      comment: `Resolution evidence submitted: ${input.resolutionNote}`
    });

    // Notify Citizen to verify
    await Notification.create({
      recipientId: complaint.citizenId,
      title: 'Action Required: Verify Resolution',
      message: `Work on ticket ${complaint.ticketId} is finished. Please inspect Before/After proof and verify.`,
      ticketId: complaint.ticketId,
      complaintId: complaint._id,
      type: 'STATUS_UPDATE'
    });

    const io = getSocketIO();
    if (io) {
      io.emit('ticket:status_changed', {
        ticketId: complaint.ticketId,
        status: complaint.status,
        evidence: complaint.resolutionEvidence
      });
    }

    return complaint;
  }

  /**
   * Citizen verifies work (Yes -> Closed, No -> Reopened)
   */
  public static async verifyResolution(
    complaintId: string,
    citizenId: string,
    citizenName: string,
    input: VerifyResolutionInput
  ): Promise<IComplaintDocument> {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint');
    }

    if (complaint.citizenId.toString() !== citizenId) {
      throw new ForbiddenError('Only the reporting citizen can verify ticket resolution');
    }

    const previousStatus = complaint.status;

    if (input.isResolved) {
      complaint.status = ComplaintStatuses.CLOSED;
      complaint.closedAt = new Date();
      await complaint.save();

      await AuditLog.create({
        complaintId: complaint._id,
        actorId: new mongoose.Types.ObjectId(citizenId),
        actorRole: UserRoles.CITIZEN,
        actorName: citizenName,
        action: 'CITIZEN_VERIFIED_CLOSED',
        fromState: previousStatus,
        toState: ComplaintStatuses.CLOSED,
        comment: input.feedback || 'Citizen confirmed issue has been satisfactorily resolved.'
      });
    } else {
      complaint.status = ComplaintStatuses.REOPENED;
      complaint.reopenHistory.push({
        reopenedAt: new Date(),
        reason: input.reopenReason || 'Citizen indicated issue is still persistent',
        photoUrl: input.reopenPhotoUrl
      });
      await complaint.save();

      await AuditLog.create({
        complaintId: complaint._id,
        actorId: new mongoose.Types.ObjectId(citizenId),
        actorRole: UserRoles.CITIZEN,
        actorName: citizenName,
        action: 'CITIZEN_REOPENED_TICKET',
        fromState: previousStatus,
        toState: ComplaintStatuses.REOPENED,
        comment: `Reopened reason: ${input.reopenReason || 'Unresolved'}`
      });
    }

    const io = getSocketIO();
    if (io) {
      io.emit('ticket:status_changed', {
        ticketId: complaint.ticketId,
        status: complaint.status
      });
    }

    return complaint;
  }
}
