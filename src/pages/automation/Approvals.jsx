import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import DataTable from '../../components/tables/DataTable';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';

export default function Approvals() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Pending');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const res = await api.get('/approvals');
      return res.data || [];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => api.put(`/approvals/${id}`, { status }),
    onSuccess: () => {
      toast.success('Approval status updated successfully!');
      queryClient.invalidateQueries(['approvals']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update approval')
  });

  if (isLoading) return <div className="p-6"><TableSkeleton /></div>;
  if (isError) return <div className="p-6"><ErrorState title="Failed to load approvals" onRetry={refetch} /></div>;

  const approvals = data?.data || data || [];
  const pendingApprovals = approvals.filter(a => a.status === 'Pending');
  const pastApprovals = approvals.filter(a => a.status !== 'Pending');

  const displayData = activeTab === 'Pending' ? pendingApprovals : pastApprovals;

  const columns = [
    { 
      header: 'Module', 
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <span className="font-bold text-text">{row.module}</span>
        </div>
      ) 
    },
    { 
      header: 'Requested By', 
      cell: (row) => row.requestedBy?.name || 'System' 
    },
    { 
      header: 'Amount / Value', 
      cell: (row) => row.amount > 0 ? `₹${row.amount}` : 'N/A' 
    },
    { header: 'Level', accessor: 'level' },
    { 
      header: 'Status', 
      cell: (row) => {
        if (row.status === 'Approved') return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-success/20 text-success">Approved</span>;
        if (row.status === 'Rejected') return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-danger/20 text-danger">Rejected</span>;
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-warning/20 text-warning">Pending</span>;
      }
    },
    {
      header: 'Actions',
      cell: (row) => {
        if (row.status !== 'Pending') {
          return <span className="text-xs text-text-muted">Processed on {new Date(row.updatedAt).toLocaleDateString()}</span>;
        }
        return (
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'Approved' })}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="text-danger border-danger/30 hover:bg-danger/10" onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'Rejected' })}>
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <ShieldCheck className="mr-3 h-7 w-7 text-primary" /> Approval Workflow Engine
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Centralized hub for reviewing and authorizing multi-level requests across all modules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning">Pending Approvals</p>
                <h3 className="text-3xl font-bold text-text mt-2">{pendingApprovals.length}</h3>
              </div>
              <div className="p-3 bg-warning/20 rounded-full">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-success/10 border-success/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success">Approved</p>
                <h3 className="text-3xl font-bold text-text mt-2">{approvals.filter(a => a.status === 'Approved').length}</h3>
              </div>
              <div className="p-3 bg-success/20 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-danger/10 border-danger/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-danger">Rejected</p>
                <h3 className="text-3xl font-bold text-text mt-2">{approvals.filter(a => a.status === 'Rejected').length}</h3>
              </div>
              <div className="p-3 bg-danger/20 rounded-full">
                <XCircle className="h-6 w-6 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-4 border-b border-border">
        <button
          onClick={() => setActiveTab('Pending')}
          className={`pb-2 font-medium text-sm transition-colors ${
            activeTab === 'Pending' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text'
          }`}
        >
          Pending Requests
        </button>
        <button
          onClick={() => setActiveTab('History')}
          className={`pb-2 font-medium text-sm transition-colors ${
            activeTab === 'History' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text'
          }`}
        >
          Approval History
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-sm">
        {displayData.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text">You're all caught up!</h3>
            <p className="text-sm text-text-muted mt-1">There are no {activeTab.toLowerCase()} approvals at the moment.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={displayData} />
        )}
      </div>
    </div>
  );
}
