import React from 'react';
import { IComplaint, ComplaintStatuses } from '@bmc/shared';
import { StatusBadge } from '../common/StatusBadge.js';
import { PriorityBadge } from '../common/PriorityBadge.js';
import { MapPin, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TicketCardProps {
  complaint: IComplaint;
  onVerifyClick?: (complaint: IComplaint) => void;
  baseLink?: string;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  complaint,
  onVerifyClick,
  baseLink = '/complaints'
}) => {
  const isAwaitingVerification = complaint.status === ComplaintStatuses.AWAITING_VERIFICATION;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Header: Ticket ID + Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="font-mono text-xs font-bold text-civic-700 bg-civic-50 px-2 py-0.5 rounded-md">
              {complaint.ticketId}
            </span>
            <span className="text-xs text-slate-400 ml-2">
              {complaint.categoryName || 'Civic Issue'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-semibold text-slate-900 text-sm group-hover:text-civic-600 transition-colors line-clamp-1">
          {complaint.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{complaint.description}</p>

        {/* Location & Date Metadata */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1 max-w-[200px] truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{complaint.location.address}</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="mt-4 pt-3 flex items-center justify-between gap-2">
        {isAwaitingVerification && onVerifyClick ? (
          <button
            onClick={() => onVerifyClick(complaint)}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify Resolution Proof</span>
          </button>
        ) : (
          <Link
            to={`${baseLink}/${complaint.ticketId || complaint.id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-civic-50 text-slate-700 hover:text-civic-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <span>View Details & Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
