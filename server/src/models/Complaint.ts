import mongoose, { Schema, Document } from 'mongoose';
import {
  ComplaintStatuses,
  ComplaintStatus,
  Priorities,
  Priority
} from '@bmc/shared';

export interface IComplaintDocument extends Document {
  ticketId: string;
  citizenId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  subcategory?: string;
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [Longitude, Latitude]
    address: string;
    landmark?: string;
  };
  zoneId: mongoose.Types.ObjectId;
  wardId: mongoose.Types.ObjectId;
  status: ComplaintStatus;
  priority: Priority;
  assignedDepartmentId?: mongoose.Types.ObjectId;
  assignedSupervisorId?: mongoose.Types.ObjectId;
  assignedFieldStaffId?: mongoose.Types.ObjectId;
  slaTargetHours: number;
  slaDeadline: Date;
  slaBreached: boolean;
  workStartedAt?: Date;
  workCompletedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  citizenAttachments: Array<{
    url: string;
    fileType: 'IMAGE' | 'VIDEO';
    uploadedAt: Date;
  }>;
  resolutionEvidence?: {
    beforePhotoUrl: string;
    afterPhotoUrl: string;
    resolutionNote: string;
    submittedBy?: mongoose.Types.ObjectId;
    submittedAt: Date;
  };
  reopenHistory: Array<{
    reopenedAt: Date;
    reason: string;
    photoUrl?: string;
  }>;
  isDuplicate: boolean;
  parentComplaintId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaintDocument>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory: { type: String },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [Longitude, Latitude]
        required: true
      },
      address: { type: String, required: true },
      landmark: { type: String }
    },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    wardId: { type: Schema.Types.ObjectId, ref: 'Ward', required: true, index: true },
    status: {
      type: String,
      enum: Object.values(ComplaintStatuses),
      default: ComplaintStatuses.SUBMITTED,
      index: true
    },
    priority: {
      type: String,
      enum: Object.values(Priorities),
      default: Priorities.NORMAL,
      index: true
    },
    assignedDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    assignedSupervisorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedFieldStaffId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    slaTargetHours: { type: Number, default: 72 },
    slaDeadline: { type: Date, required: true, index: true },
    slaBreached: { type: Boolean, default: false, index: true },
    workStartedAt: { type: Date },
    workCompletedAt: { type: Date },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    citizenAttachments: [
      {
        url: { type: String, required: true },
        fileType: { type: String, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    resolutionEvidence: {
      beforePhotoUrl: { type: String },
      afterPhotoUrl: { type: String },
      resolutionNote: { type: String },
      submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      submittedAt: { type: Date }
    },
    reopenHistory: [
      {
        reopenedAt: { type: Date, default: Date.now },
        reason: { type: String, required: true },
        photoUrl: { type: String }
      }
    ],
    isDuplicate: { type: Boolean, default: false },
    parentComplaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' }
  },
  {
    timestamps: true,
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

// 2dsphere index for geospatial and duplicate queries
ComplaintSchema.index({ 'location.coordinates': '2dsphere' });
ComplaintSchema.index({ assignedDepartmentId: 1, status: 1, priority: 1 });
ComplaintSchema.index({ assignedFieldStaffId: 1, status: 1 });
ComplaintSchema.index({ citizenId: 1, createdAt: -1 });

export const Complaint = mongoose.model<IComplaintDocument>('Complaint', ComplaintSchema);
