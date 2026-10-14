import React, { useState } from 'react';
import { Plus, Trash2, X, FileText, Edit, Eye } from 'lucide-react';
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
  const [editingContract, setEditingContract] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);

  const initialForm = {
    title: '',
    clientId: '',
    contractType: 'Service Agreement',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    contractValue: '',
    status: 'Active',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);

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
      setFormData(initialForm);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create contract')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.put(`/contracts/${id}`, payload),
    onSuccess: () => {
      toast.success('Contract updated successfully!');
      queryClient.invalidateQueries(['contracts']);
      setIsModalOpen(false);
      setEditingContract(null);
      setFormData(initialForm);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update contract')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/contracts/${id}`),
    onSuccess: () => {
      toast.success('Contract deleted successfully!');
      queryClient.invalidateQueries(['contracts']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete contract')
  });

  const openCreateModal = () => {
    setEditingContract(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (contract) => {
    setEditingContract(contract);
    setFormData({
      title: contract.title || contract.contractNumber || '',
      clientId: contract.clientId?._id || contract.clientId || '',
      contractType: contract.contractType || 'Service Agreement',
      startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
      endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
      contractValue: contract.contractValue || '',
      status: contract.status || 'Active',
      notes: contract.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Contract Title is required');
      return;
    }
    const payload = {
      ...formData,
      contractValue: Number(formData.contractValue) || 0
    };
    if (editingContract) {
      updateMutation.mutate({ id: editingContract._id, payload });
    } else {
      createMutation.mutate(payload);
    }
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
          <DropdownItem icon={Eye} onClick={() => setViewingContract(row)}>
            View Details
          </DropdownItem>
          <DropdownItem icon={Edit} onClick={() => openEditModal(row)}>
            Edit Contract
          </DropdownItem>
          <DropdownItem 
            icon={Trash2} 
            danger 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete contract "${row.title || 'this contract'}"?`)) {
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
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Create Contract
        </Button>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load contracts" onRetry={refetch} />}
      {!isLoading && !isError && (
        <DataTable columns={columnsWithActions} data={contracts} />
      )}

      {/* Create & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-lg font-semibold text-text">
                {editingContract ? 'Edit Contract' : 'Create New Contract'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setEditingContract(null); }} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1">Contract Value (₹)</label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={formData.contractValue}
                    onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1">Status</label>
                  <select 
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setEditingContract(null); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingContract ? 'Update Contract' : 'Create Contract'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-lg font-semibold text-text flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" /> Contract Details
              </h2>
              <button onClick={() => setViewingContract(null)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="text-[10px] text-text-muted uppercase font-semibold">Contract Title</p>
                <p className="text-base font-bold text-text mt-0.5">{viewingContract.title}</p>
                <p className="font-mono text-text-muted">{viewingContract.contractNumber || 'Standard Contract'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-background p-3 rounded-lg border border-border">
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-semibold">Client</p>
                  <p className="font-bold text-text mt-0.5">{viewingContract.clientId?.companyName || viewingContract.clientId?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-semibold">Agreement Type</p>
                  <p className="font-bold text-text mt-0.5">{viewingContract.contractType || 'Service Agreement'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-semibold">Contract Value</p>
                  <p className="font-bold text-primary text-sm mt-0.5">₹{Number(viewingContract.contractValue || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-semibold">Status</p>
                  <p className="font-bold text-success mt-0.5">{viewingContract.status || 'Active'}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const c = viewingContract;
                    setViewingContract(null);
                    openEditModal(c);
                  }}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit Contract
                </Button>
                <Button size="sm" onClick={() => setViewingContract(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
