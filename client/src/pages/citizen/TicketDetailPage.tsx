import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PriorityBadge } from '../../components/common/PriorityBadge.js';
import { TicketTimeline } from '../../components/ticket/TicketTimeline.js';
import { ProofViewer } from '../../components/ticket/ProofViewer.js';
import { ResolutionVerificationModal } from '../../components/ticket/ResolutionVerificationModal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Modal } from '../../components/common/Modal.js';
import { Button } from '../../components/common/Button.js';
import {
  IComplaint,
  IAuditLogEntry,
  IDepartment,
  ComplaintStatuses,
  Priorities,
  UserRoles
} from '@bmc/shared';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserPlus,
  Play,
  Camera,
  Navigation,
  RotateCcw,
  Building2
} from 'lucide-react';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Modals state
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isAdminAssignModalOpen, setIsAdminAssignModalOpen] = useState(false);
  const [isDeptDispatchModalOpen, setIsDeptDispatchModalOpen] = useState(false);
  const [isFieldProofModalOpen, setIsFieldProofModalOpen] = useState(false);

  // Modal form states
  const [targetDeptId, setTargetDeptId] = useState('');
  const [targetPriority, setTargetPriority] = useState('');
  const [targetStaffId, setTargetStaffId] = useState('');
  const [fieldBeforePhoto, setFieldBeforePhoto] = useState(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600'
  );
  const [fieldAfterPhoto, setFieldAfterPhoto] = useState(
    'https://images.unsplash.com/photo-1584463699039-446a81bb1a09?w=600'
  );
  const [fieldResolutionNote, setFieldResolutionNote] = useState('');

  // Fetch Complaint & Audit Logs
  const { data, isLoading, error } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const res: any = await api.get(`/complaints/${id}`);
      return res.data as { complaint: IComplaint; auditLogs: IAuditLogEntry[] };
    },
    enabled: !!id
  });

  // Fetch Departments for Admin assignment
  const { data: departments } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: async () => {
      const res: any = await api.get('/admin/departments');
      return res.data as IDepartment[];
    },
    enabled: user?.role === UserRoles.BMC_ADMIN
  });

  // Fetch Staff for Department dispatch
  const { data: staffList } = useQuery({
    queryKey: ['dept-staff'],
    queryFn: async () => {
      const res: any = await api.get('/dept/staff');
      return res.data as any[];
    },
    enabled:
      user?.role === UserRoles.DEPT_OFFICER ||
      user?.role === UserRoles.DEPT_SUPERVISOR ||
      user?.role === UserRoles.BMC_ADMIN
  });

  // Citizen Verification Mutation
  const verifyMutation = useMutation({
    mutationFn: async ({
      isResolved,
      payload
    }: {
      isResolved: boolean;
      payload?: { reopenReason?: string; reopenPhotoUrl?: string };
    }) => {
      if (!data?.complaint?.id) return;
      await api.patch(`/complaints/${data.complaint.id}/verify`, {
        isResolved,
        reopenReason: payload?.reopenReason,
        reopenPhotoUrl: payload?.reopenPhotoUrl
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['my-complaints'] });
    }
  });

  // Admin / Dept Assignment Mutation
  const assignMutation = useMutation({
    mutationFn: async ({
      departmentId,
      fieldStaffId,
      priority
    }: {
      departmentId?: string;
      fieldStaffId?: string;
      priority?: string;
    }) => {
      if (!data?.complaint?.id) return;
      await api.patch(`/complaints/${data.complaint.id}/assign`, {
        departmentId,
        fieldStaffId,
        priority
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['all-complaints'] });
      queryClient.invalidateQueries({ queryKey: ['dept-queue'] });
      setIsAdminAssignModalOpen(false);
      setIsDeptDispatchModalOpen(false);
    }
  });

  // Field Staff: Start Work Mutation
  const startWorkMutation = useMutation({
    mutationFn: async () => {
      if (!data?.complaint?.id) return;
      await api.patch(`/complaints/${data.complaint.id}/start-work`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['field-tasks'] });
    }
  });

  // Field Staff: Resolve / Proof Mutation
  const resolveMutation = useMutation({
    mutationFn: async (payload: {
      beforePhotoUrl: string;
      afterPhotoUrl: string;
      resolutionNote: string;
    }) => {
      if (!data?.complaint?.id) return;
      await api.patch(`/complaints/${data.complaint.id}/resolve`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['field-tasks'] });
      setIsFieldProofModalOpen(false);
      setFieldResolutionNote('');
    }
  });

  if (isLoading) return <LoadingSpinner message="Loading ticket details & audit history..." />;
  if (error || !data) {
    const fallbackLink =
      user?.role === UserRoles.BMC_ADMIN
        ? '/admin/complaints'
        : user?.role === UserRoles.DEPT_OFFICER || user?.role === UserRoles.DEPT_SUPERVISOR
        ? '/dept/queue'
        : user?.role === UserRoles.FIELD_STAFF
        ? '/field'
        : '/citizen/my-complaints';

    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto my-12 shadow-xs">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">Complaint Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          Could not find complaint details for ticket ID or identifier: <span className="font-mono font-bold text-slate-800">{id}</span>
        </p>
        <Link
          to={fallbackLink}
          className="inline-block mt-4 px-4 py-2 bg-civic-600 hover:bg-civic-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Return to Queue
        </Link>
      </div>
    );
  }

  const { complaint, auditLogs } = data;
  const isAwaitingVerification = complaint.status === ComplaintStatuses.AWAITING_VERIFICATION;
  const isClosed = complaint.status === ComplaintStatuses.CLOSED;
  const isInProgress = complaint.status === ComplaintStatuses.IN_PROGRESS;
  const isAssigned = complaint.status === ComplaintStatuses.ASSIGNED;

  // Role-based Back Link & Label
  const getBackNavigation = () => {
    if (user?.role === UserRoles.BMC_ADMIN) {
      return { link: '/admin/complaints', label: 'Back to Master Complaints' };
    }
    if (user?.role === UserRoles.DEPT_OFFICER || user?.role === UserRoles.DEPT_SUPERVISOR) {
      return { link: '/dept/queue', label: 'Back to Department Queue' };
    }
    if (user?.role === UserRoles.FIELD_STAFF) {
      return { link: '/field', label: 'Back to Field Work Orders' };
    }
    return { link: '/citizen/my-complaints', label: 'Back to My Complaints' };
  };

  const backNav = getBackNavigation();

  return (
    <div className="space-y-6">
      {/* Header & Back Nav */}
      <div>
        <Link
          to={backNav.link}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-civic-700 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backNav.label}</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-civic-800 bg-civic-50 px-2.5 py-1 rounded-lg border border-civic-200">
                {complaint.ticketId}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {complaint.categoryName || 'Civic Issue'}
              </span>
              {complaint.slaBreached && !isClosed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                  SLA Breached
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-2">{complaint.title}</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />

            {/* Admin Quick Triage Action */}
            {user?.role === UserRoles.BMC_ADMIN && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 font-bold"
                onClick={() => {
                  setTargetDeptId(complaint.assignedDepartmentId || departments?.[0]?.id || '');
                  setTargetPriority(complaint.priority);
                  setIsAdminAssignModalOpen(true);
                }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign Dept</span>
              </Button>
            )}

            {/* Department Officer Quick Dispatch Action */}
            {(user?.role === UserRoles.DEPT_OFFICER || user?.role === UserRoles.DEPT_SUPERVISOR) && (
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 font-bold"
                onClick={() => {
                  setTargetStaffId(complaint.assignedFieldStaffId || staffList?.[0]?.id || '');
                  setIsDeptDispatchModalOpen(true);
                }}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{complaint.assignedFieldStaffId ? 'Reassign Staff' : 'Dispatch Staff'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Role-Specific Action Banners */}
      {/* 1. Citizen Verification Action */}
      {user?.role === UserRoles.CITIZEN && isAwaitingVerification && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Field Work Completed — Verification Needed</span>
          </div>
          <p className="text-xs text-amber-800">
            BMC technicians have completed the repair work and uploaded Before/After resolution photos below.
            Please inspect the proof and verify whether the issue is completely resolved.
          </p>
          <Button
            variant="success"
            size="md"
            className="w-full sm:w-auto gap-2"
            onClick={() => setIsVerificationModalOpen(true)}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify & Close Ticket</span>
          </Button>
        </div>
      )}

      {/* 2. Field Staff Start Work / Submit Proof Action */}
      {user?.role === UserRoles.FIELD_STAFF && (
        <div className="bg-sky-50 border-2 border-sky-400 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900 uppercase">Field Task Actions</span>
            <a
              href={`https://maps.google.com/?q=${complaint.location.coordinates[1]},${complaint.location.coordinates[0]}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:underline"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {isAssigned && (
              <Button
                variant="primary"
                size="md"
                className="gap-2 font-bold"
                isLoading={startWorkMutation.isPending}
                onClick={() => startWorkMutation.mutate()}
              >
                <Play className="w-4 h-4" />
                <span>Start Work On Site</span>
              </Button>
            )}

            {isInProgress && (
              <Button
                variant="success"
                size="md"
                className="gap-2 font-bold"
                onClick={() => {
                  setFieldResolutionNote('Repairs completed and site restored.');
                  setIsFieldProofModalOpen(true);
                }}
              >
                <Camera className="w-4 h-4" />
                <span>Complete & Upload Resolution Proof</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {isClosed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>This complaint has been verified and closed in the closed-loop civic system.</span>
        </div>
      )}

      {/* Resolution Proof Section (If Available) */}
      {complaint.resolutionEvidence && (
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3">Resolution Photographic Proof of Work</h2>
          <ProofViewer evidence={complaint.resolutionEvidence} />
        </div>
      )}

      {/* Grid: Complaint Details & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details & Citizen Evidence */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800">Complaint Details</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{complaint.description}</p>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {complaint.location.address}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Ward & Zone</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {complaint.wardName || `Ward ${complaint.wardNumber || '5'}`}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Department</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {complaint.assignedDepartmentName || 'Unassigned'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Technician</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {complaint.assignedFieldStaffName || 'Pending Dispatch'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Created Date</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {new Date(complaint.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">SLA Target</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {complaint.slaTargetHours || 24} Hours ({complaint.slaBreached ? 'Breached' : 'Within Target'})
                </span>
              </div>
            </div>

            {/* Citizen Uploaded Photos */}
            {complaint.citizenAttachments?.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">
                  Citizen Attached Initial Photo(s)
                </span>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {complaint.citizenAttachments.map((att, i) => (
                    <img
                      key={i}
                      src={att.url}
                      alt="Citizen evidence"
                      className="w-24 h-24 rounded-xl object-cover border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Audit Timeline */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-civic-600" />
              <span>Activity & Immutable Audit Trail</span>
            </h2>

            <TicketTimeline logs={auditLogs || []} />
          </div>
        </div>
      </div>

      {/* Citizen Verification Modal */}
      {isVerificationModalOpen && (
        <ResolutionVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          complaint={complaint}
          onVerify={async (isResolved, payload) => {
            await verifyMutation.mutateAsync({
              isResolved,
              payload
            });
          }}
        />
      )}

      {/* Admin Triage & Assign Modal */}
      {isAdminAssignModalOpen && (
        <Modal
          isOpen={isAdminAssignModalOpen}
          onClose={() => setIsAdminAssignModalOpen(false)}
          title={`Assign Department: ${complaint.ticketId}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              assignMutation.mutate({
                departmentId: targetDeptId,
                priority: targetPriority
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Department <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={targetDeptId}
                onChange={(e) => setTargetDeptId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white font-medium"
              >
                {departments?.map((d) => (
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
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white font-medium"
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
                onClick={() => setIsAdminAssignModalOpen(false)}
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

      {/* Department Officer Dispatch Modal */}
      {isDeptDispatchModalOpen && (
        <Modal
          isOpen={isDeptDispatchModalOpen}
          onClose={() => setIsDeptDispatchModalOpen(false)}
          title={`Dispatch Field Technician: ${complaint.ticketId}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              assignMutation.mutate({
                departmentId: user?.departmentId || complaint.assignedDepartmentId,
                fieldStaffId: targetStaffId
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Technician / Worker <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={targetStaffId}
                onChange={(e) => setTargetStaffId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white font-medium"
              >
                {staffList?.map((st) => (
                  <option key={st.id} value={st.id}>
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
                onClick={() => setIsDeptDispatchModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={assignMutation.isPending}>
                Confirm Dispatch
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Field Staff Upload Resolution Proof Modal */}
      {isFieldProofModalOpen && (
        <Modal
          isOpen={isFieldProofModalOpen}
          onClose={() => setIsFieldProofModalOpen(false)}
          title={`Upload Resolution Proof: ${complaint.ticketId}`}
          maxWidth="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!fieldResolutionNote.trim()) return;
              resolveMutation.mutate({
                beforePhotoUrl: fieldBeforePhoto,
                afterPhotoUrl: fieldAfterPhoto,
                resolutionNote: fieldResolutionNote
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Before Photo (Original Issue Proof) <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={fieldBeforePhoto}
                onChange={(e) => setFieldBeforePhoto(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                After Photo (Resolved State Proof) <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={fieldAfterPhoto}
                onChange={(e) => setFieldAfterPhoto(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white ring-2 ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resolution Note <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={fieldResolutionNote}
                onChange={(e) => setFieldResolutionNote(e.target.value)}
                placeholder="Describe repairs carried out and materials used..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFieldProofModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                size="sm"
                isLoading={resolveMutation.isPending}
              >
                Submit Resolution
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
