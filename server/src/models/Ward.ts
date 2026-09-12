import mongoose, { Schema, Document } from 'mongoose';

export interface IZoneDocument extends Document {
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const ZoneSchema = new Schema<IZoneDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true }
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

export const Zone = mongoose.model<IZoneDocument>('Zone', ZoneSchema);

export interface IWardDocument extends Document {
  zoneId: mongoose.Types.ObjectId;
  wardNumber: number;
  name: string;
  boundaryPolygon: {
    type: 'Polygon';
    coordinates: number[][][]; // [ [ [lng, lat], ... ] ]
  };
  officeAddress?: string;
  nodalOfficerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WardSchema = new Schema<IWardDocument>(
  {
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    wardNumber: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    boundaryPolygon: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon'
      },
      coordinates: {
        type: [[[Number]]], // Array of arrays of [lng, lat] pairs
        required: true
      }
    },
    officeAddress: { type: String },
    nodalOfficerId: { type: Schema.Types.ObjectId, ref: 'User' }
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

// 2dsphere spatial index for point-in-polygon queries
WardSchema.index({ boundaryPolygon: '2dsphere' });

export const Ward = mongoose.model<IWardDocument>('Ward', WardSchema);
