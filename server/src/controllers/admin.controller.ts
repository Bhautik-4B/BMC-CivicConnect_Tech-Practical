import { Request, Response, NextFunction } from 'express';
import { Complaint } from '../models/Complaint.js';
import { Department } from '../models/Department.js';
import { Ward } from '../models/Ward.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ComplaintStatuses, CityAnalyticsSummary } from '@bmc/shared';

export class AdminController {
  public static async getAllComplaints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, priority, departmentId, wardId, categoryId, slaBreached, search } = req.query;

      const filter: any = {};
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (departmentId) filter.assignedDepartmentId = departmentId;
      if (wardId) filter.wardId = wardId;
      if (categoryId) filter.categoryId = categoryId;
      if (slaBreached !== undefined) filter.slaBreached = slaBreached === 'true';

      if (search) {
        filter.$or = [
          { ticketId: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const complaints = await Complaint.find(filter)
        .populate('citizenId categoryId wardId zoneId assignedDepartmentId assignedFieldStaffId')
        .sort({ createdAt: -1 });

      sendSuccess(res, complaints, 'City complaints retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getAnalyticsOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalComplaints = await Complaint.countDocuments();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const newToday = await Complaint.countDocuments({ createdAt: { $gte: startOfDay } });
      const inProgress = await Complaint.countDocuments({ status: ComplaintStatuses.IN_PROGRESS });
      const resolved = await Complaint.countDocuments({
        status: { $in: [ComplaintStatuses.RESOLVED, ComplaintStatuses.CLOSED] }
      });
      const overdue = await Complaint.countDocuments({ slaBreached: true, status: { $ne: ComplaintStatuses.CLOSED } });
      const reopened = await Complaint.countDocuments({ status: ComplaintStatuses.REOPENED });

      const resolutionRate = totalComplaints > 0 ? parseFloat(((resolved / totalComplaints) * 100).toFixed(1)) : 0;
      const onTimeComplaints = await Complaint.countDocuments({
        status: ComplaintStatuses.CLOSED,
        slaBreached: false
      });
      const totalClosed = await Complaint.countDocuments({ status: ComplaintStatuses.CLOSED });
      const slaComplianceRate = totalClosed > 0 ? parseFloat(((onTimeComplaints / totalClosed) * 100).toFixed(1)) : 100;

      // Category breakdown
      const categoryData = await Complaint.aggregate([
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { categoryName: '$category.name', count: 1 } }
      ]);

      // Ward breakdown
      const wardData = await Complaint.aggregate([
        { $group: { _id: '$wardId', count: { $sum: 1 } } },
        { $lookup: { from: 'wards', localField: '_id', foreignField: '_id', as: 'ward' } },
        { $unwind: '$ward' },
        { $project: { wardNumber: '$ward.wardNumber', wardName: '$ward.name', count: 1 } },
        { $sort: { wardNumber: 1 } }
      ]);

      // Department performance
      const departments = await Department.find({ isActive: true });
      const departmentPerformance = await Promise.all(
        departments.map(async (dept) => {
          const total = await Complaint.countDocuments({ assignedDepartmentId: dept._id });
          const deptResolved = await Complaint.countDocuments({
            assignedDepartmentId: dept._id,
            status: { $in: [ComplaintStatuses.RESOLVED, ComplaintStatuses.CLOSED] }
          });
          const deptOnTime = await Complaint.countDocuments({
            assignedDepartmentId: dept._id,
            slaBreached: false,
            status: { $in: [ComplaintStatuses.RESOLVED, ComplaintStatuses.CLOSED] }
          });

          return {
            departmentName: dept.name,
            total,
            resolved: deptResolved,
            complianceRate: deptResolved > 0 ? parseFloat(((deptOnTime / deptResolved) * 100).toFixed(1)) : 100
          };
        })
      );

      const summary: CityAnalyticsSummary = {
        totalComplaints,
        newToday,
        inProgress,
        resolved,
        overdue,
        reopened,
        resolutionRate,
        slaComplianceRate,
        categoryBreakdown: categoryData,
        wardBreakdown: wardData,
        departmentPerformance
      };

      sendSuccess(res, summary, 'City analytics aggregated');
    } catch (error) {
      next(error);
    }
  }

  public static async getDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await Department.find().populate('headOfficerId');
      sendSuccess(res, departments, 'Departments list retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getWards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wards = await Ward.find().populate('zoneId nodalOfficerId').sort({ wardNumber: 1 });
      sendSuccess(res, wards, 'Wards list retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await Category.find({ isActive: true }).populate('defaultDepartmentId');
      sendSuccess(res, categories, 'Complaint categories retrieved');
    } catch (error) {
      next(error);
    }
  }
}
