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
import { Inbox, Users, AlertTriangle, CheckCircle2, ArrowRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DepartmentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

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
    mutationFn: async ({ complaintId, fieldStaffId }: { complaintId: string; fieldStaffId: string }) => {
      await api.patch(`/complaints/${complaintId}/assign`, {
        departmentId: user?.departmentId,
        fieldStaffId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dept-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dept-staff'] });
      setDispatchModalComplaint(null);
    }
  });

  if (isQueueLoading || isStaffLoading) {
    return <LoadingSpinner message="Loading departmental queue..." />;
  }

  const complaints = queue || [];
  const staff = staffList || [];

  const newComplaints = complaints.filter((c) => c.status === ComplaintStatuses.SUBMITTED || c.status === ComplaintStatuses.ASSIGNED && !c.assignedFieldStaffId);
  const inProgress = complaints.filter((c) => c.status === ComplaintStatuses.IN_PROGRESS);
  const awaitingVerification = complaints.filter((c) => c.status === ComplaintStatuses.AWAITING_VERIFICATION);
  const overdue = complaints.filter((c) => c.slaBreached && c.status !== ComplaintStatuses.CLOSED);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase text-civic-600 tracking-wider">Department Operations</span>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            {user?.name || 'Department Officer'}
          </h1>
          <p className="text-xs text-slate-500">
            Manage worker assignments, track real-time resolution proof, and prevent SLA breaches.
          </p>
        </div>
        <Link
          to="/dept/queue"
          className="inline-flex items-center gap-2 px-4 py-2 bg-civic-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-civic-700 transition-colors shrink-0"
        >
          <span>Full Ticket Queue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Pending Dispatch</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{newComplaints.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">In Progress</span>
          <div className="text-2xl font-extrabold text-sky-600 mt-1">{inProgress.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Awaiting Verification</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{awaitingVerification.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Overdue (SLA Breached)</span>
          <div className="text-2xl font-extrabold text-red-600 mt-1">{overdue.length}</div>
        </div>
      </div>

      {/* Grid: Pending Dispatch Queue & Field Staff Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Unassigned / Priority Tickets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-civic-600" />
              <span>Complaints Requiring Field Staff Dispatch</span>
            </h2>

            {complaints.length === 0 ? (
              <p className="text-xs text-slate-400">No complaints in queue.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {complaints.slice(0, 6).map((comp) => (
                  <div key={comp.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-civic-700">
                          {comp.ticketId}
                        </span>
                        <PriorityBadge priority={comp.priority} />
                        <StatusBadge status={comp.status} />
                      </div>
                      <div className="text-xs font-bold text-slate-800">{comp.title}</div>
                      <div className="text-[11px] text-slate-400">{comp.location.address}</div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Field Worker Availability & Workload */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-civic-600" />
              <span>Field Worker Roster & Workload</span>
            </h2>

            <div className="space-y-3">
              {staff.map((worker) => (
                <div key={worker.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{worker.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        worker.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {worker.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>Active: {worker.activeTasks}</span>
                    <span>Completed: {worker.completedTasks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Issue</span>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {dispatchModalComplaint.title}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Technician / Field Worker <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
              >
                {staff.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} — {st.activeTasks} Active Tasks
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
