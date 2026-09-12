import { Priority } from '../constants/priorities.js';

export interface IDepartment {
  id: string;
  name: string;
  code: string;
  description: string;
  headOfficerId?: string;
  headOfficerName?: string;
  defaultSlaHours: Record<Priority, number>;
  activeCount?: number;
  resolvedCount?: number;
  isActive: boolean;
}

export interface ICategory {
  id: string;
  name: string;
  icon: string;
  defaultDepartmentId: string;
  defaultDepartmentName?: string;
  defaultPriority: Priority;
  subcategories: string[];
  isActive: boolean;
}
