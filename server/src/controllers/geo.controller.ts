import { Request, Response, NextFunction } from 'express';
import { GeoService } from '../services/geo.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { BadRequestError } from '../utils/appError.js';

export class GeoController {
  public static async detectWard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lng, lat } = req.query;
      if (!lng || !lat) {
        throw new BadRequestError('Query parameters lng (longitude) and lat (latitude) are required');
      }

      const longitude = parseFloat(lng as string);
      const latitude = parseFloat(lat as string);

      if (isNaN(longitude) || isNaN(latitude)) {
        throw new BadRequestError('Invalid coordinates format');
      }

      const ward = await GeoService.detectWard(longitude, latitude);
      sendSuccess(res, ward, 'Ward detected successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async checkDuplicates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId, lng, lat } = req.query;
      if (!categoryId || !lng || !lat) {
        throw new BadRequestError('categoryId, lng, and lat parameters are required');
      }

      const longitude = parseFloat(lng as string);
      const latitude = parseFloat(lat as string);

      const duplicates = await GeoService.findDuplicates(categoryId as string, [longitude, latitude], 500);
      sendSuccess(res, duplicates, `Found ${duplicates.length} potential duplicate complaints within 500m`);
    } catch (error) {
      next(error);
    }
  }
}
