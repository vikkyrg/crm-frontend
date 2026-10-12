import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Search, 
  CheckCircle2, 
  XCircle, 
  X,
  User,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Leave() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    employeeId: '',
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'Pending'
  });

  // Queries
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees?limit=100');
      return res.data || [];
    }
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const res = await api.get('/leaves?limit=100');
      return res.data || [];
    }
  });

  const employees = employeesData?.data || employeesData || [];
  const displayData = data?.data || data || [];

  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/leaves', payload),
    onSuccess: () => {
      toast.success('Leave application submitted!');
      setShowAddModal(false);
      queryClient.invalidateQueries(['leaves']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit leave application')
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => api.put(`/leaves/${id}`, { status }),
    onSuccess: () => {
      toast.success('Leave status updated!');
      queryClient.invalidateQueries(['leaves']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update leave')
  });

  const filtered = displayData.filter((lv) => {
    return (
      !search ||
      (lv.employeeId?.name && lv.employeeId.name.toLowerCase().includes(search.toLowerCase())) ||
      (lv.leaveType && lv.leaveType.toLowerCase().includes(search.toLowerCase())) ||
      (lv.reason && lv.reason.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const columns = [
    { 
      header: 'Employee', 
      cell: (row) => <span className="font-bold text-text">{row.employeeId?.name || 'Staff Member'}</span> 
    },
    { header: 'Type', accessor: 'leaveType' },
    { 
      header: 'Duration', 
      cell: (row) => (
        <span className="text-xs">
          {new Date(row.startDate).toLocaleDateString()} &rarr; {new Date(row.endDate).toLocaleDateString()}
        </span>
      )
    },
    { header: 'Reason', accessor: 'reason' },
    { 
      header: 'Status', 
      cell: (row) => {
        const st = row.status || 'Pending';
        const badge = st === 'Approved' ? 'bg-success/20 text-success' : st === 'Rejected' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning';
        return <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${badge}`}>{st}</span>;
      }
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-1.5">
          {row.status !== 'Approved' && (
            <button
              onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'Approved' })}
              className="px-2 py-1 text-[11px] font-semibold bg-success text-white rounded hover:bg-success/90"
              title="Approve"
            >
              Approve
            </button>
          )}
          {row.status !== 'Rejected' && (
            <button
              onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'Rejected' })}
              className="px-2 py-1 text-[11px] font-semibold bg-danger text-white rounded hover:bg-danger/90"
              title="Reject"
            >
              Reject
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <FileText className="mr-2 h-6 w-6 text-primary" /> Leave Requests & Approvals
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage employee paid time off, sick leave requests, and manager approvals.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Apply for Leave
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 flex gap-4 items-center justify-between shadow-sm">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search leave requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load leaves" onRetry={refetch} />}
      {!isLoading && !isError && filtered.length === 0 && (
        <ErrorState title="No leave applications" message="Submit a leave application when a team member requires time off." />
      )}
      {!isLoading && !isError && filtered.length > 0 && (
        <DataTable columns={columns} data={filtered} />
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text flex items-center">
                <FileText className="mr-1.5 h-5 w-5 text-primary" /> Apply for Leave
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if (!form.employeeId) {
                  toast.error('Please select an employee');
                  return;
                }
                createMutation.mutate(form); 
              }} 
              className="space-y-4 text-xs mt-4"
            >
              <div>
                <label className="font-semibold text-text block mb-1">Employee *</label>
                <select 
                  required
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId || emp.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Leave Category</label>
                <select 
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned / Privilege Leave">Earned / Privilege Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">From Date</label>
                  <input 
                    type="date" 
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">To Date</label>
                  <input 
                    type="date" 
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Reason for Leave</label>
                <textarea 
                  rows={2}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text resize-none"
                  placeholder="Reason..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={createMutation.isPending}>Submit Application</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
