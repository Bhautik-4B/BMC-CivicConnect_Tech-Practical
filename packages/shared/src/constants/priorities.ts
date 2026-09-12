export const Priorities = {
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  EMERGENCY: 'EMERGENCY'
} as const;

export type Priority = (typeof Priorities)[keyof typeof Priorities];

export const PrioritySLAHours: Record<Priority, number> = {
  [Priorities.EMERGENCY]: 4,
  [Priorities.HIGH]: 24,
  [Priorities.NORMAL]: 72
};

export const PriorityLabels: Record<Priority, string> = {
  [Priorities.EMERGENCY]: 'Emergency (4h SLA)',
  [Priorities.HIGH]: 'High Priority (24h SLA)',
  [Priorities.NORMAL]: 'Normal (72h SLA)'
};
