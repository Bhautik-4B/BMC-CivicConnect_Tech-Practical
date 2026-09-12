import { Request, Response, NextFunction } from 'express';
import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { UnauthorizedError, ForbiddenError } from '../utils/appError.js';
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
        .populate('citizenId categoryId wardId zoneId assignedSupervisorId assignedFieldStaffId')
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
        role: { $in: [UserRoles.FIELD_STAFF, UserRoles.DEPT_SUPERVISOR] },
        isActive: true
      };
      if (departmentId) filter.departmentId = departmentId;

      const staffMembers = await User.find(filter).select('-password -otpCode');

      // Aggregate workload for each field staff member
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

  public static async getFieldStaffTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { status } = req.query;

      const filter: any = { assignedFieldStaffId: req.user.id };
      if (status) filter.status = status;

      const tasks = await Complaint.find(filter)
        .populate('categoryId wardId zoneId')
        .sort({ priority: -1, createdAt: -1 });

      sendSuccess(res, tasks, 'Field staff assigned tasks retrieved');
    } catch (error) {
      next(error);
    }
  }
}
