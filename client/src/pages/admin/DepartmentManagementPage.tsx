import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { IDepartment } from '@bmc/shared';
import { Building2, Shield, Users, Clock, CheckCircle2 } from 'lucide-react';

export const DepartmentManagementPage: React.FC = () => {
  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments-full'],
    queryFn: async () => {
      const res: any = await api.get('/admin/departments');
      return res.data as IDepartment[];
    }
  });

  if (isLoading) return <LoadingSpinner message="Loading departments roster..." />;

  const deptList = departments || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-civic-600" />
          <span>BMC Municipal Departments & Staffing</span>
        </h1>
        <p className="text-xs text-slate-500">
          Manage municipal departments, SLA policy thresholds, and active personnel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deptList.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-civic-700 bg-civic-50 px-2.5 py-0.5 rounded-md">
                  {dept.code}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
              </div>

              <h2 className="text-base font-extrabold text-slate-900 mt-2">{dept.name}</h2>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.description}</p>
            </div>

            {/* SLA Policies */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Configured Resolution SLA
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                <div className="p-1.5 bg-red-50 text-red-700 rounded-lg font-bold border border-red-200">
                  <span className="block text-[9px] font-normal uppercase">Emergency</span>
                  {dept.defaultSlaHours?.EMERGENCY || 4}h
                </div>
                <div className="p-1.5 bg-amber-50 text-amber-800 rounded-lg font-bold border border-amber-200">
                  <span className="block text-[9px] font-normal uppercase">High</span>
                  {dept.defaultSlaHours?.HIGH || 24}h
                </div>
                <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg font-bold border border-slate-200">
                  <span className="block text-[9px] font-normal uppercase">Normal</span>
                  {dept.defaultSlaHours?.NORMAL || 72}h
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
