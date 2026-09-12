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
        const obj = ret as any;
        obj.id = obj._id?.toString();

        // Extract populated citizen info
        if (obj.citizenId && typeof obj.citizenId === 'object' && obj.citizenId.name) {
          obj.citizenName = obj.citizenId.name;
          obj.citizenMobile = obj.citizenId.mobile;
          obj.citizenId = obj.citizenId._id?.toString() || obj.citizenId.id;
        } else if (obj.citizenId) {
          obj.citizenId = obj.citizenId.toString();
        }

        // Extract populated category info
        if (obj.categoryId && typeof obj.categoryId === 'object' && obj.categoryId.name) {
          obj.categoryName = obj.categoryId.name;
          obj.categoryId = obj.categoryId._id?.toString() || obj.categoryId.id;
        } else if (obj.categoryId) {
          obj.categoryId = obj.categoryId.toString();
        }

        // Extract populated ward info
        if (obj.wardId && typeof obj.wardId === 'object' && obj.wardId.name) {
          obj.wardName = obj.wardId.name;
          obj.wardNumber = obj.wardId.wardNumber;
          obj.wardId = obj.wardId._id?.toString() || obj.wardId.id;
        } else if (obj.wardId) {
          obj.wardId = obj.wardId.toString();
        }

        // Extract populated zone info
        if (obj.zoneId && typeof obj.zoneId === 'object' && obj.zoneId.name) {
          obj.zoneName = obj.zoneId.name;
          obj.zoneId = obj.zoneId._id?.toString() || obj.zoneId.id;
        } else if (obj.zoneId) {
          obj.zoneId = obj.zoneId.toString();
        }

        // Extract populated department info
        if (obj.assignedDepartmentId && typeof obj.assignedDepartmentId === 'object' && obj.assignedDepartmentId.name) {
          obj.assignedDepartmentName = obj.assignedDepartmentId.name;
          obj.assignedDepartmentId = obj.assignedDepartmentId._id?.toString() || obj.assignedDepartmentId.id;
        } else if (obj.assignedDepartmentId) {
          obj.assignedDepartmentId = obj.assignedDepartmentId.toString();
        }

        // Extract populated supervisor info
        if (obj.assignedSupervisorId && typeof obj.assignedSupervisorId === 'object' && obj.assignedSupervisorId.name) {
          obj.assignedSupervisorName = obj.assignedSupervisorId.name;
          obj.assignedSupervisorId = obj.assignedSupervisorId._id?.toString() || obj.assignedSupervisorId.id;
        } else if (obj.assignedSupervisorId) {
          obj.assignedSupervisorId = obj.assignedSupervisorId.toString();
        }

        // Extract populated field staff info
        if (obj.assignedFieldStaffId && typeof obj.assignedFieldStaffId === 'object' && obj.assignedFieldStaffId.name) {
          obj.assignedFieldStaffName = obj.assignedFieldStaffId.name;
          obj.assignedFieldStaffPhone = obj.assignedFieldStaffId.mobile;
          obj.assignedFieldStaffEmployeeId = obj.assignedFieldStaffId.employeeId;
          obj.assignedFieldStaffId = obj.assignedFieldStaffId._id?.toString() || obj.assignedFieldStaffId.id;
        } else if (obj.assignedFieldStaffId) {
          obj.assignedFieldStaffId = obj.assignedFieldStaffId.toString();
        }

        delete obj._id;
        delete obj.__v;
        return obj;
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
