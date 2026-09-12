import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@bmc/shared';
import { ForbiddenError, UnauthorizedError } from '../utils/appError.js';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied for role '${req.user.role}'. Required one of: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
}
