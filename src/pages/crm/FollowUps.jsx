import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle, Edit, Trash2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';

const fetchFollowUps = async () => {
  const res = await api.get('/followups');
  return res.data || res;
};

const fetchLeads = async () => {
  const res = await api.get('/leads');
  return res.data || res;
};

export default function FollowUps() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leadId: '',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '10:00',
    followUpType: 'Call',
    notes: ''
  });

  const { data: followUpsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['followups'],
    queryFn: fetchFollowUps
  });

  const { data: leadsData } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads
  });

  const leads = leadsData?.data || leadsData || [];
  const followUps = followUpsData?.data || followUpsData || [];

  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/followups', payload),
    onSuccess: () => {
      toast.success('Follow-up scheduled successfully!');
      queryClient.invalidateQueries(['followups']);
      setIsModalOpen(false);
      setFormData({
        leadId: '',
        followUpDate: new Date().toISOString().split('T')[0],
        followUpTime: '10:00',
        followUpType: 'Call',
        notes: ''
      });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to schedule follow-up')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => api.put(`/followups/${id}`, data),
    onSuccess: () => {
      toast.success('Follow-up updated successfully!');
      queryClient.invalidateQueries(['followups']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update follow-up')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/followups/${id}`),
    onSuccess: () => {
      toast.success('Follow-up deleted successfully!');
      queryClient.invalidateQueries(['followups']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete follow-up')
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.leadId) {
      toast.error('Please select a lead');
      return;
    }
    createMutation.mutate(formData);
  };

  const columns = [
    { 
      header: 'Lead / Contact', 
      accessor: 'leadId',
      cell: (row) => row.leadId?.name || row.leadId?.company || row.lead || 'N/A'
    },
    { header: 'Type', accessor: 'followUpType', cell: (row) => row.followUpType || row.type || 'Call' },
    { 
      header: 'Date', 
      accessor: 'followUpDate', 
      cell: (row) => {
        const d = row.followUpDate || row.date;
        return d ? new Date(d).toLocaleDateString() : 'N/A';
      }
    },
    { header: 'Time', accessor: 'followUpTime', cell: (row) => row.followUpTime || row.time || '-' },
    { header: 'Notes', accessor: 'notes', cell: (row) => row.notes || '-' },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => {
        const status = row.status || 'Pending';
        const colorClass = status === 'Completed' 
          ? 'bg-success/10 text-success' 
          : status === 'Cancelled'
          ? 'bg-danger/10 text-danger'
          : 'bg-warning/10 text-warning';
        return (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colorClass}`}>
            {status}
          </span>
        );
      }
    }
  ];

  const columnsWithActions = [
    ...columns,
    {
      header: 'Actions',
      cell: (row) => (
        <DropdownMenu>
          {row.status !== 'Completed' && (
            <DropdownItem 
              icon={CheckCircle} 
              onClick={() => updateMutation.mutate({ id: row._id, data: { status: 'Completed' } })}
            >
              Mark Completed
            </DropdownItem>
          )}
          <DropdownItem 
            icon={Trash2} 
            danger 
            onClick={() => {
              if (window.confirm('Delete this follow-up?')) {
                deleteMutation.mutate(row._id);
              }
            }}
          >
            Delete
          </DropdownItem>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Follow-ups</h1>
          <p className="text-sm text-text-muted mt-1">Schedule and manage your follow-ups.</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Follow-up
          </Button>
        </div>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load follow-ups" onRetry={refetch} />}
      {!isLoading && !isError && (
        <DataTable 
          columns={columnsWithActions} 
          data={followUps} 
        />
      )}

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-lg font-semibold text-text">Schedule Follow-up</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Select Lead *</label>
                <select 
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Lead --</option>
                  {leads.map(lead => (
                    <option key={lead._id} value={lead._id}>
                      {lead.name} {lead.company ? `(${lead.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1">Date *</label>
                  <Input 
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1">Time</label>
                  <Input 
                    type="time"
                    value={formData.followUpTime}
                    onChange={(e) => setFormData({ ...formData, followUpTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Follow-up Type</label>
                <select 
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.followUpType}
                  onChange={(e) => setFormData({ ...formData, followUpType: e.target.value })}
                >
                  <option value="Call">Call</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Demo">Demo</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Notes / Agenda</label>
                <textarea 
                  className="w-full rounded-md border border-border bg-background p-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary h-20"
                  placeholder="Details for this follow-up..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Scheduling...' : 'Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
