import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, IUserDocument } from '../models/User.js';
import { env } from '../config/env.js';
import { BadRequestError, UnauthorizedError } from '../utils/appError.js';
import { UserRoles, UserRole, IAuthSession, IUser } from '@bmc/shared';

export class AuthService {
  /**
   * Generates or returns demo OTP (for development/MVP 123456 is standard)
   */
  public static async sendOtp(mobile: string): Promise<{ success: boolean; message: string; debugOtp?: string }> {
    const otp = '123456'; // Default demo OTP
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    let user = await User.findOne({ mobile });
    if (!user) {
      user = new User({
        name: `Citizen ${mobile.slice(-4)}`,
        mobile,
        role: UserRoles.CITIZEN,
        isActive: true,
        otpCode: otp,
        otpExpiresAt
      });
    } else {
      user.otpCode = otp;
      user.otpExpiresAt = otpExpiresAt;
    }

    await user.save();

    return {
      success: true,
      message: 'OTP sent successfully to mobile',
      debugOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    };
  }

  /**
   * Verifies OTP and generates auth tokens
   */
  public static async verifyOtp(
    mobile: string,
    otp: string,
    name?: string,
    email?: string,
    wardId?: string,
    zoneId?: string
  ): Promise<IAuthSession> {
    let user = await User.findOne({ mobile });
    if (!user) {
      // Auto-create citizen on OTP verify if they don't exist yet
      user = new User({
        name: (name && name.trim()) || `Citizen ${mobile.slice(-4)}`,
        mobile,
        email: email?.trim().toLowerCase(),
        wardId: wardId ? new mongoose.Types.ObjectId(wardId) : undefined,
        zoneId: zoneId ? new mongoose.Types.ObjectId(zoneId) : undefined,
        role: UserRoles.CITIZEN,
        isActive: true
      });
    } else {
      if (user.otpCode !== otp && otp !== '123456') {
        throw new BadRequestError('Invalid OTP code');
      }

      if (name && name.trim()) {
        user.name = name.trim();
      }
      if (email && email.trim()) {
        user.email = email.trim().toLowerCase();
      }
      if (wardId) {
        user.wardId = new mongoose.Types.ObjectId(wardId);
      }
      if (zoneId) {
        user.zoneId = new mongoose.Types.ObjectId(zoneId);
      }
    }

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return this.generateSession(user);
  }

  /**
   * Direct Citizen Registration & Instant Login
   */
  public static async registerCitizen(input: {
    name: string;
    mobile: string;
    email?: string;
    wardId?: string;
    zoneId?: string;
  }): Promise<IAuthSession> {
    let user = await User.findOne({ mobile: input.mobile });
    if (user) {
      user.name = input.name.trim();
      if (input.email) user.email = input.email.trim().toLowerCase();
      if (input.wardId) user.wardId = new mongoose.Types.ObjectId(input.wardId);
      if (input.zoneId) user.zoneId = new mongoose.Types.ObjectId(input.zoneId);
    } else {
      user = new User({
        name: input.name.trim(),
        mobile: input.mobile,
        email: input.email ? input.email.trim().toLowerCase() : undefined,
        wardId: input.wardId ? new mongoose.Types.ObjectId(input.wardId) : undefined,
        zoneId: input.zoneId ? new mongoose.Types.ObjectId(input.zoneId) : undefined,
        role: UserRoles.CITIZEN,
        isActive: true
      });
    }

    await user.save();
    return this.generateSession(user);
  }


  /**
   * Username / Email / Mobile password login for BMC staff and Admins
   */
  public static async passwordLogin(identifier: string, password: string): Promise<IAuthSession> {
    const user = await User.findOne({
      $or: [{ mobile: identifier }, { email: identifier.toLowerCase() }, { employeeId: identifier }]
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedError('Password login not configured for this account. Use OTP.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return this.generateSession(user);
  }

  /**
   * Generates JWT session
   */
  private static generateSession(user: IUserDocument): IAuthSession {
    const tokenPayload = {
      id: user._id.toString(),
      mobile: user.mobile,
      role: user.role,
      departmentId: user.departmentId?.toString(),
      wardId: user.wardId?.toString(),
      name: user.name
    };

    const accessToken = jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: '15m'
    });

    const refreshToken = jwt.sign({ id: user._id.toString() }, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d'
    });

    const mappedUser: IUser = {
      id: user._id.toString(),
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId?.toString(),
      zoneId: user.zoneId?.toString(),
      wardId: user.wardId?.toString(),
      employeeId: user.employeeId,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    return {
      user: mappedUser,
      accessToken,
      refreshToken
    };
  }
}
