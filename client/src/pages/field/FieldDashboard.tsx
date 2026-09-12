import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Navigation,
  Play,
  CheckCircle2,
  Camera,
  MapPin,
  Clock,
  AlertCircle,
  PhoneCall,
  ArrowUpRight
} from 'lucide-react';

export const FieldDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTaskModal, setActiveTaskModal] = useState<IComplaint | null>(null);
  const [beforePhotoUrl, setBeforePhotoUrl] = useState(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600'
  );
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1584463699039-446a81bb1a09?w=600'
  );
  const [resolutionNote, setResolutionNote] = useState('');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['field-tasks'],
    queryFn: async () => {
      const res: any = await api.get('/dept/field-tasks');
      return res.data as IComplaint[];
    }
  });

  const startWorkMutation = useMutation({
    mutationFn: async (complaintId: string) => {
      await api.patch(`/complaints/${complaintId}/start-work`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-tasks'] });
    }
  });

  const submitProofMutation = useMutation({
    mutationFn: async ({
      complaintId,
      payload
    }: {
      complaintId: string;
      payload: { beforePhotoUrl: string; afterPhotoUrl: string; resolutionNote: string };
    }) => {
      await api.patch(`/complaints/${complaintId}/resolve`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-tasks'] });
      setActiveTaskModal(null);
      setResolutionNote('');
    }
  });

  if (isLoading) return <LoadingSpinner message="Fetching field work orders..." />;

  const taskList = tasks || [];
  const inProgressTask = taskList.find((t) => t.status === ComplaintStatuses.IN_PROGRESS);
  const pendingTasks = taskList.filter((t) => t.status === ComplaintStatuses.ASSIGNED);
  const completedTasks = taskList.filter(
    (t) => t.status === ComplaintStatuses.AWAITING_VERIFICATION || t.status === ComplaintStatuses.CLOSED
  );

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskModal || !resolutionNote.trim()) return;
    submitProofMutation.mutate({
      complaintId: activeTaskModal.id,
      payload: {
        beforePhotoUrl,
        afterPhotoUrl,
        resolutionNote
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Mobile Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-civic-600 tracking-wider">
            Field Technician
          </span>
          <h1 className="text-lg font-extrabold text-slate-900">{user?.name || 'Worker'}</h1>
          <p className="text-[11px] text-slate-400">ID: {user?.employeeId || 'STAFF-101'}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-amber-700">
          <span className="text-xs font-extrabold">{pendingTasks.length + (inProgressTask ? 1 : 0)}</span>
          <span className="text-[9px] font-bold">Active</span>
        </div>
      </div>

      {/* Active Work In Progress (Primary Action Focus) */}
      {inProgressTask && (
        <div className="bg-sky-50 border-2 border-sky-400 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-200 text-sky-900 animate-pulse">
              Work In Progress Now
            </span>
            <PriorityBadge priority={inProgressTask.priority} />
          </div>

          <div>
            <span className="font-mono text-xs font-bold text-slate-500">{inProgressTask.ticketId}</span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{inProgressTask.title}</h3>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{inProgressTask.location.address}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href={`https://maps.google.com/?q=${inProgressTask.location.coordinates[1]},${inProgressTask.location.coordinates[0]}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors"
            >
              <Navigation className="w-4 h-4 text-civic-600" />
              <span>GPS Map</span>
            </a>

            <button
              onClick={() => {
                setActiveTaskModal(inProgressTask);
                setResolutionNote('Repairs completed and surface restored.');
              }}
              className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete & Submit Proof</span>
            </button>
          </div>
        </div>
      )}

      {/* Pending Tasks Queue */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Assigned Work Orders ({pendingTasks.length})
        </h2>

        {pendingTasks.length === 0 && !inProgressTask ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <span>All tasks completed! Great work.</span>
          </div>
        ) : (
          pendingTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <Link
                  to={`/field/ticket/${task.ticketId || task.id}`}
                  className="font-mono text-xs font-bold text-civic-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>{task.ticketId}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
                <PriorityBadge priority={task.priority} />
              </div>

              <div>
                <Link
                  to={`/field/ticket/${task.ticketId || task.id}`}
                  className="font-bold text-sm text-slate-900 hover:text-civic-600 transition-colors block"
                >
                  {task.title}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">{task.location.address}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`https://maps.google.com/?q=${task.location.coordinates[1]},${task.location.coordinates[0]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <Navigation className="w-4 h-4 text-civic-600" />
                </a>

                <Button
                  size="md"
                  variant="primary"
                  className="flex-1 gap-1.5 font-bold"
                  isLoading={startWorkMutation.isPending}
                  onClick={() => startWorkMutation.mutate(task.id)}
                >
                  <Play className="w-4 h-4" />
                  <span>Start Work On Site</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Proof Submission Modal */}
      {activeTaskModal && (
        <Modal
          isOpen={!!activeTaskModal}
          onClose={() => setActiveTaskModal(null)}
          title={`Upload Resolution Proof: ${activeTaskModal.ticketId}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitProof} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800">{activeTaskModal.title}</span>
              <p className="text-slate-500 mt-0.5">{activeTaskModal.location.address}</p>
            </div>

            {/* Before Photo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Before Photo (Original Issue Proof) <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={beforePhotoUrl}
                onChange={(e) => setBeforePhotoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            {/* After Photo */}
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                After Photo (Resolved State Proof) <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={afterPhotoUrl}
                onChange={(e) => setAfterPhotoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none ring-2 ring-emerald-500/20"
              />
            </div>

            {/* Resolution Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resolution Note <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Explain the work performed (e.g. Pothole backfilled with bitumen and compacted)..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTaskModal(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                size="md"
                className="font-bold gap-1.5"
                isLoading={submitProofMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Proof & Finish</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
