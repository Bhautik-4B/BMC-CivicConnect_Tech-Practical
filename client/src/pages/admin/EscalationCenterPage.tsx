import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PriorityBadge } from '../../components/common/PriorityBadge.js';
import { IComplaint, ComplaintStatuses, Priorities } from '@bmc/shared';
import {
  AlertTriangle,
  Flame,
  RotateCcw,
  ArrowUpRight,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EscalationCenterPage: React.FC = () => {
  const [filterType, setFilterType] = useState<'ALL' | 'SLA' | 'REOPENED' | 'EMERGENCY'>('ALL');
  const [search, setSearch] = useState('');

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

  // Combined escalations pool
  const allEscalated = allComplaints.filter(
    (c) =>
      (c.slaBreached && c.status !== ComplaintStatuses.CLOSED) ||
      c.status === ComplaintStatuses.REOPENED ||
      (c.priority === Priorities.EMERGENCY && c.status !== ComplaintStatuses.CLOSED)
  );

  const filteredEscalations = allEscalated.filter((comp) => {
    // Filter type
    if (filterType === 'SLA' && (!comp.slaBreached || comp.status === ComplaintStatuses.CLOSED))
      return false;
    if (filterType === 'REOPENED' && comp.status !== ComplaintStatuses.REOPENED) return false;
    if (
      filterType === 'EMERGENCY' &&
      (comp.priority !== Priorities.EMERGENCY || comp.status === ComplaintStatuses.CLOSED)
    )
      return false;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        comp.ticketId.toLowerCase().includes(q) ||
        comp.title.toLowerCase().includes(q) ||
        comp.location.address.toLowerCase().includes(q) ||
        (comp.assignedDepartmentName && comp.assignedDepartmentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase text-red-600 tracking-wider">
            City Incident Escalation Protocol
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-1">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span>SLA & High-Urgency Escalation Center</span>
          </h1>
          <p className="text-xs text-slate-500">
            Executive monitoring for SLA breaches, citizen contested reopenings, and emergency cases.
          </p>
        </div>
      </div>

      {/* Escalation Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterType('SLA')}
          className={`cursor-pointer bg-red-50 border rounded-3xl p-5 shadow-xs transition-all ${
            filterType === 'SLA' ? 'ring-2 ring-red-500 border-red-500' : 'border-red-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between text-red-700">
            <span className="text-xs font-extrabold uppercase">SLA Breached Tickets</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-red-700 mt-2">{breachedSla.length}</div>
          <span className="text-[11px] text-red-600 mt-1 block font-medium">Exceeded resolution targets</span>
        </div>

        <div
          onClick={() => setFilterType('REOPENED')}
          className={`cursor-pointer bg-rose-50 border rounded-3xl p-5 shadow-xs transition-all ${
            filterType === 'REOPENED'
              ? 'ring-2 ring-rose-500 border-rose-500'
              : 'border-rose-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-extrabold uppercase">Citizen Reopened</span>
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-rose-700 mt-2">{reopenedComplaints.length}</div>
          <span className="text-[11px] text-rose-600 mt-1 block font-medium">
            Unsatisfied with resolution proof
          </span>
        </div>

        <div
          onClick={() => setFilterType('EMERGENCY')}
          className={`cursor-pointer bg-amber-50 border rounded-3xl p-5 shadow-xs transition-all ${
            filterType === 'EMERGENCY'
              ? 'ring-2 ring-amber-500 border-amber-500'
              : 'border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-extrabold uppercase">Emergency Hazards</span>
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-800 mt-2">{emergencyComplaints.length}</div>
          <span className="text-[11px] text-amber-700 mt-1 block font-medium">
            Critical public hazards & safety
          </span>
        </div>
      </div>

      {/* Escalations Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Pills & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Escalations ({allEscalated.length})
            </button>
            <button
              onClick={() => setFilterType('SLA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'SLA'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
              }`}
            >
              SLA Breached ({breachedSla.length})
            </button>
            <button
              onClick={() => setFilterType('REOPENED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'REOPENED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              Citizen Reopened ({reopenedComplaints.length})
            </button>
            <button
              onClick={() => setFilterType('EMERGENCY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'EMERGENCY'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              Emergency ({emergencyComplaints.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search escalated tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* High Density Table */}
        <div className="overflow-x-auto">
          {filteredEscalations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>No active escalations found under current criteria.</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Ticket ID & Trigger</th>
                  <th className="px-5 py-3.5 font-bold">Issue Title & Location</th>
                  <th className="px-5 py-3.5 font-bold">Ward</th>
                  <th className="px-5 py-3.5 font-bold">Department</th>
                  <th className="px-5 py-3.5 font-bold">Priority</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold text-right">Investigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEscalations.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-civic-700">{comp.ticketId}</div>
                      <div className="mt-1 flex items-center gap-1">
                        {comp.slaBreached && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            SLA Breached
                          </span>
                        )}
                        {comp.status === ComplaintStatuses.REOPENED && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                            Reopened
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{comp.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[260px]">
                        {comp.location.address}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      {comp.wardName || `Ward ${comp.wardNumber || '5'}`}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {comp.assignedDepartmentName || (
                        <span className="text-amber-600 font-bold">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={comp.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={comp.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/ticket/${comp.ticketId || comp.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-civic-50 hover:bg-civic-100 text-civic-700 font-bold transition-colors"
                      >
                        <span>Investigate</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
