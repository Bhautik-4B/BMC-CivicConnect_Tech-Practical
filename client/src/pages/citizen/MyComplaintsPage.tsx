import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { TicketCard } from '../../components/ticket/TicketCard.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PriorityBadge } from '../../components/common/PriorityBadge.js';
import { ResolutionVerificationModal } from '../../components/ticket/ResolutionVerificationModal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { IComplaint, ComplaintStatuses } from '@bmc/shared';
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyComplaintsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'resolved'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [search, setSearch] = useState('');
  const [selectedForVerification, setSelectedForVerification] = useState<IComplaint | null>(null);

  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: async () => {
      const res: any = await api.get('/complaints/my');
      return res.data as IComplaint[];
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      id,
      isResolved,
      payload
    }: {
      id: string;
      isResolved: boolean;
      payload?: { reopenReason?: string; reopenPhotoUrl?: string };
    }) => {
      await api.patch(`/complaints/${id}/verify`, {
        isResolved,
        reopenReason: payload?.reopenReason,
        reopenPhotoUrl: payload?.reopenPhotoUrl
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-complaints'] });
    }
  });

  const complaints = complaintsData || [];

  const filtered = complaints.filter((c) => {
    if (activeTab === 'active') {
      if (c.status === ComplaintStatuses.CLOSED || c.status === ComplaintStatuses.REJECTED)
        return false;
    } else if (activeTab === 'resolved') {
      if (c.status !== ComplaintStatuses.CLOSED && c.status !== ComplaintStatuses.RESOLVED)
        return false;
    }

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
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">My Reported Complaints</h1>
          <p className="text-xs text-slate-500">
            Real-time tracking of all civic issues submitted to Bhavnagar Municipal Corporation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ticket or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
            />
          </div>

          {/* Table / Card View Switcher */}
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-civic-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Grid Card View"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-white text-civic-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shrink-0 ${
            activeTab === 'all'
              ? 'bg-civic-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Complaints ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shrink-0 ${
            activeTab === 'active'
              ? 'bg-civic-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active / In Progress (
          {
            complaints.filter(
              (c) => c.status !== ComplaintStatuses.CLOSED && c.status !== ComplaintStatuses.REJECTED
            ).length
          }
          )
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shrink-0 ${
            activeTab === 'resolved'
              ? 'bg-civic-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Resolved & Closed (
          {complaints.filter((c) => c.status === ComplaintStatuses.CLOSED).length}
          )
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Fetching your tickets..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <span>No complaints found matching current filters.</span>
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Civic Complaints Data Table */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Ticket ID</th>
                  <th className="px-5 py-3.5 font-bold">Issue & Location</th>
                  <th className="px-5 py-3.5 font-bold">Ward</th>
                  <th className="px-5 py-3.5 font-bold">Department</th>
                  <th className="px-5 py-3.5 font-bold">Priority</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((comp) => {
                  const isAwaiting = comp.status === ComplaintStatuses.AWAITING_VERIFICATION;
                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-civic-700">
                        {comp.ticketId}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{comp.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 max-w-xs truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{comp.location.address}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        {comp.wardName || `Ward ${comp.wardNumber || '5'}`}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {comp.assignedDepartmentName || 'Under Triage'}
                      </td>
                      <td className="px-5 py-3.5">
                        <PriorityBadge priority={comp.priority} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={comp.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isAwaiting ? (
                          <button
                            onClick={() => setSelectedForVerification(comp)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify Proof</span>
                          </button>
                        ) : (
                          <Link
                            to={`/citizen/ticket/${comp.ticketId || comp.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-civic-50 text-slate-700 hover:text-civic-700 font-bold transition-colors"
                          >
                            <span>Timeline</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <TicketCard
              key={item.id}
              complaint={item}
              baseLink="/citizen/ticket"
              onVerifyClick={(comp) => setSelectedForVerification(comp)}
            />
          ))}
        </div>
      )}

      {/* Verification Modal */}
      {selectedForVerification && (
        <ResolutionVerificationModal
          isOpen={!!selectedForVerification}
          onClose={() => setSelectedForVerification(null)}
          complaint={selectedForVerification}
          onVerify={async (isResolved, payload) => {
            await verifyMutation.mutateAsync({
              id: selectedForVerification.id,
              isResolved,
              payload
            });
          }}
        />
      )}
    </div>
  );
};
