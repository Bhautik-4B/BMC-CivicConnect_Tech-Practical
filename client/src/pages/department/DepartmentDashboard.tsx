import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PriorityBadge } from '../../components/common/PriorityBadge.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Modal } from '../../components/common/Modal.js';
import { Button } from '../../components/common/Button.js';
import { IComplaint, ComplaintStatuses, Priorities } from '@bmc/shared';
import {
  Inbox,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  ArrowUpRight,
  Clock,
  ShieldAlert,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DepartmentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'DISPATCH_QUEUE' | 'STAFF_ROSTER'>('DISPATCH_QUEUE');
  const [search, setSearch] = useState('');
  const [dispatchModalComplaint, setDispatchModalComplaint] = useState<IComplaint | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  const { data: queue, isLoading: isQueueLoading } = useQuery({
    queryKey: ['dept-queue'],
    queryFn: async () => {
      const res: any = await api.get('/dept/queue');
      return res.data as IComplaint[];
    }
  });

  const { data: staffList, isLoading: isStaffLoading } = useQuery({
    queryKey: ['dept-staff'],
    queryFn: async () => {
      const res: any = await api.get('/dept/staff');
      return res.data as any[];
    }
  });

  const assignStaffMutation = useMutation({
    mutationFn: async ({
      complaintId,
      fieldStaffId
    }: {
      complaintId: string;
      fieldStaffId: string;
    }) => {
      await api.patch(`/complaints/${complaintId}/assign`, {
        departmentId: user?.departmentId,
        fieldStaffId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dept-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dept-staff'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint'] });
      setDispatchModalComplaint(null);
    }
  });

  if (isQueueLoading || isStaffLoading) {
    return <LoadingSpinner message="Loading departmental queue & field staff roster..." />;
  }

  const complaints = queue || [];
  const staff = staffList || [];

  const unassignedComplaints = complaints.filter(
    (c) =>
      c.status === ComplaintStatuses.SUBMITTED ||
      (c.status === ComplaintStatuses.ASSIGNED && !c.assignedFieldStaffId)
  );
  const inProgress = complaints.filter((c) => c.status === ComplaintStatuses.IN_PROGRESS);
  const awaitingVerification = complaints.filter(
    (c) => c.status === ComplaintStatuses.AWAITING_VERIFICATION
  );
  const overdue = complaints.filter((c) => c.slaBreached && c.status !== ComplaintStatuses.CLOSED);

  const filteredQueue = complaints.filter((c) => {
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

  const filteredStaff = staff.filter((st) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        st.name?.toLowerCase().includes(q) ||
        st.employeeId?.toLowerCase().includes(q) ||
        st.phoneNumber?.includes(q)
      );
    }
    return true;
  });

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalComplaint || !selectedStaffId) return;
    assignStaffMutation.mutate({
      complaintId: dispatchModalComplaint.id,
      fieldStaffId: selectedStaffId
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase text-civic-600 tracking-wider">
            Department Operations & Dispatch Center
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            {user?.name || 'Department Officer'}
          </h1>
          <p className="text-xs text-slate-500">
            Dispatch field technicians, monitor real-time SLA compliance, and verify resolved work orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dept/queue"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-civic-600 hover:bg-civic-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <span>Full Ticket Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Pending Dispatch</span>
            <Inbox className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{unassignedComplaints.length}</div>
          <span className="text-[10px] text-slate-400">Needs field worker</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">In Progress</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-600">{inProgress.length}</div>
          <span className="text-[10px] text-slate-400">Work in field</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Awaiting Verification</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{awaitingVerification.length}</div>
          <span className="text-[10px] text-amber-600 font-semibold">Proof uploaded</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">SLA Breached</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-600">{overdue.length}</div>
          <span className="text-[10px] text-red-500 font-bold">Urgent action</span>
        </div>
      </div>

      {/* Main Section with Tab Switcher & Search */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs & Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('DISPATCH_QUEUE')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'DISPATCH_QUEUE'
                  ? 'bg-civic-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Complaints Dispatch Queue</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'DISPATCH_QUEUE'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {complaints.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('STAFF_ROSTER')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'STAFF_ROSTER'
                  ? 'bg-civic-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Field Staff Workload & Availability</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'STAFF_ROSTER'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {staff.length}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={
                activeTab === 'DISPATCH_QUEUE'
                  ? 'Search tickets or address...'
                  : 'Search staff by name or ID...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* Tab 1: Dispatch Queue Table */}
        {activeTab === 'DISPATCH_QUEUE' && (
          <div className="overflow-x-auto">
            {filteredQueue.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No complaints found in the departmental queue.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Ticket ID</th>
                    <th className="px-5 py-3.5 font-bold">Issue Title & Address</th>
                    <th className="px-5 py-3.5 font-bold">Ward</th>
                    <th className="px-5 py-3.5 font-bold">Assigned Staff</th>
                    <th className="px-5 py-3.5 font-bold">Priority</th>
                    <th className="px-5 py-3.5 font-bold">Status</th>
                    <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.map((comp) => (
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
                      <td className="px-5 py-3.5">
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
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setDispatchModalComplaint(comp);
                            setSelectedStaffId(staff[0]?.id || '');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-civic-600 hover:bg-civic-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Dispatch</span>
                        </button>
                        <Link
                          to={`/dept/ticket/${comp.ticketId || comp.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Field Staff Workload & Availability Table */}
        {activeTab === 'STAFF_ROSTER' && (
          <div className="overflow-x-auto">
            {filteredStaff.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No field staff registered for this department.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Staff Member</th>
                    <th className="px-5 py-3.5 font-bold">Employee ID</th>
                    <th className="px-5 py-3.5 font-bold">Availability Status</th>
                    <th className="px-5 py-3.5 font-bold">Active Tasks</th>
                    <th className="px-5 py-3.5 font-bold">Completed Tasks</th>
                    <th className="px-5 py-3.5 font-bold text-right">Direct Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((worker) => (
                    <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-civic-100 text-civic-800 font-bold flex items-center justify-center text-xs">
                            {worker.name?.charAt(0) || 'W'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{worker.name}</div>
                            <div className="text-[11px] text-slate-400">{worker.phoneNumber || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600 font-medium">
                        {worker.employeeId || 'STAFF-101'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                            worker.isAvailable
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              worker.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          ></span>
                          <span>{worker.isAvailable ? 'Available for Work' : 'Busy On-Site'}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                          {worker.activeTasks || 0} active
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-emerald-700">
                        <span className="px-2.5 py-1 bg-emerald-50 rounded-lg text-emerald-700">
                          {worker.completedTasks || 0} resolved
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {unassignedComplaints.length > 0 ? (
                          <button
                            onClick={() => {
                              setDispatchModalComplaint(unassignedComplaints[0]);
                              setSelectedStaffId(worker.id);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-civic-50 hover:bg-civic-100 text-civic-700 border border-civic-200 rounded-xl text-xs font-bold transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Assign Pending Ticket</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No pending tickets</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Dispatch Modal */}
      {dispatchModalComplaint && (
        <Modal
          isOpen={!!dispatchModalComplaint}
          onClose={() => setDispatchModalComplaint(null)}
          title={`Dispatch Field Worker: ${dispatchModalComplaint.ticketId}`}
        >
          <form onSubmit={handleDispatch} className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Issue Details</span>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <div className="font-bold text-slate-900">{dispatchModalComplaint.title}</div>
                <div className="text-slate-500">{dispatchModalComplaint.location?.address}</div>
                <div className="flex items-center gap-2 pt-1">
                  <PriorityBadge priority={dispatchModalComplaint.priority} />
                  <StatusBadge status={dispatchModalComplaint.status} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Technician / Field Worker <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white font-medium"
              >
                {staff.map((st) => (
                  <option key={st.id || st._id} value={st.id || st._id}>
                    {st.name} ({st.employeeId || 'Staff'}) — {st.activeTasks || 0} Active Tasks
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDispatchModalComplaint(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={assignStaffMutation.isPending}>
                Confirm Dispatch
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
