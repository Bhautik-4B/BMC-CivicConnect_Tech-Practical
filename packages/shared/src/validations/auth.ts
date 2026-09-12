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
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  wardId: z.string().optional(),
  zoneId: z.string().optional()
});

export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

export const CitizenRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number. Must be 10 digits starting with 6-9.'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  wardId: z.string().optional(),
  zoneId: z.string().optional()
});

export type CitizenRegisterInput = z.infer<typeof CitizenRegisterSchema>;

export const PasswordLoginSchema = z.object({
  identifier: z.string().min(3, 'Username, Mobile, or Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type PasswordLoginInput = z.infer<typeof PasswordLoginSchema>;

export const CreateStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number. Must be 10 digits starting with 6-9.'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  role: z.enum([UserRoles.FIELD_STAFF, UserRoles.DEPT_SUPERVISOR, UserRoles.DEPT_OFFICER]).default(UserRoles.FIELD_STAFF),
  employeeId: z.string().optional(),
  departmentId: z.string().optional(),
  wardId: z.string().optional(),
  zoneId: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional()
});

export type CreateStaffInput = z.infer<typeof CreateStaffSchema>;

export const UpdateStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number.').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  role: z.enum([UserRoles.FIELD_STAFF, UserRoles.DEPT_SUPERVISOR, UserRoles.DEPT_OFFICER]).optional(),
  employeeId: z.string().optional(),
  wardId: z.string().optional(),
  zoneId: z.string().optional(),
  isActive: z.boolean().optional()
});

export type UpdateStaffInput = z.infer<typeof UpdateStaffSchema>;

