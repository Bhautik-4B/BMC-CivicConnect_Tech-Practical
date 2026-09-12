import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { TicketCard } from '../../components/ticket/TicketCard.js';
import { ResolutionVerificationModal } from '../../components/ticket/ResolutionVerificationModal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { IComplaint, ComplaintStatuses } from '@bmc/shared';
import { Link } from 'react-router-dom';
import { PlusCircle, AlertCircle, CheckCircle2, Clock, MapPin, Construction, Trash2, Droplets, Lightbulb, Waves } from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedComplaintForVerification, setSelectedComplaintForVerification] = useState<IComplaint | null>(null);

  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: async () => {
      const res: any = await api.get('/complaints/my');
      return res.data as IComplaint[];
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      id,
      isResolved,
      payload
    }: {
      id: string;
      isResolved: boolean;
      payload?: { reopenReason?: string; reopenPhotoUrl?: string };
    }) => {
      await api.patch(`/complaints/${id}/verify`, {
        isResolved,
        reopenReason: payload?.reopenReason,
        reopenPhotoUrl: payload?.reopenPhotoUrl
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-complaints'] });
    }
  });

  const complaints = complaintsData || [];
  const activeCount = complaints.filter(
    (c) => c.status !== ComplaintStatuses.CLOSED && c.status !== ComplaintStatuses.REJECTED
  ).length;
  const inProgressCount = complaints.filter((c) => c.status === ComplaintStatuses.IN_PROGRESS).length;
  const awaitingVerificationList = complaints.filter(
    (c) => c.status === ComplaintStatuses.AWAITING_VERIFICATION
  );
  const resolvedCount = complaints.filter((c) => c.status === ComplaintStatuses.CLOSED).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-civic-800 to-civic-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur">
            Bhavnagar Citizen Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            Welcome back, {user?.name || 'Citizen'}!
          </h1>
          <p className="text-sm text-civic-100 mt-1 max-w-lg">
            Easily report civic issues in your neighborhood. Every complaint is tracked and resolved with photographic proof.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="inline-flex items-center gap-2 bg-white text-civic-700 hover:bg-civic-50 px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all shrink-0 hover:scale-105"
        >
          <PlusCircle className="w-5 h-5 text-civic-600" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Verification Attention Banner */}
      {awaitingVerificationList.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Action Required: {awaitingVerificationList.length} Complaint(s) Awaiting Your Verification
              </h4>
              <p className="text-xs text-amber-700">
                BMC workers have submitted Before & After photos. Please verify if the issue was resolved.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedComplaintForVerification(awaitingVerificationList[0])}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            Review & Verify Proof
          </button>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Active</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-civic-600 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">In Progress</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 mt-1">{inProgressCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Resolved</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</div>
        </div>
      </div>

      {/* Quick Category Buttons */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3">Quick Report by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to="/citizen/report?category=road"
            className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col items-center justify-center hover:border-civic-500 hover:shadow-md transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Construction className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Road & Pothole</span>
          </Link>

          <Link
            to="/citizen/report?category=sanitation"
            className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col items-center justify-center hover:border-civic-500 hover:shadow-md transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Garbage Waste</span>
          </Link>

          <Link
            to="/citizen/report?category=water"
            className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col items-center justify-center hover:border-civic-500 hover:shadow-md transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Water Supply</span>
          </Link>

          <Link
            to="/citizen/report?category=electrical"
            className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col items-center justify-center hover:border-civic-500 hover:shadow-md transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Street Light</span>
          </Link>

          <Link
            to="/citizen/report?category=drainage"
            className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col items-center justify-center hover:border-civic-500 hover:shadow-md transition-all text-center group col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Waves className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Drainage</span>
          </Link>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">Recent Complaints</h2>
          <Link to="/citizen/my-complaints" className="text-xs font-semibold text-civic-600 hover:underline">
            View All ({complaints.length})
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Fetching your complaints..." />
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No complaints reported yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              If you notice any broken road, garbage pile, or water leakage, submit a ticket to BMC.
            </p>
            <Link
              to="/citizen/report"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-civic-600 text-white rounded-xl text-xs font-bold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.slice(0, 4).map((item) => (
              <TicketCard
                key={item.id}
                complaint={item}
                baseLink="/citizen/ticket"
                onVerifyClick={(comp) => setSelectedComplaintForVerification(comp)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resolution Verification Modal */}
      {selectedComplaintForVerification && (
        <ResolutionVerificationModal
          isOpen={!!selectedComplaintForVerification}
          onClose={() => setSelectedComplaintForVerification(null)}
          complaint={selectedComplaintForVerification}
          onVerify={async (isResolved, payload) => {
            await verifyMutation.mutateAsync({
              id: selectedComplaintForVerification.id,
              isResolved,
              payload
            });
          }}
        />
      )}
    </div>
  );
};
