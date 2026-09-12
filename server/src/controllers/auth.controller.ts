import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class AuthController {
  public static async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mobile } = req.body;
      const result = await AuthService.sendOtp(mobile);
      sendSuccess(res, result, 'OTP sent successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mobile, otp, name } = req.body;
      const session = await AuthService.verifyOtp(mobile, otp, name);

      res.cookie('accessToken', session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000
      });

      sendSuccess(res, session, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  public static async passwordLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, password } = req.body;
      const session = await AuthService.passwordLogin(identifier, password);

      res.cookie('accessToken', session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000
      });

      sendSuccess(res, session, 'Admin / Staff login successful');
    } catch (error) {
      next(error);
    }
  }

  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, req.user, 'Current user profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('accessToken');
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }
}
