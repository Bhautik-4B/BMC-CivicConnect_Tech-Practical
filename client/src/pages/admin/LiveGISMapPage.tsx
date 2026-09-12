import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { GISMap } from '../../components/maps/GISMap.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PriorityBadge } from '../../components/common/PriorityBadge.js';
import { IComplaint, IWard, ComplaintStatuses, Priorities } from '@bmc/shared';
import { Layers, MapPin, AlertCircle, ArrowUpRight, Flame, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LiveGISMapPage: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'EMERGENCY' | 'OVERDUE' | 'IN_PROGRESS'>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<IComplaint | null>(null);

  const { data: complaintsData, isLoading: isComplaintsLoading } = useQuery({
    queryKey: ['all-complaints'],
    queryFn: async () => {
      const res: any = await api.get('/admin/complaints');
      return res.data as IComplaint[];
    }
  });

  const { data: wardsData, isLoading: isWardsLoading } = useQuery({
    queryKey: ['wards'],
    queryFn: async () => {
      const res: any = await api.get('/admin/wards');
      return res.data as IWard[];
    }
  });

  if (isComplaintsLoading || isWardsLoading) {
    return <LoadingSpinner message="Loading GIS spatial data & Ward boundaries..." />;
  }

  const allComplaints = complaintsData || [];
  const wards = wardsData || [];

  const filteredComplaints = allComplaints.filter((c) => {
    if (filterMode === 'EMERGENCY') return c.priority === Priorities.EMERGENCY || c.priority === Priorities.HIGH;
    if (filterMode === 'OVERDUE') return c.slaBreached && c.status !== ComplaintStatuses.CLOSED;
    if (filterMode === 'IN_PROGRESS') return c.status === ComplaintStatuses.IN_PROGRESS;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-civic-600" />
            <span>Live City GIS Spatial Map</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time geospatial tracking with Ward boundary containment and duplicate monitoring.
          </p>
        </div>

        {/* Layer Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'ALL'
                ? 'bg-civic-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({allComplaints.length})
          </button>
          <button
            onClick={() => setFilterMode('EMERGENCY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'EMERGENCY'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            High & Emergency
          </button>
          <button
            onClick={() => setFilterMode('OVERDUE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'OVERDUE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            SLA Overdue
          </button>
        </div>
      </div>

      {/* Map + Detail Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <GISMap
            complaints={filteredComplaints}
            wards={wards}
            height="620px"
            baseLink="/admin/ticket"
            onMarkerClick={(comp) => setSelectedComplaint(comp)}
          />
        </div>

        {/* Selected Complaint Side Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 min-h-[400px]">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Selected Ticket Inspector
            </h2>

            {selectedComplaint ? (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-civic-800 bg-civic-50 px-2 py-0.5 rounded-lg border border-civic-200">
                    {selectedComplaint.ticketId}
                  </span>
                  <PriorityBadge priority={selectedComplaint.priority} />
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">{selectedComplaint.title}</h3>
                <p className="text-slate-600">{selectedComplaint.description}</p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedComplaint.location.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Department:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {selectedComplaint.assignedDepartmentName || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Ward:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {selectedComplaint.wardName || `Ward ${selectedComplaint.wardNumber || '5'}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>{' '}
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    to={`/admin/ticket/${selectedComplaint.ticketId || selectedComplaint.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-civic-600 hover:bg-civic-700 text-white rounded-xl font-bold transition-colors"
                  >
                    <span>Inspect Full Timeline</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 p-4">
                <MapPin className="w-8 h-8 mb-2 text-slate-300" />
                <p className="text-xs">
                  Click on any map marker or ward boundary to inspect live ticket details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
