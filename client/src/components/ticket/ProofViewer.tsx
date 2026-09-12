import React from 'react';
import { IResolutionEvidence } from '@bmc/shared';
import { CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react';

interface ProofViewerProps {
  evidence: IResolutionEvidence;
}

export const ProofViewer: React.FC<ProofViewerProps> = ({ evidence }) => {
  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 shadow-inner">
      <div className="flex items-center gap-2 mb-4 text-emerald-700 font-semibold text-sm">
        <CheckCircle2 className="w-5 h-5" />
        <span>Verifiable Resolution Proof of Work</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before Photo */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>Before Repair (Issue State)</span>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-300 bg-slate-200">
            <img
              src={evidence.beforePhotoUrl}
              alt="Before Repair"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* After Photo */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>After Repair (Resolved State)</span>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-300 bg-slate-200 ring-2 ring-emerald-500/20">
            <img
              src={evidence.afterPhotoUrl}
              alt="After Repair"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* Resolution Notes */}
      <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-2.5">
        <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700">
          <span className="font-semibold text-slate-900">Work Details: </span>
          {evidence.resolutionNote}
        </div>
      </div>
    </div>
  );
};
