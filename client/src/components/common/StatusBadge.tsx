import React from 'react';
import { ComplaintStatus, ComplaintStatuses, StatusLabels } from '@bmc/shared';

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyles = () => {
    switch (status) {
      case ComplaintStatuses.SUBMITTED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case ComplaintStatuses.UNDER_REVIEW:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case ComplaintStatuses.ASSIGNED:
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case ComplaintStatuses.IN_PROGRESS:
        return 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse';
      case ComplaintStatuses.AWAITING_VERIFICATION:
        return 'bg-yellow-50 text-yellow-800 border-yellow-300 font-semibold';
      case ComplaintStatuses.RESOLVED:
      case ComplaintStatuses.CLOSED:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case ComplaintStatuses.REOPENED:
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case ComplaintStatuses.REJECTED:
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStyles()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {StatusLabels[status] || status}
    </span>
  );
};
