import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  complaintId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorRole: string;
  actorName: string;
  action: string;
  fromState?: string;
  toState?: string;
  comment?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorRole: { type: String, required: true },
    actorName: { type: String, required: true },
    action: { type: String, required: true },
    fromState: { type: String },
    toState: { type: String },
    comment: { type: String },
    metadata: { type: Schema.Types.Mixed }
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

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
