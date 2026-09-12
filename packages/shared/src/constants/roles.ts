export const UserRoles = {
  CITIZEN: 'CITIZEN',
  FIELD_STAFF: 'FIELD_STAFF',
  DEPT_OFFICER: 'DEPT_OFFICER',
  DEPT_SUPERVISOR: 'DEPT_SUPERVISOR',
  BMC_ADMIN: 'BMC_ADMIN'
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const RoleDisplayNames: Record<UserRole, string> = {
  [UserRoles.CITIZEN]: 'Citizen',
  [UserRoles.FIELD_STAFF]: 'Field Staff / Technician',
  [UserRoles.DEPT_OFFICER]: 'Department Officer',
  [UserRoles.DEPT_SUPERVISOR]: 'Department Supervisor',
  [UserRoles.BMC_ADMIN]: 'BMC Central Admin'
};
