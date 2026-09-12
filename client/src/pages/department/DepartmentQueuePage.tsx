import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PriorityBadge } from '../../components/common/PriorityBadge.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { IComplaint, ComplaintStatuses, Priorities } from '@bmc/shared';
import { Search, ArrowUpRight, Filter, Inbox, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DepartmentQueuePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data: queue, isLoading } = useQuery({
    queryKey: ['dept-queue-full', statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      const res: any = await api.get(`/dept/queue?${params.toString()}`);
      return res.data as IComplaint[];
    }
  });

  const complaints = queue || [];
  const filtered = complaints.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.ticketId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q) ||
        (c.assignedFieldStaffName && c.assignedFieldStaffName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/dept"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-civic-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dispatch Operations</span>
            </Link>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-civic-600" />
            <span>Department Full Complaint Queue</span>
          </h1>
          <p className="text-xs text-slate-500">
            Complete inventory of civic work orders and complaints allocated to your department.
          </p>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 font-bold text-slate-700 mr-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filter Status:</span>
          </div>

          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === ''
                ? 'bg-civic-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({complaints.length})
          </button>

          <button
            onClick={() => setStatusFilter(ComplaintStatuses.ASSIGNED)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === ComplaintStatuses.ASSIGNED
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Pending Dispatch
          </button>

          <button
            onClick={() => setStatusFilter(ComplaintStatuses.IN_PROGRESS)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === ComplaintStatuses.IN_PROGRESS
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            In Progress
          </button>

          <button
            onClick={() => setStatusFilter(ComplaintStatuses.AWAITING_VERIFICATION)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === ComplaintStatuses.AWAITING_VERIFICATION
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Awaiting Verification
          </button>

          <button
            onClick={() => setStatusFilter(ComplaintStatuses.CLOSED)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === ComplaintStatuses.CLOSED
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Closed
          </button>

          {/* Priority dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none font-medium ml-2"
          >
            <option value="">All Priorities</option>
            {Object.values(Priorities).map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tickets, staff, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading department queue..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          No complaints found in this department queue matching current filters.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Ticket ID</th>
                  <th className="px-5 py-3.5 font-bold">Title & Location</th>
                  <th className="px-5 py-3.5 font-bold">Ward</th>
                  <th className="px-5 py-3.5 font-bold">Assigned Staff</th>
                  <th className="px-5 py-3.5 font-bold">Priority</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-civic-700">
                      {comp.ticketId}
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
                      {comp.assignedFieldStaffName ? (
                        <span className="font-semibold text-slate-800">
                          {comp.assignedFieldStaffName}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Unassigned
                        </span>
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
                        to={`/citizen/ticket/${comp.ticketId || comp.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-civic-50 hover:bg-civic-100 text-civic-700 font-bold transition-colors"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
