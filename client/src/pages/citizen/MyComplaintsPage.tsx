import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { TicketCard } from '../../components/ticket/TicketCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { IComplaint, ComplaintStatuses } from '@bmc/shared';
import { Search, Filter, ListOrdered } from 'lucide-react';

export const MyComplaintsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'resolved'>('all');
  const [search, setSearch] = useState('');

  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: async () => {
      const res: any = await api.get('/complaints/my');
      return res.data as IComplaint[];
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">My Complaints</h1>
          <p className="text-xs text-slate-500">Track and manage all your reported civic complaints.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ticket ID or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-civic-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
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
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
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
          No complaints found matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <TicketCard key={item.id} complaint={item} baseLink="/citizen/ticket" />
          ))}
        </div>
      )}
    </div>
  );
};
