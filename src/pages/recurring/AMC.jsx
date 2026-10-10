import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';

const fetchAMCs = async () => {
  const res = await api.get('/amc');
  return res.data || res;
};

const fetchClients = async () => {
  const res = await api.get('/clients');
  return res.data || res;
};

export default function AMC() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    serviceName: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    amcAmount: '',
    notes: ''
  });

  const { data: amcData, isLoading, isError, refetch } = useQuery({
    queryKey: ['amc'],
    queryFn: fetchAMCs
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients
  });

  const clients = clientsData?.data || clientsData || [];
  const amcs = amcData?.data || amcData || [];

  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/amc', payload),
    onSuccess: () => {
      toast.success('AMC Record added successfully!');
      queryClient.invalidateQueries(['amc']);
      setIsModalOpen(false);
      setFormData({
        title: '',
        clientId: '',
        serviceName: '',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        amcAmount: '',
        notes: ''
      });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add AMC')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/amc/${id}`),
    onSuccess: () => {
      toast.success('AMC deleted successfully!');
      queryClient.invalidateQueries(['amc']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete AMC')
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.serviceName && !formData.title) {
      toast.error('Service Name or Title is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const columns = [
    { header: 'AMC Title / Service', accessor: 'serviceName', cell: (row) => row.serviceName || row.title || row.service || 'AMC Service' },
    { 
      header: 'Client', 
      accessor: 'clientId', 
      cell: (row) => row.clientId?.companyName || row.clientId?.name || row.client || 'N/A' 
    },
    { 
      header: 'Expiry Date', 
      accessor: 'expiryDate', 
      cell: (row) => {
        const d = row.expiryDate || row.expiry;
        return d ? new Date(d).toLocaleDateString() : 'N/A';
      }
    },
    { 
      header: 'Amount (₹)', 
      accessor: 'amcAmount', 
      cell: (row) => row.amcAmount ? `₹${Number(row.amcAmount).toLocaleString('en-IN')}` : row.value || '-' 
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => {
        const status = row.status || 'Active';
        const color = status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning';
        return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${color}`}>{status}</span>;
      }
    },
  ];

  const columnsWithActions = [
    ...columns,
    {
      header: 'Actions',
      cell: (row) => (
        <DropdownMenu>
          <DropdownItem 
            icon={Trash2} 
            danger 
            onClick={() => {
              if (window.confirm('Delete this AMC record?')) {
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
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">AMC / Renewals</h1>
          <p className="text-sm text-text-muted mt-1">Track recurring business and annual maintenance contracts.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add AMC
        </Button>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load AMC contracts" onRetry={refetch} />}
      {!isLoading && !isError && (
        <DataTable columns={columnsWithActions} data={amcs} />
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-lg font-semibold text-text">Add AMC Contract</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Service Name / Title *</label>
                <Input 
                  placeholder="e.g. Server & Cloud Maintenance AMC"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Client</label>
                <select 
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.companyName || c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1">Start Date</label>
                  <Input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1">Expiry Date</label>
                  <Input 
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">AMC Value / Amount (₹)</label>
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={formData.amcAmount}
                  onChange={(e) => setFormData({ ...formData, amcAmount: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Saving...' : 'Save AMC'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
