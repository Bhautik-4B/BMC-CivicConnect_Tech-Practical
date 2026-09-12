import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { CityAnalyticsSummary, IComplaint } from '@bmc/shared';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PriorityBadge } from '../../components/common/PriorityBadge.js';
import { Link } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  TrendingUp,
  Building2,
  ArrowUpRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res: any = await api.get('/admin/analytics');
      return res.data as CityAnalyticsSummary;
    }
  });

  const { data: recentComplaints, isLoading: isComplaintsLoading } = useQuery({
    queryKey: ['admin-recent-complaints'],
    queryFn: async () => {
      const res: any = await api.get('/admin/complaints?limit=5');
      return res.data as IComplaint[];
    }
  });

  if (isAnalyticsLoading || isComplaintsLoading) {
    return <LoadingSpinner message="Aggregating city-level civic metrics..." />;
  }

  const kpis = analytics || {
    totalComplaints: 0,
    newToday: 0,
    inProgress: 0,
    resolved: 0,
    overdue: 0,
    reopened: 0,
    resolutionRate: 0,
    slaComplianceRate: 0,
    categoryBreakdown: [],
    wardBreakdown: [],
    departmentPerformance: []
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            City Command & Governance Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time civic operational overview for Bhavnagar Municipal Corporation.
          </p>
        </div>

        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-civic-600 hover:bg-civic-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
        >
          <span>Manage All Complaints</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase">Total Tickets</span>
            <FileText className="w-4 h-4 text-civic-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{kpis.totalComplaints}</div>
          <span className="text-[10px] text-slate-400">All registered</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase">New Today</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{kpis.newToday}</div>
          <span className="text-[10px] text-slate-400">Past 24 hours</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase">In Progress</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-600">{kpis.inProgress}</div>
          <span className="text-[10px] text-slate-400">Under repair</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{kpis.resolved}</div>
          <span className="text-[10px] text-emerald-600 font-bold">{kpis.resolutionRate}% rate</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-600">{kpis.overdue}</div>
          <span className="text-[10px] text-red-500 font-bold">SLA Breached</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase">Reopened</span>
            <RotateCcw className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{kpis.reopened}</div>
          <span className="text-[10px] text-slate-400">Citizen contested</span>
        </div>
      </div>

      {/* Grid: Department Performance & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-civic-600" />
              <span>Department SLA Compliance & Performance</span>
            </h2>
            <span className="text-xs font-semibold text-emerald-600">
              City SLA: {kpis.slaComplianceRate}%
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {kpis.departmentPerformance?.map((dept, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{dept.departmentName}</span>
                  <span className="text-slate-500">
                    {dept.complianceRate}% SLA ({dept.resolved}/{dept.total} resolved)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dept.complianceRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(dept.complianceRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complaints by Category Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800">Complaints by Category Distribution</h2>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {kpis.categoryBreakdown?.map((cat, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 block truncate">
                  {cat.categoryName}
                </span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">{cat.count}</div>
                <span className="text-[10px] text-civic-600 font-semibold">
                  {kpis.totalComplaints > 0
                    ? ((cat.count / kpis.totalComplaints) * 100).toFixed(0)
                    : 0}
                  % of total
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent City Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Recent City Complaints Feed</h2>
          <Link to="/admin/complaints" className="text-xs font-semibold text-civic-600 hover:underline">
            View All Complaints
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-bold">Ticket ID</th>
                <th className="pb-3 font-bold">Issue Title</th>
                <th className="pb-3 font-bold">Ward</th>
                <th className="pb-3 font-bold">Department</th>
                <th className="pb-3 font-bold">Priority</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(recentComplaints || []).slice(0, 5).map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-mono font-bold text-civic-700">{comp.ticketId}</td>
                  <td className="py-3 font-medium text-slate-800 max-w-[200px] truncate">
                    {comp.title}
                  </td>
                  <td className="py-3 text-slate-600">Ward {comp.wardNumber || '5'}</td>
                  <td className="py-3 text-slate-600">{comp.assignedDepartmentName || 'Pending'}</td>
                  <td className="py-3">
                    <PriorityBadge priority={comp.priority} />
                  </td>
                  <td className="py-3">
                    <StatusBadge status={comp.status} />
                  </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/ticket/${comp.ticketId || comp.id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-civic-50 text-slate-700 hover:text-civic-700 font-semibold"
                      >
                        View
                      </Link>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
