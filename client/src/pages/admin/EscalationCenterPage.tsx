import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PriorityBadge } from '../../components/common/PriorityBadge.js';
import { IComplaint, ComplaintStatuses, Priorities } from '@bmc/shared';
import { AlertTriangle, Flame, RotateCcw, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EscalationCenterPage: React.FC = () => {
  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ['escalations-all'],
    queryFn: async () => {
      const res: any = await api.get('/admin/complaints');
      return res.data as IComplaint[];
    }
  });

  if (isLoading) return <LoadingSpinner message="Scanning city escalations..." />;

  const allComplaints = complaintsData || [];
  const breachedSla = allComplaints.filter(
    (c) => c.slaBreached && c.status !== ComplaintStatuses.CLOSED
  );
  const reopenedComplaints = allComplaints.filter(
    (c) => c.status === ComplaintStatuses.REOPENED
  );
  const emergencyComplaints = allComplaints.filter(
    (c) => c.priority === Priorities.EMERGENCY && c.status !== ComplaintStatuses.CLOSED
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>SLA & High-Urgency Escalation Center</span>
        </h1>
        <p className="text-xs text-slate-500">
          Executive monitoring for SLA breaches, citizen contested reopenings, and emergency cases.
        </p>
      </div>

      {/* Escalation Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-xs font-extrabold uppercase">SLA Breached Tickets</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-red-700 mt-2">{breachedSla.length}</div>
          <span className="text-[11px] text-red-600 mt-1 block">Exceeded resolution targets</span>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-extrabold uppercase">Citizen Reopened</span>
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-rose-700 mt-2">{reopenedComplaints.length}</div>
          <span className="text-[11px] text-rose-600 mt-1 block">Unsatisfied with initial resolution</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-extrabold uppercase">Emergency Tickets</span>
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-800 mt-2">{emergencyComplaints.length}</div>
          <span className="text-[11px] text-amber-700 mt-1 block">Critical public hazards</span>
        </div>
      </div>

      {/* Escalations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Priority Escalation Queue</h2>

        {breachedSla.length === 0 && reopenedComplaints.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No active escalations. All departments operating within target SLAs!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {[...breachedSla, ...reopenedComplaints].map((comp) => (
              <div key={comp.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-civic-700">{comp.ticketId}</span>
                    <PriorityBadge priority={comp.priority} />
                    <StatusBadge status={comp.status} />
                    {comp.slaBreached && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                        SLA Breached
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-900">{comp.title}</div>
                  <div className="text-[11px] text-slate-400">{comp.location.address}</div>
                </div>

                <Link
                  to={`/citizen/ticket/${comp.ticketId || comp.id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-civic-50 text-slate-700 hover:text-civic-700 font-bold inline-flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>Investigate</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
