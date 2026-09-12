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
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
