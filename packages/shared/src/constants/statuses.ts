export const ComplaintStatuses = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  AWAITING_VERIFICATION: 'AWAITING_VERIFICATION',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
  REJECTED: 'REJECTED'
} as const;

export type ComplaintStatus = (typeof ComplaintStatuses)[keyof typeof ComplaintStatuses];

export const StatusLabels: Record<ComplaintStatus, string> = {
  [ComplaintStatuses.SUBMITTED]: 'Submitted',
  [ComplaintStatuses.UNDER_REVIEW]: 'Under Review',
  [ComplaintStatuses.ASSIGNED]: 'Assigned to Dept',
  [ComplaintStatuses.IN_PROGRESS]: 'Work in Progress',
  [ComplaintStatuses.AWAITING_VERIFICATION]: 'Awaiting Citizen Verification',
  [ComplaintStatuses.RESOLVED]: 'Resolved',
  [ComplaintStatuses.CLOSED]: 'Closed',
  [ComplaintStatuses.REOPENED]: 'Reopened',
  [ComplaintStatuses.REJECTED]: 'Rejected'
};
