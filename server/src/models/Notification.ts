import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  recipientId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  ticketId?: string;
  complaintId?: mongoose.Types.ObjectId;
  type: 'STATUS_UPDATE' | 'NEW_ASSIGNMENT' | 'SLA_WARNING' | 'ANNOUNCEMENT' | 'REOPEN';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    ticketId: { type: String },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    type: {
      type: String,
      enum: ['STATUS_UPDATE', 'NEW_ASSIGNMENT', 'SLA_WARNING', 'ANNOUNCEMENT', 'REOPEN'],
      default: 'STATUS_UPDATE'
    },
    isRead: { type: Boolean, default: false }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_, ret) => {
        const obj = ret as any;
        obj.id = obj._id?.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  }
);

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
