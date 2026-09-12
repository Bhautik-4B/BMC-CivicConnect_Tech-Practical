import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { IDepartment } from '@bmc/shared';
import { Building2, Shield, Users, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DepartmentManagementPage: React.FC = () => {
  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments-full'],
    queryFn: async () => {
      const res: any = await api.get('/admin/departments');
      return res.data as IDepartment[];
    }
  });

  if (isLoading) return <LoadingSpinner message="Loading departments master catalog..." />;

  const deptList = departments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-civic-600" />
            <span>BMC Municipal Departments & Staffing</span>
          </h1>
          <p className="text-xs text-slate-500">
            Overview of municipal departments, jurisdictional SLAs, and operational policies.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          {deptList.length} Active Departments
        </span>
      </div>

      {/* High-Density Municipal Department Master Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5 font-bold">Dept Code</th>
                <th className="px-5 py-3.5 font-bold">Department Name & Scope</th>
                <th className="px-5 py-3.5 font-bold text-center">Emergency SLA</th>
                <th className="px-5 py-3.5 font-bold text-center">High SLA</th>
                <th className="px-5 py-3.5 font-bold text-center">Normal SLA</th>
                <th className="px-5 py-3.5 font-bold text-center">Status</th>
                <th className="px-5 py-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptList.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-civic-700">
                    <span className="bg-civic-50 px-2 py-0.5 rounded-md border border-civic-200">
                      {dept.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-extrabold text-slate-900 text-xs">{dept.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm truncate">
                      {dept.description}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-bold border border-red-200 text-[11px]">
                      {dept.defaultSlaHours?.EMERGENCY || 4}h
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[11px]">
                      {dept.defaultSlaHours?.HIGH || 24}h
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                      {dept.defaultSlaHours?.NORMAL || 72}h
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/admin/complaints?departmentId=${dept.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-civic-50 text-slate-700 hover:text-civic-700 font-bold transition-colors"
                    >
                      <span>View Queue</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
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
