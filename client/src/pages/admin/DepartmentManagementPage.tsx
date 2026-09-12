import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Modal } from '../../components/common/Modal.js';
import { Button } from '../../components/common/Button.js';
import { IDepartment, UserRoles } from '@bmc/shared';
import {
  Building2,
  Users,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  Shield,
  Phone,
  Mail,
  Search,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DepartmentManagementPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedDeptForStaff, setSelectedDeptForStaff] = useState<IDepartment | null>(null);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<IDepartment | null>(null);
  const [isOnboardStaffModalOpen, setIsOnboardStaffModalOpen] = useState(false);

  // Form state for Department Create/Edit
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [emergencySla, setEmergencySla] = useState(4);
  const [highSla, setHighSla] = useState(24);
  const [normalSla, setNormalSla] = useState(72);
  const [deptFormError, setDeptFormError] = useState('');

  // Form state for Onboard Staff into Department
  const [staffName, setStaffName] = useState('');
  const [staffMobile, setStaffMobile] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<string>(UserRoles.FIELD_STAFF);
  const [staffEmpId, setStaffEmpId] = useState('');
  const [staffFormError, setStaffFormError] = useState('');

  // Fetch Departments
  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments-full'],
    queryFn: async () => {
      const res: any = await api.get('/admin/departments');
      return res.data as IDepartment[];
    }
  });

  // Fetch Staff for Selected Department
  const { data: deptStaff, isLoading: isStaffLoading } = useQuery({
    queryKey: ['dept-staff-admin', selectedDeptForStaff?.id],
    queryFn: async () => {
      if (!selectedDeptForStaff) return [];
      const res: any = await api.get(`/admin/departments/${selectedDeptForStaff.id}/staff`);
      return res.data as any[];
    },
    enabled: !!selectedDeptForStaff
  });

  // Create Department Mutation
  const createDeptMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await api.post('/admin/departments', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-full'] });
      setIsAddDeptModalOpen(false);
      resetDeptForm();
    },
    onError: (err: any) => {
      setDeptFormError(err.message || 'Failed to create department');
    }
  });

  // Update Department Mutation
  const updateDeptMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return await api.patch(`/admin/departments/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-full'] });
      setEditingDept(null);
    },
    onError: (err: any) => {
      setDeptFormError(err.message || 'Failed to update department');
    }
  });

  // Delete Department Mutation
  const deleteDeptMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/admin/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-full'] });
    }
  });

  // Create Staff in Department Mutation
  const createStaffMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await api.post('/dept/staff', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dept-staff-admin'] });
      queryClient.invalidateQueries({ queryKey: ['departments-full'] });
      setIsOnboardStaffModalOpen(false);
      resetStaffForm();
    },
    onError: (err: any) => {
      setStaffFormError(err.message || 'Failed to onboard staff');
    }
  });

  // Delete Staff Mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/dept/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dept-staff-admin'] });
    }
  });

  const resetDeptForm = () => {
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
    setEmergencySla(4);
    setHighSla(24);
    setNormalSla(72);
    setDeptFormError('');
  };

  const resetStaffForm = () => {
    setStaffName('');
    setStaffMobile('');
    setStaffEmail('');
    setStaffRole(UserRoles.FIELD_STAFF);
    setStaffEmpId('');
    setStaffFormError('');
  };

  const handleCreateDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDeptFormError('');
    if (!deptName || !deptCode) {
      setDeptFormError('Department Name and Code are required.');
      return;
    }

    createDeptMutation.mutate({
      name: deptName,
      code: deptCode,
      description: deptDesc,
      defaultSlaHours: {
        EMERGENCY: Number(emergencySla),
        HIGH: Number(highSla),
        NORMAL: Number(normalSla)
      }
    });
  };

  const handleUpdateDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setDeptFormError('');

    updateDeptMutation.mutate({
      id: editingDept.id,
      payload: {
        name: editingDept.name,
        code: editingDept.code,
        description: editingDept.description,
        defaultSlaHours: editingDept.defaultSlaHours,
        isActive: editingDept.isActive
      }
    });
  };

  const handleCreateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptForStaff) return;
    setStaffFormError('');
    if (!staffName || !staffMobile) {
      setStaffFormError('Name and Mobile Number are required.');
      return;
    }

    createStaffMutation.mutate({
      name: staffName,
      mobile: staffMobile,
      email: staffEmail || undefined,
      role: staffRole,
      employeeId: staffEmpId || undefined,
      departmentId: selectedDeptForStaff.id
    });
  };

  if (isLoading) return <LoadingSpinner message="Loading departments & staffing master records..." />;

  const deptList = (departments || []).filter((dept) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        dept.name.toLowerCase().includes(q) ||
        dept.code.toLowerCase().includes(q) ||
        dept.description?.toLowerCase().includes(q)
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
            Municipal Administration & Workforce Orchestration
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-civic-600" />
            <span>Departments & Staff Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Create departments, define priority SLA baselines, and manage staff rosters across the corporation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              resetDeptForm();
              setIsAddDeptModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 shadow-sm"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </Button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search departments by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
          />
        </div>

        <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          {deptList.length} Active Departments
        </span>
      </div>

      {/* Department Master Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5 font-bold">Code</th>
                <th className="px-5 py-3.5 font-bold">Department Name & Scope</th>
                <th className="px-5 py-3.5 font-bold text-center">Emergency SLA</th>
                <th className="px-5 py-3.5 font-bold text-center">High SLA</th>
                <th className="px-5 py-3.5 font-bold text-center">Normal SLA</th>
                <th className="px-5 py-3.5 font-bold text-center">Staffing</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
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
                      {dept.description || 'Handles departmental municipal tasks'}
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
                    <button
                      onClick={() => setSelectedDeptForStaff(dept)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-civic-50 hover:bg-civic-100 text-civic-700 font-bold rounded-xl border border-civic-200 text-xs transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Manage Staff</span>
                    </button>
                  </td>

                  <td className="px-5 py-3.5 text-right space-x-1.5">
                    <Link
                      to={`/admin/complaints?departmentId=${dept.id}`}
                      className="inline-flex items-center gap-1 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="View Complaints"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => {
                        setEditingDept({ ...dept });
                        setDeptFormError('');
                      }}
                      title="Edit Department"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to deactivate ${dept.name}?`)) {
                          deleteDeptMutation.mutate(dept.id);
                        }
                      }}
                      title="Deactivate Department"
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors inline-flex items-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Add Department Modal */}
      {isAddDeptModalOpen && (
        <Modal
          isOpen={isAddDeptModalOpen}
          onClose={() => {
            setIsAddDeptModalOpen(false);
            resetDeptForm();
          }}
          title="Create New Municipal Department"
        >
          <form onSubmit={handleCreateDeptSubmit} className="space-y-4">
            {deptFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {deptFormError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Electrical & Street Lighting"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DEPT_LIGHT"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Responsibilities, jurisdiction, and maintenance scopes..."
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Emergency (Hrs)
                </label>
                <input
                  type="number"
                  min={1}
                  value={emergencySla}
                  onChange={(e) => setEmergencySla(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">High (Hrs)</label>
                <input
                  type="number"
                  min={1}
                  value={highSla}
                  onChange={(e) => setHighSla(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Normal (Hrs)
                </label>
                <input
                  type="number"
                  min={1}
                  value={normalSla}
                  onChange={(e) => setNormalSla(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddDeptModalOpen(false);
                  resetDeptForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={createDeptMutation.isPending}>
                Create Department
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. Edit Department Modal */}
      {editingDept && (
        <Modal
          isOpen={!!editingDept}
          onClose={() => setEditingDept(null)}
          title={`Edit Department: ${editingDept.name}`}
        >
          <form onSubmit={handleUpdateDeptSubmit} className="space-y-4">
            {deptFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {deptFormError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department Name</label>
              <input
                type="text"
                required
                value={editingDept.name}
                onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department Code</label>
              <input
                type="text"
                required
                value={editingDept.code}
                onChange={(e) => setEditingDept({ ...editingDept, code: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={editingDept.description || ''}
                onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Emergency (Hrs)
                </label>
                <input
                  type="number"
                  min={1}
                  value={editingDept.defaultSlaHours?.EMERGENCY || 4}
                  onChange={(e) =>
                    setEditingDept({
                      ...editingDept,
                      defaultSlaHours: {
                        ...editingDept.defaultSlaHours,
                        EMERGENCY: Number(e.target.value),
                        HIGH: editingDept.defaultSlaHours?.HIGH || 24,
                        NORMAL: editingDept.defaultSlaHours?.NORMAL || 72
                      }
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">High (Hrs)</label>
                <input
                  type="number"
                  min={1}
                  value={editingDept.defaultSlaHours?.HIGH || 24}
                  onChange={(e) =>
                    setEditingDept({
                      ...editingDept,
                      defaultSlaHours: {
                        ...editingDept.defaultSlaHours,
                        EMERGENCY: editingDept.defaultSlaHours?.EMERGENCY || 4,
                        HIGH: Number(e.target.value),
                        NORMAL: editingDept.defaultSlaHours?.NORMAL || 72
                      }
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Normal (Hrs)
                </label>
                <input
                  type="number"
                  min={1}
                  value={editingDept.defaultSlaHours?.NORMAL || 72}
                  onChange={(e) =>
                    setEditingDept({
                      ...editingDept,
                      defaultSlaHours: {
                        ...editingDept.defaultSlaHours,
                        EMERGENCY: editingDept.defaultSlaHours?.EMERGENCY || 4,
                        HIGH: editingDept.defaultSlaHours?.HIGH || 24,
                        NORMAL: Number(e.target.value)
                      }
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-xs text-slate-800">Department Active</span>
              <input
                type="checkbox"
                checked={editingDept.isActive !== false}
                onChange={(e) => setEditingDept({ ...editingDept, isActive: e.target.checked })}
                className="w-4 h-4 text-civic-600 rounded focus:ring-civic-500"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingDept(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={updateDeptMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Manage Department Staff Modal / Drawer */}
      {selectedDeptForStaff && (
        <Modal
          isOpen={!!selectedDeptForStaff}
          onClose={() => setSelectedDeptForStaff(null)}
          title={`Staff Roster: ${selectedDeptForStaff.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Department Staffing</span>
                <span className="text-slate-400">
                  {deptStaff?.length || 0} registered personnel
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  resetStaffForm();
                  setIsOnboardStaffModalOpen(true);
                }}
                className="inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Onboard Member</span>
              </Button>
            </div>

            {isStaffLoading ? (
              <LoadingSpinner message="Loading department staff..." />
            ) : !deptStaff || deptStaff.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No staff members currently assigned to {selectedDeptForStaff.name}.
              </div>
            ) : (
              <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
                {deptStaff.map((member: any) => (
                  <div
                    key={member.id || member._id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-civic-100 text-civic-800 font-bold flex items-center justify-center text-xs">
                        {member.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{member.name}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-mono">{member.employeeId || 'STAFF'}</span>
                          <span>•</span>
                          <span>{member.mobile}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-slate-800">
                          {member.activeTasks || 0} Active Tasks
                        </div>
                        <span
                          className={`text-[10px] font-bold ${
                            member.isAvailable ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {member.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to remove/deactivate ${member.name}?`
                            )
                          ) {
                            deleteStaffMutation.mutate(member.id || member._id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Deactivate staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 4. Onboard Staff into Selected Department Modal */}
      {isOnboardStaffModalOpen && selectedDeptForStaff && (
        <Modal
          isOpen={isOnboardStaffModalOpen}
          onClose={() => {
            setIsOnboardStaffModalOpen(false);
            resetStaffForm();
          }}
          title={`Onboard Staff: ${selectedDeptForStaff.name}`}
        >
          <form onSubmit={handleCreateStaffSubmit} className="space-y-4">
            {staffFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {staffFormError}
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
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
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
                  value={staffMobile}
                  onChange={(e) => setStaffMobile(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  placeholder="e.g. EMP-98214"
                  value={staffEmpId}
                  onChange={(e) => setStaffEmpId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. ramesh@bmc.gov.in"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white font-medium"
              >
                <option value={UserRoles.FIELD_STAFF}>Field Staff / Technician</option>
                <option value={UserRoles.DEPT_SUPERVISOR}>Department Supervisor</option>
                <option value={UserRoles.DEPT_OFFICER}>Department Officer</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOnboardStaffModalOpen(false);
                  resetStaffForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={createStaffMutation.isPending}>
                Create Staff Member
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
