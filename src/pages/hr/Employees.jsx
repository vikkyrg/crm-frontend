import React, { useState } from 'react';
import { 
  Plus, 
  Users2, 
  Search, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  X, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  DollarSign
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Employees() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const initialForm = {
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    basicSalary: 60000,
    employmentStatus: 'Full Time',
    status: 'Active',
    joiningDate: new Date().toISOString().split('T')[0]
  };

  const [employeeForm, setEmployeeForm] = useState(initialForm);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees?limit=100');
      return res.data || [];
    }
  });

  const displayData = data?.data || data || [];

  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/employees', payload),
    onSuccess: () => {
      toast.success('Employee record created successfully!');
      setShowAddModal(false);
      setEmployeeForm(initialForm);
      queryClient.invalidateQueries(['employees']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create employee')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.put(`/employees/${id}`, payload),
    onSuccess: () => {
      toast.success('Employee updated successfully!');
      setEditEmployee(null);
      queryClient.invalidateQueries(['employees']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update employee')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/employees/${id}`),
    onSuccess: () => {
      toast.success('Employee deactivated successfully!');
      queryClient.invalidateQueries(['employees']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to deactivate employee')
  });

  const filteredEmployees = displayData.filter((e) => {
    const matchSearch = 
      !search ||
      (e.name && e.name.toLowerCase().includes(search.toLowerCase())) ||
      (e.email && e.email.toLowerCase().includes(search.toLowerCase())) ||
      (e.employeeId && e.employeeId.toLowerCase().includes(search.toLowerCase())) ||
      (e.designation && e.designation.toLowerCase().includes(search.toLowerCase()));

    const matchDept = departmentFilter === 'All' || e.department === departmentFilter;
    return matchSearch && matchDept;
  });

  const columns = [
    { 
      header: 'Employee ID', 
      accessor: 'employeeId',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.employeeId || row._id?.slice(-6)}
        </span>
      )
    },
    { 
      header: 'Name & Designation', 
      cell: (row) => (
        <div>
          <span className="font-bold text-text block">{row.name}</span>
          <span className="text-[11px] text-text-muted">{row.designation || 'Staff'}</span>
        </div>
      )
    },
    { header: 'Department', accessor: 'department' },
    { 
      header: 'Contact', 
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center text-text-muted">
            <Mail className="h-3 w-3 mr-1 text-primary" /> {row.email}
          </div>
          {row.phone && (
            <div className="flex items-center text-text-muted">
              <Phone className="h-3 w-3 mr-1 text-primary" /> {row.phone}
            </div>
          )}
        </div>
      )
    },
    { 
      header: 'Base Salary', 
      cell: (row) => (
        <span className="font-mono font-semibold text-text">
          ₹{(row.basicSalary || 0).toLocaleString()}
        </span>
      )
    },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
          row.status === 'Active' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
        }`}>
          {row.status || 'Active'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditEmployee(row);
              setEmployeeForm({
                name: row.name || '',
                email: row.email || '',
                phone: row.phone || '',
                department: row.department || 'Engineering',
                designation: row.designation || 'Software Engineer',
                basicSalary: row.basicSalary || 60000,
                employmentStatus: row.employmentStatus || 'Full Time',
                status: row.status || 'Active',
                joiningDate: row.joiningDate ? new Date(row.joiningDate).toISOString().split('T')[0] : ''
              });
            }}
            className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Deactivate employee ${row.name}?`)) {
                deleteMutation.mutate(row._id);
              }
            }}
            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
            title="Deactivate"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <Users2 className="mr-2 h-6 w-6 text-primary" /> Employees Directory & Team Governance
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage company staff, department assignments, payroll compensation, and active employment statuses.
          </p>
        </div>
        <Button onClick={() => { setEmployeeForm(initialForm); setShowAddModal(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search employees by name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-xs text-text-muted font-medium">Department:</span>
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Sales & Marketing">Sales & Marketing</option>
            <option value="Operations & Support">Operations & Support</option>
            <option value="HR & Admin">HR & Admin</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load employees" onRetry={refetch} />}
      {!isLoading && !isError && filteredEmployees.length === 0 && (
        <ErrorState title="No employees found" message="Onboard your company staff to allocate projects and tasks." />
      )}
      {!isLoading && !isError && filteredEmployees.length > 0 && (
        <DataTable columns={columns} data={filteredEmployees} />
      )}

      {/* CREATE / EDIT EMPLOYEE MODAL */}
      {(showAddModal || editEmployee) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl my-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text flex items-center">
                <Users2 className="mr-1.5 h-5 w-5 text-primary" /> {editEmployee ? `Edit Employee: ${editEmployee.name}` : 'Onboard New Employee'}
              </h2>
              <button onClick={() => { setShowAddModal(false); setEditEmployee(null); }} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if (!employeeForm.name.trim() || !employeeForm.email.trim()) {
                  toast.error('Name and Email are required');
                  return;
                }
                if (editEmployee) {
                  updateMutation.mutate({ id: editEmployee._id, payload: employeeForm });
                } else {
                  createMutation.mutate(employeeForm);
                }
              }} 
              className="space-y-4 text-xs mt-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                    placeholder="e.g. Vikram Sharma"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Corporate Email *</label>
                  <input 
                    type="email" 
                    required
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="vikram@innomatrics.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Department</label>
                  <select 
                    value={employeeForm.department}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Operations & Support">Operations & Support</option>
                    <option value="HR & Admin">HR & Admin</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Designation</label>
                  <input 
                    type="text" 
                    value={employeeForm.designation}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="e.g. Senior Fullstack Developer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Monthly Salary (₹)</label>
                  <input 
                    type="number" 
                    value={employeeForm.basicSalary}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, basicSalary: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded p-2 text-text font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Joining Date</label>
                  <input 
                    type="date" 
                    value={employeeForm.joiningDate}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, joiningDate: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Employment Status</label>
                  <select 
                    value={employeeForm.employmentStatus}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, employmentStatus: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditEmployee(null); }}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editEmployee ? 'Save Changes' : 'Save Employee'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
