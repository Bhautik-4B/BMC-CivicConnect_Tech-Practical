import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { UnauthorizedError, NotFoundError } from '../utils/appError.js';

export class NotificationController {
  /**
   * Get all notifications for current user
   */
  public static async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const userId = req.user.id;

      const limit = Math.min(Number(req.query.limit) || 30, 100);
      const notifications = await Notification.find({
        recipientId: new mongoose.Types.ObjectId(userId)
      })
        .sort({ createdAt: -1 })
        .limit(limit);

      const unreadCount = await Notification.countDocuments({
        recipientId: new mongoose.Types.ObjectId(userId),
        isRead: false
      });

      sendSuccess(res, { notifications, unreadCount }, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a single notification as read
   */
  public static async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const notification = await Notification.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          recipientId: new mongoose.Types.ObjectId(req.user.id)
        },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        throw new NotFoundError('Notification');
      }

      sendSuccess(res, notification, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read for current user
   */
  public static async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      await Notification.updateMany(
        {
          recipientId: new mongoose.Types.ObjectId(req.user.id),
          isRead: false
        },
        { isRead: true }
      );

      sendSuccess(res, { success: true }, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}
