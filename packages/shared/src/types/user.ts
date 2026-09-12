import { UserRole } from '../constants/roles.js';

export interface IUser {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  departmentId?: string;
  zoneId?: string;
  wardId?: string;
  employeeId?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthSession {
  user: IUser;
  accessToken: string;
  refreshToken?: string;
}
