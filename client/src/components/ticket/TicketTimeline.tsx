import React from 'react';
import { IAuditLogEntry } from '@bmc/shared';
import { Check, Circle, Clock } from 'lucide-react';

interface TicketTimelineProps {
  logs: IAuditLogEntry[];
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({ logs }) => {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {logs.map((log, index) => {
        const isLatest = index === logs.length - 1;
        return (
          <div key={log.id || index} className="relative group">
            {/* Dot icon */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isLatest
                  ? 'bg-civic-600 border-white text-white ring-4 ring-civic-100 shadow'
                  : 'bg-slate-100 border-slate-300 text-slate-400'
              }`}
            >
              {isLatest ? <Clock className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
            </div>

            {/* Content */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-800">
                  {log.actorName} <span className="font-normal text-slate-400">({log.actorRole})</span>
                </span>
                <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-xs text-slate-700 font-medium">{log.comment || log.action}</p>
              {log.toState && (
                <div className="mt-1.5 text-[11px] font-mono text-civic-700 bg-civic-50 px-2 py-0.5 rounded-md inline-block">
                  Status: {log.toState}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
