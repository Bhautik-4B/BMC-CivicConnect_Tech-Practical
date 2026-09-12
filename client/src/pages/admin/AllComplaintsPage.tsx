import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PriorityBadge } from '../../components/common/PriorityBadge.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Modal } from '../../components/common/Modal.js';
import { Button } from '../../components/common/Button.js';
import {
  IComplaint,
  IDepartment,
  IWard,
  ComplaintStatuses,
  Priorities
} from '@bmc/shared';
import { Search, Filter, UserCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AllComplaintsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  // Assign Modal State
  const [complaintToAssign, setComplaintToAssign] = useState<IComplaint | null>(null);
  const [targetDeptId, setTargetDeptId] = useState<string>('');
  const [targetPriority, setTargetPriority] = useState<string>('');

  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ['all-complaints', selectedStatus, selectedPriority, selectedDeptId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (selectedDeptId) params.append('departmentId', selectedDeptId);

      const res: any = await api.get(`/admin/complaints?${params.toString()}`);
      return res.data as IComplaint[];
    }
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res: any = await api.get('/admin/departments');
      return res.data as IDepartment[];
    }
  });

  const assignMutation = useMutation({
    mutationFn: async ({
      id,
      departmentId,
      priority
    }: {
      id: string;
      departmentId: string;
      priority?: string;
    }) => {
      await api.patch(`/complaints/${id}/assign`, {
        departmentId,
        priority: priority || undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-complaints'] });
      setComplaintToAssign(null);
    }
  });

  const complaints = complaintsData || [];
  const departments = departmentsData || [];

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

  const handleOpenAssignModal = (complaint: IComplaint) => {
    setComplaintToAssign(complaint);
    setTargetDeptId(complaint.assignedDepartmentId || departments[0]?.id || '');
    setTargetPriority(complaint.priority);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintToAssign || !targetDeptId) return;
    assignMutation.mutate({
      id: complaintToAssign.id,
      departmentId: targetDeptId,
      priority: targetPriority
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">City Complaint Master Center</h1>
          <p className="text-xs text-slate-500">
            Triage, assign, and monitor all registered tickets across Bhavnagar city wards.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ticket ID or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none"
        >
          <option value="">All Statuses</option>
          {Object.values(ComplaintStatuses).map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none"
        >
          <option value="">All Priorities</option>
          {Object.values(Priorities).map((pr) => (
            <option key={pr} value={pr}>
              {pr}
            </option>
          ))}
        </select>

        {/* Department Filter */}
        <select
          value={selectedDeptId}
          onChange={(e) => setSelectedDeptId(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        {(selectedStatus || selectedPriority || selectedDeptId || search) && (
          <button
            onClick={() => {
              setSelectedStatus('');
              setSelectedPriority('');
              setSelectedDeptId('');
              setSearch('');
            }}
            className="text-xs text-red-600 font-semibold hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Complaints Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading complaints catalog..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          No complaints found matching current filters.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Ticket ID</th>
                  <th className="px-5 py-3.5 font-bold">Issue Title</th>
                  <th className="px-5 py-3.5 font-bold">Ward</th>
                  <th className="px-5 py-3.5 font-bold">Department</th>
                  <th className="px-5 py-3.5 font-bold">Priority</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold text-right">Actions</th>
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
                      <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                        {comp.location.address}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
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
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenAssignModal(comp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-civic-50 hover:bg-civic-100 text-civic-700 font-semibold"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>
                      <Link
                        to={`/citizen/ticket/${comp.ticketId || comp.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        <span>Details</span>
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

      {/* Assign / Triage Modal */}
      {complaintToAssign && (
        <Modal
          isOpen={!!complaintToAssign}
          onClose={() => setComplaintToAssign(null)}
          title={`Assign Department: ${complaintToAssign.ticketId}`}
        >
          <form onSubmit={handleConfirmAssign} className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Issue Description
              </span>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {complaintToAssign.title} — {complaintToAssign.description}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Department <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={targetDeptId}
                onChange={(e) => setTargetDeptId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority & SLA</label>
              <select
                value={targetPriority}
                onChange={(e) => setTargetPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
              >
                {Object.values(Priorities).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setComplaintToAssign(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={assignMutation.isPending}>
                Save Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
