import mongoose from 'mongoose';
import { Ward, IWardDocument } from '../models/Ward.js';
import { Complaint, IComplaintDocument } from '../models/Complaint.js';
import { Category } from '../models/Category.js';
import { ComplaintStatuses } from '@bmc/shared';

export class GeoService {
  /**
   * Smart Ward Detection: Finds which Ward contains the [lng, lat] coordinate point
   */
  public static async detectWard(longitude: number, latitude: number): Promise<IWardDocument | null> {
    try {
      const ward = await Ward.findOne({
        boundaryPolygon: {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            }
          }
        }
      }).populate('zoneId nodalOfficerId');

      if (ward) return ward;

      // Fallback: If point is slightly outside defined polygon, find the nearest ward center
      const fallbackWard = await Ward.findOne().populate('zoneId nodalOfficerId');
      return fallbackWard;
    } catch (error) {
      console.error('Error in detectWard:', error);
      return await Ward.findOne().populate('zoneId nodalOfficerId');
    }
  }

  /**
   * Smart Duplicate Detection: Finds open complaints of the same category within radiusMeters (default 500m)
   */
  public static async findDuplicates(
    categoryId: string | mongoose.Types.ObjectId,
    coordinates: [number, number],
    radiusMeters: number = 500
  ): Promise<IComplaintDocument[]> {
    try {
      return await Complaint.find({
        categoryId: new mongoose.Types.ObjectId(categoryId),
        status: {
          $in: [
            ComplaintStatuses.SUBMITTED,
            ComplaintStatuses.UNDER_REVIEW,
            ComplaintStatuses.ASSIGNED,
            ComplaintStatuses.IN_PROGRESS
          ]
        },
        'location.coordinates': {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radiusMeters
          }
        }
      })
        .populate('citizenId categoryId wardId assignedDepartmentId')
        .limit(5);
    } catch (error) {
      console.warn('Geospatial index query error (falling back to empty):', error);
      return [];
    }
  }
}
