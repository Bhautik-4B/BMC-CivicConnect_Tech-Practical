import mongoose, { Schema, Document } from 'mongoose';
import { Priorities, Priority } from '@bmc/shared';

export interface IDepartmentDocument extends Document {
  name: string;
  code: string;
  description: string;
  headOfficerId?: mongoose.Types.ObjectId;
  defaultSlaHours: Record<Priority, number>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartmentDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    headOfficerId: { type: Schema.Types.ObjectId, ref: 'User' },
    defaultSlaHours: {
      [Priorities.EMERGENCY]: { type: Number, default: 4 },
      [Priorities.HIGH]: { type: Number, default: 24 },
      [Priorities.NORMAL]: { type: Number, default: 72 }
    },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
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

export const Department = mongoose.model<IDepartmentDocument>('Department', DepartmentSchema);
