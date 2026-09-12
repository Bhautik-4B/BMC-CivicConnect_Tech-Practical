import React from 'react';
import { Priority, Priorities } from '@bmc/shared';
import { AlertTriangle, Flame, ShieldAlert } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  if (priority === Priorities.EMERGENCY) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300 animate-pulse ${className}`}
      >
        <Flame className="w-3.5 h-3.5 text-red-600" />
        Emergency
      </span>
    );
  }

  if (priority === Priorities.HIGH) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 ${className}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        High Priority
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
    >
      <ShieldAlert className="w-3 h-3 text-slate-400" />
      Normal
    </span>
  );
};
