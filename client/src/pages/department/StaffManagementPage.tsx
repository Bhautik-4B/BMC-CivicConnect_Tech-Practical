import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Modal } from '../../components/common/Modal.js';
import { Button } from '../../components/common/Button.js';
import { UserRoles } from '@bmc/shared';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Briefcase,
  Shield,
  Edit2,
  Trash2,
  Filter,
  Check,
  X
} from 'lucide-react';

export const StaffManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  // Form states for Create Staff
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(UserRoles.FIELD_STAFF);
  const [employeeId, setEmployeeId] = useState('');
  const [wardId, setWardId] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch Department Staff
  const { data: staffList, isLoading: isStaffLoading } = useQuery({
    queryKey: ['dept-staff'],
    queryFn: async () => {
      const res: any = await api.get('/dept/staff');
      return res.data as any[];
    }
  });

  // Fetch Wards for assignment dropdown
  const { data: wards } = useQuery({
    queryKey: ['admin-wards'],
    queryFn: async () => {
      const res: any = await api.get('/admin/wards');
      return res.data as any[];
    }
  });

  // Create Staff Mutation
  const createStaffMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await api.post('/dept/staff', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dept-staff'] });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to onboard staff member');
    }
  });

  // Update Staff Mutation
  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return await api.patch(`/dept/staff/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dept-staff'] });
      setEditingStaff(null);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to update staff member');
    }
  });

  // Delete/Deactivate Staff Mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/dept/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dept-staff'] });
    }
  });

  const resetForm = () => {
    setName('');
    setMobile('');
    setEmail('');
    setRole(UserRoles.FIELD_STAFF);
    setEmployeeId('');
    setWardId('');
    setPassword('');
    setFormError('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name || !mobile) {
      setFormError('Name and Mobile Number are mandatory');
      return;
    }

    createStaffMutation.mutate({
      name,
      mobile,
      email: email || undefined,
      role,
      employeeId: employeeId || undefined,
      wardId: wardId || undefined,
      password: password || undefined,
      departmentId: user?.departmentId
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setFormError('');

    updateStaffMutation.mutate({
      id: editingStaff.id || editingStaff._id,
      payload: {
        name: editingStaff.name,
        mobile: editingStaff.mobile,
        email: editingStaff.email,
        role: editingStaff.role,
        employeeId: editingStaff.employeeId,
        wardId: editingStaff.wardId,
        isActive: editingStaff.isActive
      }
    });
  };

  if (isStaffLoading) {
    return <LoadingSpinner message="Loading departmental staff roster & workload metrics..." />;
  }

  const staff = staffList || [];
  const wardList = wards || [];

  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.isActive !== false).length;
  const availableStaff = staff.filter((s) => s.isActive !== false && s.isAvailable).length;
  const totalActiveTasks = staff.reduce((sum, s) => sum + (s.activeTasks || 0), 0);

  const filteredStaff = staff.filter((s) => {
    if (roleFilter !== 'ALL' && s.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.mobile?.includes(q) ||
        s.employeeId?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase text-civic-600 tracking-wider">
            Field Workforce & Department Personnel
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            Department Staff Management
          </h1>
          <p className="text-xs text-slate-500">
            Onboard new field technicians, monitor active work order quotas, and regulate access permissions.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 shadow-sm"
          size="sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard Technician</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Total Personnel</span>
            <Users className="w-4 h-4 text-civic-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalStaff}</div>
          <span className="text-[10px] text-slate-400">Registered staff</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Available for Work</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{availableStaff}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Under capacity limit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Active Workload</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{totalActiveTasks}</div>
          <span className="text-[10px] text-slate-400">Active tickets assigned</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Active Accounts</span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{activeStaff}</div>
          <span className="text-[10px] text-slate-400">Authorized personnel</span>
        </div>
      </div>

      {/* Staff Roster Table & Search Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-civic-500 focus:outline-none"
            >
              <option value="ALL">All Roles ({staff.length})</option>
              <option value={UserRoles.FIELD_STAFF}>Field Staff</option>
              <option value={UserRoles.DEPT_SUPERVISOR}>Supervisor</option>
              <option value={UserRoles.DEPT_OFFICER}>Officer</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, ID, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredStaff.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No staff members found matching your search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Personnel</th>
                  <th className="px-5 py-3.5 font-bold">Employee ID</th>
                  <th className="px-5 py-3.5 font-bold">Role & Ward</th>
                  <th className="px-5 py-3.5 font-bold">Availability & Status</th>
                  <th className="px-5 py-3.5 font-bold">Active Load</th>
                  <th className="px-5 py-3.5 font-bold">Resolved</th>
                  <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((member) => (
                  <tr key={member.id || member._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-civic-100 text-civic-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {member.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{member.name}</div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <Phone className="w-3 h-3" />
                              {member.mobile}
                            </span>
                            {member.email && (
                              <span className="flex items-center gap-0.5 truncate max-w-[140px]">
                                <Mail className="w-3 h-3" />
                                {member.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-700">
                      {member.employeeId || 'STAFF-101'}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-800">
                        {member.role === UserRoles.FIELD_STAFF
                          ? 'Field Technician'
                          : member.role === UserRoles.DEPT_SUPERVISOR
                          ? 'Dept Supervisor'
                          : 'Dept Officer'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {member.wardName || (member.wardId ? `Ward Assigned` : 'Citywide')}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            member.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              member.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          ></span>
                          <span>{member.isActive !== false ? 'Active' : 'Inactive'}</span>
                        </span>

                        {member.isActive !== false && (
                          <span
                            className={`text-[10px] font-bold ${
                              member.isAvailable ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {member.isAvailable ? '• Available' : '• Busy On-Site'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                        {member.activeTasks || 0} active
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-emerald-700">
                      <span className="px-2.5 py-1 bg-emerald-50 rounded-lg text-emerald-700">
                        {member.completedTasks || 0} resolved
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingStaff({ ...member });
                          setFormError('');
                        }}
                        title="Edit Personnel"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors inline-flex items-center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to deactivate ${member.name}?`
                            )
                          ) {
                            deleteStaffMutation.mutate(member.id || member._id);
                          }
                        }}
                        title="Deactivate Staff"
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 1. Onboard Field Worker Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
          title="Onboard New Field Technician / Staff"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10 digits starting with 6-9"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employee ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. EMP-98214"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. ramesh@bmc.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white font-medium"
                >
                  <option value={UserRoles.FIELD_STAFF}>Field Staff / Technician</option>
                  <option value={UserRoles.DEPT_SUPERVISOR}>Department Supervisor</option>
                  <option value={UserRoles.DEPT_OFFICER}>Department Officer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Ward</label>
                <select
                  value={wardId}
                  onChange={(e) => setWardId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white font-medium"
                >
                  <option value="">All / Floating Ward</option>
                  {wardList.map((w: any) => (
                    <option key={w.id || w._id} value={w.id || w._id}>
                      Ward {w.wardNumber}: {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Password (Optional)
              </label>
              <input
                type="password"
                placeholder="Defaults to BmcStaff@123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Staff can log in via OTP or with this password.
              </p>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={createStaffMutation.isPending}>
                Create & Authorize
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. Edit Staff Member Modal */}
      {editingStaff && (
        <Modal
          isOpen={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          title={`Edit Personnel: ${editingStaff.name}`}
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editingStaff.name}
                onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={editingStaff.mobile}
                  onChange={(e) => setEditingStaff({ ...editingStaff, mobile: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={editingStaff.employeeId || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, employeeId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={editingStaff.email || ''}
                onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-xs text-slate-800 block">Account Active Status</span>
                <span className="text-[10px] text-slate-400">
                  Allow or restrict access to department dispatch tasks
                </span>
              </div>
              <input
                type="checkbox"
                checked={editingStaff.isActive !== false}
                onChange={(e) => setEditingStaff({ ...editingStaff, isActive: e.target.checked })}
                className="w-4 h-4 text-civic-600 rounded focus:ring-civic-500"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingStaff(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={updateStaffMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
