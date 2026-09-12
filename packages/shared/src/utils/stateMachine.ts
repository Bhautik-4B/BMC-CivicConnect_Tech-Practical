import { ComplaintStatus, ComplaintStatuses } from '../constants/statuses.js';
import { UserRole, UserRoles } from '../constants/roles.js';

export const AllowedTransitions: Record<ComplaintStatus, ComplaintStatus[]> = {
  [ComplaintStatuses.SUBMITTED]: [
    ComplaintStatuses.UNDER_REVIEW,
    ComplaintStatuses.ASSIGNED,
    ComplaintStatuses.REJECTED
  ],
  [ComplaintStatuses.UNDER_REVIEW]: [
    ComplaintStatuses.ASSIGNED,
    ComplaintStatuses.REJECTED
  ],
  [ComplaintStatuses.ASSIGNED]: [
    ComplaintStatuses.IN_PROGRESS,
    ComplaintStatuses.ASSIGNED, // Reassignment
    ComplaintStatuses.REJECTED
  ],
  [ComplaintStatuses.IN_PROGRESS]: [
    ComplaintStatuses.AWAITING_VERIFICATION,
    ComplaintStatuses.RESOLVED
  ],
  [ComplaintStatuses.RESOLVED]: [
    ComplaintStatuses.AWAITING_VERIFICATION,
    ComplaintStatuses.CLOSED,
    ComplaintStatuses.REOPENED
  ],
  [ComplaintStatuses.AWAITING_VERIFICATION]: [
    ComplaintStatuses.CLOSED,
    ComplaintStatuses.REOPENED
  ],
  [ComplaintStatuses.CLOSED]: [
    ComplaintStatuses.REOPENED // Only within policy window
  ],
  [ComplaintStatuses.REOPENED]: [
    ComplaintStatuses.ASSIGNED,
    ComplaintStatuses.IN_PROGRESS
  ],
  [ComplaintStatuses.REJECTED]: []
};

export function canTransitionStatus(
  currentStatus: ComplaintStatus,
  targetStatus: ComplaintStatus,
  actorRole: UserRole
): { allowed: boolean; reason?: string } {
  // BMC Super Admin can override with audit trace
  if (actorRole === UserRoles.BMC_ADMIN) {
    return { allowed: true };
  }

  const validNextStates = AllowedTransitions[currentStatus] || [];
  if (!validNextStates.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Cannot transition status directly from ${currentStatus} to ${targetStatus}`
    };
  }

  // Role-specific transition rules
  if (actorRole === UserRoles.CITIZEN) {
    const validCitizenTargets: ComplaintStatus[] = [ComplaintStatuses.CLOSED, ComplaintStatuses.REOPENED];
    if (
      currentStatus === ComplaintStatuses.AWAITING_VERIFICATION &&
      !validCitizenTargets.includes(targetStatus)
    ) {
      return {
        allowed: false,
        reason: 'Citizens can only verify (Close) or contest (Reopen) resolved complaints.'
      };
    }
  }

  if (actorRole === UserRoles.FIELD_STAFF) {
    if (
      currentStatus === ComplaintStatuses.ASSIGNED &&
      targetStatus !== ComplaintStatuses.IN_PROGRESS
    ) {
      return {
        allowed: false,
        reason: 'Field staff can only mark assigned tasks as In Progress'
      };
    }
    const validStaffTargets: ComplaintStatus[] = [
      ComplaintStatuses.AWAITING_VERIFICATION,
      ComplaintStatuses.RESOLVED
    ];
    if (
      currentStatus === ComplaintStatuses.IN_PROGRESS &&
      !validStaffTargets.includes(targetStatus)
    ) {
      return {
        allowed: false,
        reason: 'Field staff can only submit completed proof of work'
      };
    }
    if (
      currentStatus === ComplaintStatuses.AWAITING_VERIFICATION ||
      targetStatus === ComplaintStatuses.CLOSED
    ) {
      return {
        allowed: false,
        reason: 'Only the citizen who reported the complaint (or BMC Super Admin) can verify and close a ticket'
      };
    }
  }

  if (actorRole === UserRoles.DEPT_OFFICER || actorRole === UserRoles.DEPT_SUPERVISOR) {
    if (targetStatus === ComplaintStatuses.CLOSED) {
      return {
        allowed: false,
        reason: 'Department officers cannot self-close tickets. Citizen verification is required.'
      };
    }
  }

  return { allowed: true };
}
