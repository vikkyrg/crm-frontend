import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import DataTable from '../../components/tables/DataTable';
import { UserCheck, Clock, CheckSquare, Calendar, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export default function EmployeePortal() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['employeePortalData'],
    queryFn: async () => {
      const res = await api.get('/portal/employee');
      return res.data || {};
    }
  });

  const attendanceMutation = useMutation({
    mutationFn: async (action) => api.post('/portal/employee/attendance', { action }),
    onSuccess: (res, action) => {
      toast.success(`Successfully recorded ${action === 'checkin' ? 'Check-In' : 'Check-Out'}!`);
      queryClient.invalidateQueries(['employeePortalData']);
    },
    onError: (err) => toast.error('Failed to record attendance')
  });

  if (isLoading) return <div className="p-6"><TableSkeleton /></div>;
  if (isError) return <div className="p-6"><ErrorState title="Failed to load Employee Portal" onRetry={refetch} /></div>;

  const { employee = {}, tasks = [], attendanceRecords = [], leaveRequests = [] } = data;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header Profile */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center">
            <User className="mr-3 h-7 w-7 text-primary" /> {employee.name || 'Employee Workspace'}
          </h1>
          <p className="text-xs text-text-muted mt-1">{employee.email} | Role: {employee.role?.name || 'Staff'}</p>
        </div>

        {/* Check In / Check Out Buttons */}
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => attendanceMutation.mutate('checkin')} 
            isLoading={attendanceMutation.isPending}
            className="bg-success hover:bg-success/90"
          >
            <Clock className="mr-2 h-4 w-4" /> Check In
          </Button>
          <Button 
            onClick={() => attendanceMutation.mutate('checkout')} 
            isLoading={attendanceMutation.isPending}
            variant="outline"
          >
            Check Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ASSIGNED TASKS */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center"><CheckSquare className="mr-2 h-5 w-5 text-primary" /> My Assigned Tasks ({tasks.length})</CardTitle></CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { header: 'Task Name', accessor: 'taskName' },
                { header: 'Priority', accessor: 'priority' },
                { header: 'Status', accessor: 'status' }
              ]}
              data={tasks}
            />
          </CardContent>
        </Card>

        {/* RECENT ATTENDANCE */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" /> Attendance History</CardTitle></CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { header: 'Date', cell: (row) => new Date(row.date).toLocaleDateString() },
                { header: 'Status', accessor: 'status' },
                { header: 'Work Hours', cell: (row) => `${row.workHours || 0} hrs` }
              ]}
              data={attendanceRecords}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
