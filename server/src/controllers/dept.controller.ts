import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { UnauthorizedError, ForbiddenError, BadRequestError, NotFoundError } from '../utils/appError.js';
import { UserRoles, ComplaintStatuses } from '@bmc/shared';

export class DeptController {
  public static async getDepartmentQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const departmentId = req.user.departmentId;

      if (!departmentId && req.user.role !== UserRoles.BMC_ADMIN) {
        throw new ForbiddenError('No department associated with current user account');
      }

      const { status, priority, wardId } = req.query;

      const filter: any = {};
      if (departmentId) filter.assignedDepartmentId = departmentId;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (wardId) filter.wardId = wardId;

      const complaints = await Complaint.find(filter)
        .populate('citizenId categoryId wardId zoneId assignedDepartmentId assignedSupervisorId assignedFieldStaffId')
        .sort({ createdAt: -1 });

      sendSuccess(res, complaints, 'Department complaint queue retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getDepartmentStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const departmentId = req.user.departmentId;

      const filter: any = {
        role: { $in: [UserRoles.FIELD_STAFF, UserRoles.DEPT_SUPERVISOR, UserRoles.DEPT_OFFICER] }
      };
      if (departmentId && req.user.role !== UserRoles.BMC_ADMIN) {
        filter.departmentId = departmentId;
      } else if (req.query.departmentId) {
        filter.departmentId = req.query.departmentId;
      }

      const staffMembers = await User.find(filter).select('-password -otpCode').sort({ createdAt: -1 });

      // Aggregate workload for each staff member
      const staffWithWorkload = await Promise.all(
        staffMembers.map(async (staff) => {
          const activeTasks = await Complaint.countDocuments({
            assignedFieldStaffId: staff._id,
            status: { $in: [ComplaintStatuses.ASSIGNED, ComplaintStatuses.IN_PROGRESS] }
          });
          const completedTasks = await Complaint.countDocuments({
            assignedFieldStaffId: staff._id,
            status: { $in: [ComplaintStatuses.RESOLVED, ComplaintStatuses.CLOSED] }
          });

          return {
            ...staff.toJSON(),
            activeTasks,
            completedTasks,
            isAvailable: activeTasks < 10
          };
        })
      );

      sendSuccess(res, staffWithWorkload, 'Department employees with workload retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async createStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const userDeptId = req.user.departmentId;

      const { name, mobile, email, role, employeeId, departmentId, wardId, zoneId, password } = req.body;

      const targetDeptId = req.user.role === UserRoles.BMC_ADMIN ? (departmentId || userDeptId) : userDeptId;
      if (!targetDeptId) {
        throw new BadRequestError('Department ID is required to create department staff.');
      }

      // Check if mobile or employeeId is already in use
      const existingUser = await User.findOne({
        $or: [
          { mobile },
          ...(email ? [{ email: email.toLowerCase() }] : []),
          ...(employeeId ? [{ employeeId }] : [])
        ]
      });

      if (existingUser) {
        throw new BadRequestError('A user with this mobile number, email, or Employee ID already exists.');
      }

      const rawPassword = password || 'BmcStaff@123';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const generatedEmpId = employeeId || `EMP-${Math.floor(100000 + Math.random() * 900000)}`;

      const newStaff = new User({
        name: name.trim(),
        mobile: mobile.trim(),
        email: email ? email.trim().toLowerCase() : undefined,
        password: hashedPassword,
        role: role || UserRoles.FIELD_STAFF,
        departmentId: new mongoose.Types.ObjectId(targetDeptId),
        wardId: wardId ? new mongoose.Types.ObjectId(wardId) : undefined,
        zoneId: zoneId ? new mongoose.Types.ObjectId(zoneId) : undefined,
        employeeId: generatedEmpId,
        isActive: true
      });

      await newStaff.save();

      const sanitizedStaff = await User.findById(newStaff._id).select('-password -otpCode');
      sendSuccess(res, sanitizedStaff, 'Staff member onboarded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async updateStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;

      const staff = await User.findById(id);
      if (!staff) {
        throw new NotFoundError('Staff member');
      }

      if (
        req.user.role !== UserRoles.BMC_ADMIN &&
        staff.departmentId?.toString() !== req.user.departmentId
      ) {
        throw new ForbiddenError('You can only manage staff within your own department.');
      }

      const { name, mobile, email, role, employeeId, wardId, zoneId, isActive } = req.body;

      if (name) staff.name = name.trim();
      if (mobile) staff.mobile = mobile.trim();
      if (email !== undefined) staff.email = email ? email.trim().toLowerCase() : undefined;
      if (role) staff.role = role;
      if (employeeId) staff.employeeId = employeeId;
      if (wardId !== undefined) staff.wardId = wardId ? new mongoose.Types.ObjectId(wardId) : undefined;
      if (zoneId !== undefined) staff.zoneId = zoneId ? new mongoose.Types.ObjectId(zoneId) : undefined;
      if (isActive !== undefined) staff.isActive = isActive;

      await staff.save();

      const updated = await User.findById(id).select('-password -otpCode');
      sendSuccess(res, updated, 'Staff member details updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async deleteStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;

      const staff = await User.findById(id);
      if (!staff) {
        throw new NotFoundError('Staff member');
      }

      if (
        req.user.role !== UserRoles.BMC_ADMIN &&
        staff.departmentId?.toString() !== req.user.departmentId
      ) {
        throw new ForbiddenError('You can only manage staff within your own department.');
      }

      // Check active tasks
      const activeTasks = await Complaint.countDocuments({
        assignedFieldStaffId: staff._id,
        status: { $in: [ComplaintStatuses.ASSIGNED, ComplaintStatuses.IN_PROGRESS] }
      });

      if (activeTasks > 0) {
        staff.isActive = false;
        await staff.save();
        sendSuccess(res, { deactivated: true, activeTasks }, 'Staff member has active assigned tasks; marked as Inactive instead of deletion.');
        return;
      }

      staff.isActive = false;
      await staff.save();
      sendSuccess(res, { deactivated: true }, 'Staff member deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async getFieldStaffTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { status } = req.query;

      const filter: any = { assignedFieldStaffId: req.user.id };
      if (status) filter.status = status;

      const tasks = await Complaint.find(filter)
        .populate('citizenId categoryId wardId zoneId assignedDepartmentId assignedSupervisorId assignedFieldStaffId')
        .sort({ priority: -1, createdAt: -1 });

      sendSuccess(res, tasks, 'Field staff assigned tasks retrieved');
    } catch (error) {
      next(error);
    }
  }
}

