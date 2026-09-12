import mongoose, { Schema, Document } from 'mongoose';
import { UserRoles, UserRole } from '@bmc/shared';

export interface IUserDocument extends Document {
  name: string;
  mobile: string;
  email?: string;
  password?: string;
  role: UserRole;
  departmentId?: mongoose.Types.ObjectId;
  zoneId?: mongoose.Types.ObjectId;
  wardId?: mongoose.Types.ObjectId;
  employeeId?: string;
  avatarUrl?: string;
  isActive: boolean;
  otpCode?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, index: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    password: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRoles),
      default: UserRoles.CITIZEN,
      index: true
    },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone' },
    wardId: { type: Schema.Types.ObjectId, ref: 'Ward' },
    employeeId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
    otpCode: { type: String },
    otpExpiresAt: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        const obj = ret as any;
        obj.id = obj._id?.toString();
        delete obj._id;
        delete obj.__v;
        delete obj.password;
        delete obj.otpCode;
        delete obj.otpExpiresAt;
        return obj;
      }
    }
  }
);

export const User = mongoose.model<IUserDocument>('User', UserSchema);
