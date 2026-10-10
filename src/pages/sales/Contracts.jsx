import React, { useState } from 'react';
import { Plus, Trash2, X, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import DataTable from '../../components/tables/DataTable';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';

const fetchContracts = async () => {
  const res = await api.get('/contracts');
  return res.data || res;
};

const fetchClients = async () => {
  const res = await api.get('/clients');
  return res.data || res;
};

export default function Contracts() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    contractType: 'Service Agreement',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    contractValue: '',
    notes: ''
  });

  const { data: contractsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['contracts'],
    queryFn: fetchContracts
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients
  });

  const clients = clientsData?.data || clientsData || [];
  const contracts = contractsData?.data || contractsData || [];

  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/contracts', payload),
    onSuccess: () => {
      toast.success('Contract created successfully!');
      queryClient.invalidateQueries(['contracts']);
      setIsModalOpen(false);
      setFormData({
        title: '',
        clientId: '',
        contractType: 'Service Agreement',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        contractValue: '',
        notes: ''
      });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create contract')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/contracts/${id}`),
    onSuccess: () => {
      toast.success('Contract deleted successfully!');
      queryClient.invalidateQueries(['contracts']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete contract')
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Contract Title is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const columns = [
    { header: 'Title', accessor: 'title', cell: (row) => row.title || row.contractNumber || 'Contract' },
    { 
      header: 'Client', 
      accessor: 'clientId', 
      cell: (row) => row.clientId?.companyName || row.clientId?.name || row.client || 'N/A' 
    },
    { header: 'Type', accessor: 'contractType', cell: (row) => row.contractType || row.type || 'Service Agreement' },
    { 
      header: 'Start Date', 
      accessor: 'startDate', 
      cell: (row) => {
        const d = row.startDate || row.start;
        return d ? new Date(d).toLocaleDateString() : 'N/A';
      }
    },
    { 
      header: 'End Date', 
      accessor: 'endDate', 
      cell: (row) => {
        const d = row.endDate || row.end;
        return d ? new Date(d).toLocaleDateString() : 'N/A';
      }
    },
    { 
      header: 'Value', 
      accessor: 'contractValue', 
      cell: (row) => row.contractValue ? `₹${Number(row.contractValue).toLocaleString('en-IN')}` : row.value || '-' 
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
          {row.status || 'Active'}
        </span>
      )
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
              if (window.confirm('Delete this contract?')) {
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
          <h1 className="text-2xl font-bold tracking-tight text-text">Agreements / Contracts</h1>
          <p className="text-sm text-text-muted mt-1">Manage legal and service agreements.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Contract
        </Button>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load contracts" onRetry={refetch} />}
      {!isLoading && !isError && (
        <DataTable columns={columnsWithActions} data={contracts} />
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-lg font-semibold text-text">Create New Contract</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Contract Title *</label>
                <Input 
                  placeholder="e.g. Annual Maintenance Contract 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Contract Type</label>
                <select 
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                >
                  <option value="Service Agreement">Service Agreement</option>
                  <option value="NDA">NDA</option>
                  <option value="Retainer">Retainer</option>
                  <option value="SLA">SLA</option>
                  <option value="Custom">Custom</option>
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
                  <label className="text-xs font-medium text-text-muted block mb-1">End Date</label>
                  <Input 
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Contract Value (₹)</label>
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={formData.contractValue}
                  onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Contract'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
