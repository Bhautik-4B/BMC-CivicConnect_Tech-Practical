import { z } from 'zod';
import { UserRoles } from '../constants/roles.js';

export const SendOtpSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number. Must be 10 digits starting with 6-9.')
});

export type SendOtpInput = z.infer<typeof SendOtpSchema>;

export const VerifyOtpSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number.'),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional()
});

export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

export const PasswordLoginSchema = z.object({
  identifier: z.string().min(3, 'Username, Mobile, or Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type PasswordLoginInput = z.infer<typeof PasswordLoginSchema>;
