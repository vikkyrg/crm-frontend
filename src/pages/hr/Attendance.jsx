import React, { useState } from 'react';
import { 
  Plus, 
  CalendarDays, 
  Search, 
  Clock, 
  User, 
  CheckCircle2, 
  X,
  Building
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Attendance() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:30',
    checkOut: '18:30',
    status: 'Present',
    workMode: 'Office'
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
    queryKey: ['attendances'],
    queryFn: async () => {
      const res = await api.get('/attendances?limit=100');
      return res.data || [];
    }
  });

  const employees = employeesData?.data || employeesData || [];
  const displayData = data?.data || data || [];

  const logMutation = useMutation({
    mutationFn: async (payload) => api.post('/attendances', payload),
    onSuccess: () => {
      toast.success('Attendance recorded successfully!');
      setShowAddModal(false);
      queryClient.invalidateQueries(['attendances']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to record attendance')
  });

  const filtered = displayData.filter((att) => {
    return (
      !search ||
      (att.employeeId?.name && att.employeeId.name.toLowerCase().includes(search.toLowerCase())) ||
      (att.status && att.status.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const columns = [
    { 
      header: 'Employee', 
      cell: (row) => (
        <span className="font-bold text-text">
          {row.employeeId?.name || 'Staff Member'}
        </span>
      )
    },
    { header: 'Date', cell: (row) => new Date(row.date || row.createdAt).toLocaleDateString() },
    { header: 'Check In', cell: (row) => row.checkIn || '09:30 AM' },
    { header: 'Check Out', cell: (row) => row.checkOut || '06:30 PM' },
    { header: 'Work Mode', cell: (row) => row.workMode || 'Office' },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
          row.status === 'Present' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
        }`}>
          {row.status || 'Present'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <CalendarDays className="mr-2 h-6 w-6 text-primary" /> Daily Attendance Records
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Staff biometric check-in, remote work logging, and hours worked.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Log Attendance
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 flex gap-4 items-center justify-between shadow-sm">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search employee attendance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load attendance" onRetry={refetch} />}
      {!isLoading && !isError && filtered.length === 0 && (
        <ErrorState title="No attendance logs" message="Log employee check-in or sync from employee portal." />
      )}
      {!isLoading && !isError && filtered.length > 0 && (
        <DataTable columns={columns} data={filtered} />
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text flex items-center">
                <CalendarDays className="mr-1.5 h-5 w-5 text-primary" /> Record Attendance
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
                logMutation.mutate(form); 
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
                <label className="font-semibold text-text block mb-1">Date</label>
                <input 
                  type="date" 
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Check In Time</label>
                  <input 
                    type="time" 
                    value={form.checkIn}
                    onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">Check Out Time</label>
                  <input 
                    type="time" 
                    value={form.checkOut}
                    onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Status</label>
                  <select 
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">Work Mode</label>
                  <select 
                    value={form.workMode}
                    onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Office">Office</option>
                    <option value="Remote / WFH">Remote / WFH</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={logMutation.isPending}>Save Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
