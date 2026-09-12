import mongoose, { Schema, Document } from 'mongoose';
import { Priorities, Priority } from '@bmc/shared';

export interface ICategoryDocument extends Document {
  name: string;
  icon: string;
  defaultDepartmentId: mongoose.Types.ObjectId;
  defaultPriority: Priority;
  subcategories: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, required: true },
    defaultDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    defaultPriority: {
      type: String,
      enum: Object.values(Priorities),
      default: Priorities.NORMAL
    },
    subcategories: [{ type: String, trim: true }],
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

export const Category = mongoose.model<ICategoryDocument>('Category', CategorySchema);
