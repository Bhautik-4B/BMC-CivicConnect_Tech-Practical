import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PriorityBadge } from '../../components/common/PriorityBadge.js';
import { TicketTimeline } from '../../components/ticket/TicketTimeline.js';
import { ProofViewer } from '../../components/ticket/ProofViewer.js';
import { ResolutionVerificationModal } from '../../components/ticket/ResolutionVerificationModal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Button } from '../../components/common/Button.js';
import {
  IComplaint,
  IAuditLogEntry,
  ComplaintStatuses
} from '@bmc/shared';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const res: any = await api.get(`/complaints/${id}`);
      return res.data as { complaint: IComplaint; auditLogs: IAuditLogEntry[] };
    },
    enabled: !!id
  });

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

  if (isLoading) return <LoadingSpinner message="Loading ticket details..." />;
  if (error || !data) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Ticket Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          Could not find complaint details for ticket ID: {id}
        </p>
        <Link
          to="/citizen"
          className="inline-block mt-4 px-4 py-2 bg-civic-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { complaint, auditLogs } = data;
  const isAwaitingVerification = complaint.status === ComplaintStatuses.AWAITING_VERIFICATION;
  const isClosed = complaint.status === ComplaintStatuses.CLOSED;

  return (
    <div className="space-y-6">
      {/* Back button & Ticket Header */}
      <div>
        <Link
          to="/citizen"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-civic-700 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-civic-800 bg-civic-50 px-2.5 py-1 rounded-lg border border-civic-200">
                {complaint.ticketId}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {complaint.categoryName || 'Civic Issue'}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-2">{complaint.title}</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>
      </div>

      {/* Citizen Action Callout Banner */}
      {isAwaitingVerification && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Field Work Completed — Verification Needed</span>
          </div>
          <p className="text-xs text-amber-800">
            BMC staff has completed work and uploaded Before/After resolution photos below. Please
            inspect the resolution and verify whether the issue is resolved.
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

      {isClosed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>This complaint has been verified and permanently closed. Thank you for your feedback!</span>
        </div>
      )}

      {/* Resolution Proof Section (If Available) */}
      {complaint.resolutionEvidence && (
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3">Resolution Proof of Work</h2>
          <ProofViewer evidence={complaint.resolutionEvidence} />
        </div>
      )}

      {/* Grid: Complaint Details & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details & Citizen Evidence */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
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
                  {complaint.assignedDepartmentName || 'Road & Infrastructure'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Created Date</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {new Date(complaint.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Citizen Uploaded Photos */}
            {complaint.citizenAttachments?.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">
                  Citizen Attached Evidence
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
          <div className="bg-white rounded-3xl border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-civic-600" />
              <span>Activity & Status Timeline</span>
            </h2>

            <TicketTimeline logs={auditLogs || []} />
          </div>
        </div>
      </div>

      {/* Verification Modal */}
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
    </div>
  );
};
