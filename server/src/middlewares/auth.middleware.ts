import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/appError.js';
import { User } from '../models/User.js';
import { UserRole } from '@bmc/shared';

export interface AuthUserPayload {
  id: string;
  mobile: string;
  role: UserRole;
  departmentId?: string;
  wardId?: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token missing. Please log in.');
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUserPayload;
    
    // Verify user is still active in database
    const userDoc = await User.findById(decoded.id);
    if (!userDoc || !userDoc.isActive) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    req.user = {
      id: userDoc._id.toString(),
      mobile: userDoc.mobile,
      role: userDoc.role,
      departmentId: userDoc.departmentId?.toString(),
      wardId: userDoc.wardId?.toString(),
      name: userDoc.name
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Invalid or expired authentication token'));
    } else {
      next(error);
    }
  }
}
