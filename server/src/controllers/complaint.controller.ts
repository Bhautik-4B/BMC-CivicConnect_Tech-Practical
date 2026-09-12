import { Request, Response, NextFunction } from 'express';
import { ComplaintService } from '../services/complaint.service.js';
import { Complaint } from '../models/Complaint.js';
import { AuditLog } from '../models/AuditLog.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import { NotFoundError, UnauthorizedError } from '../utils/appError.js';
import { UserRoles } from '@bmc/shared';

export class ComplaintController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const complaint = await ComplaintService.createComplaint(req.user.id, req.user.name, req.body);
      sendCreated(res, complaint, 'Complaint registered successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async getMyComplaints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const complaints = await Complaint.find({ citizenId: req.user.id })
        .populate('categoryId wardId assignedDepartmentId')
        .sort({ createdAt: -1 });

      sendSuccess(res, complaints, 'Citizen complaints retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const complaint = await Complaint.findOne({
        $or: [{ _id: isObjectId ? id : null }, { ticketId: id }]
      }).populate('citizenId categoryId wardId zoneId assignedDepartmentId assignedSupervisorId assignedFieldStaffId');

      if (!complaint) {
        throw new NotFoundError('Complaint');
      }

      const auditLogs = await AuditLog.find({ complaintId: complaint._id }).sort({ createdAt: 1 });

      sendSuccess(res, { complaint, auditLogs }, 'Complaint details retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = String(req.params.id);
      const updated = await ComplaintService.assignComplaint(
        id,
        { id: req.user.id, name: req.user.name, role: req.user.role },
        req.body
      );
      sendSuccess(res, updated, 'Complaint assignment updated');
    } catch (error) {
      next(error);
    }
  }

  public static async startWork(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = String(req.params.id);
      const updated = await ComplaintService.startWork(
        id,
        { id: req.user.id, name: req.user.name, role: req.user.role }
      );
      sendSuccess(res, updated, 'Work status updated to In Progress');
    } catch (error) {
      next(error);
    }
  }

  public static async submitResolution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = String(req.params.id);
      const updated = await ComplaintService.submitResolutionProof(
        id,
        { id: req.user.id, name: req.user.name, role: req.user.role },
        req.body
      );
      sendSuccess(res, updated, 'Resolution evidence submitted for verification');
    } catch (error) {
      next(error);
    }
  }

  public static async verifyResolution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = String(req.params.id);
      const updated = await ComplaintService.verifyResolution(
        id,
        req.user.id,
        req.user.name,
        req.body
      );
      sendSuccess(res, updated, 'Complaint verification recorded');
    } catch (error) {
      next(error);
    }
  }
}
