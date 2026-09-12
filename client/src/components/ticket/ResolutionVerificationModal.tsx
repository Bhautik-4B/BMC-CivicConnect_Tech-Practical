import React, { useState } from 'react';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';
import { ProofViewer } from './ProofViewer.js';
import { IComplaint } from '@bmc/shared';
import { CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

interface ResolutionVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: IComplaint;
  onVerify: (isResolved: boolean, payload?: { reopenReason?: string; reopenPhotoUrl?: string }) => Promise<void>;
}

export const ResolutionVerificationModal: React.FC<ResolutionVerificationModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onVerify
}) => {
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenPhotoUrl, setReopenPhotoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmSatisfied = async () => {
    setIsLoading(true);
    try {
      await onVerify(true);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    setIsLoading(true);
    try {
      await onVerify(false, { reopenReason, reopenPhotoUrl });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Verify Resolution: ${complaint.ticketId}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Issue Title & Description */}
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{complaint.title}</h4>
          <p className="text-xs text-slate-500 mt-1">{complaint.location.address}</p>
        </div>

        {/* Proof of work viewer */}
        {complaint.resolutionEvidence && (
          <ProofViewer evidence={complaint.resolutionEvidence} />
        )}

        {/* Verification Question or Reopen Form */}
        {!showReopenForm ? (
          <div className="bg-civic-50/70 border border-civic-200/80 rounded-2xl p-5 text-center space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              Is this civic issue completely resolved to your satisfaction?
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Please inspect the Before & After photos above. If the work has been completed properly,
              confirm to close the ticket.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="success"
                size="lg"
                className="w-full sm:w-auto gap-2"
                isLoading={isLoading}
                onClick={handleConfirmSatisfied}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Yes, Issue Resolved</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                onClick={() => setShowReopenForm(true)}
              >
                <RotateCcw className="w-4 h-4" />
                <span>No, Issue Still Exists</span>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmReopen} className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Reopen Complaint</span>
            </div>
            <p className="text-xs text-rose-700">
              Tell us why this issue is not resolved. The complaint will be escalated back to the department supervisor.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Observation <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="e.g. The pothole was filled with loose sand and washed away in the rain..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Evidence Photo URL (Optional)
              </label>
              <input
                type="url"
                value={reopenPhotoUrl}
                onChange={(e) => setReopenPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowReopenForm(false)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={isLoading}
                disabled={!reopenReason.trim()}
              >
                Submit & Reopen Ticket
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
