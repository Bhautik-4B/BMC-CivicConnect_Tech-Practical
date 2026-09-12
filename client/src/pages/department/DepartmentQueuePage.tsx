import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PriorityBadge } from '../../components/common/PriorityBadge.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { IComplaint, ComplaintStatuses } from '@bmc/shared';
import { Search, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DepartmentQueuePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: queue, isLoading } = useQuery({
    queryKey: ['dept-queue-full', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
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
        c.location.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Department Complaint Queue</h1>
          <p className="text-xs text-slate-500">Full inventory of tasks allocated to your department.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading queue..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          No complaints found in this department queue.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Ticket ID</th>
                  <th className="px-5 py-3.5 font-bold">Title</th>
                  <th className="px-5 py-3.5 font-bold">Ward</th>
                  <th className="px-5 py-3.5 font-bold">Assigned Staff</th>
                  <th className="px-5 py-3.5 font-bold">Priority</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-civic-700">{comp.ticketId}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{comp.title}</td>
                    <td className="px-5 py-3.5 text-slate-600">Ward {comp.wardNumber || '5'}</td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {comp.assignedFieldStaffName || (
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
                        to={`/citizen/ticket/${comp.ticketId || comp.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
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
