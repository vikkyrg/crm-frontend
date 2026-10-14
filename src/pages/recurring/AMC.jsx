import React, { useState } from 'react';
import { Plus, Trash2, X, Edit, Eye, Wrench } from 'lucide-react';
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
  const [editingAMC, setEditingAMC] = useState(null);
  const [viewingAMC, setViewingAMC] = useState(null);

  const initialForm = {
    title: '',
    clientId: '',
    serviceName: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    amcAmount: '',
    status: 'Active',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);

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
      setFormData(initialForm);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add AMC')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.put(`/amc/${id}`, payload),
    onSuccess: () => {
      toast.success('AMC Record updated successfully!');
      queryClient.invalidateQueries(['amc']);
      setIsModalOpen(false);
      setEditingAMC(null);
      setFormData(initialForm);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update AMC')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/amc/${id}`),
    onSuccess: () => {
      toast.success('AMC deleted successfully!');
      queryClient.invalidateQueries(['amc']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete AMC')
  });

  const openCreateModal = () => {
    setEditingAMC(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (amc) => {
    setEditingAMC(amc);
    setFormData({
      title: amc.title || amc.serviceName || '',
      clientId: amc.clientId?._id || amc.clientId || '',
      serviceName: amc.serviceName || amc.title || '',
      startDate: amc.startDate ? new Date(amc.startDate).toISOString().split('T')[0] : '',
      expiryDate: amc.expiryDate || amc.endDate ? new Date(amc.expiryDate || amc.endDate).toISOString().split('T')[0] : '',
      amcAmount: amc.amcValue || amc.amcAmount || '',
      status: amc.status || 'Active',
      notes: amc.notes || amc.coverageDetails || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.serviceName && !formData.title) {
      toast.error('Service Name or Title is required');
      return;
    }
    const payload = {
      ...formData,
      title: formData.title || formData.serviceName,
      endDate: formData.expiryDate || formData.endDate,
      amcValue: Number(formData.amcAmount || formData.amcValue || 0)
    };
    if (editingAMC) {
      updateMutation.mutate({ id: editingAMC._id, payload });
    } else {
      createMutation.mutate(payload);
    }
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
        const d = row.expiryDate || row.endDate || row.expiry;
        return d ? new Date(d).toLocaleDateString() : 'N/A';
      }
    },
    { 
      header: 'Amount (₹)', 
      accessor: 'amcAmount', 
      cell: (row) => row.amcAmount || row.amcValue ? `₹${Number(row.amcAmount || row.amcValue).toLocaleString('en-IN')}` : row.value || '-' 
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
          <DropdownItem icon={Eye} onClick={() => setViewingAMC(row)}>
            View Details
          </DropdownItem>
          <DropdownItem icon={Edit} onClick={() => openEditModal(row)}>
            Edit AMC
          </DropdownItem>
          <DropdownItem 
            icon={Trash2} 
            danger 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete AMC for "${row.serviceName || row.title || 'this service'}"?`)) {
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
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add AMC
        </Button>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load AMC contracts" onRetry={refetch} />}
      {!isLoading && !isError && (
        <DataTable columns={columnsWithActions} data={amcs} />
      )}

      {/* Add & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-lg font-semibold text-text">
                {editingAMC ? 'Edit AMC Contract' : 'Add AMC Contract'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setEditingAMC(null); }} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Service Name / Title *</label>
                <Input 
                  placeholder="e.g. Server & Cloud Maintenance AMC"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value, title: e.target.value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1">AMC Value (₹)</label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={formData.amcAmount}
                    onChange={(e) => setFormData({ ...formData, amcAmount: e.target.value })}
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
                    <option value="Pending Renewal">Pending Renewal</option>
                    <option value="Expired">Expired</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setEditingAMC(null); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingAMC ? 'Update AMC' : 'Save AMC Contract'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingAMC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-lg font-semibold text-text flex items-center">
                <Wrench className="mr-2 h-5 w-5 text-primary" /> AMC Contract Details
              </h2>
              <button onClick={() => setViewingAMC(null)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="text-[10px] text-text-muted uppercase font-semibold">Service Title</p>
                <p className="text-base font-bold text-text mt-0.5">{viewingAMC.serviceName || viewingAMC.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-background p-3 rounded-lg border border-border">
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-semibold">Client</p>
                  <p className="font-bold text-text mt-0.5">{viewingAMC.clientId?.companyName || viewingAMC.clientId?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-semibold">Annual Value</p>
                  <p className="font-bold text-primary text-sm mt-0.5">₹{Number(viewingAMC.amcValue || viewingAMC.amcAmount || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-semibold">Expiry Date</p>
                  <p className="font-bold text-text mt-0.5">
                    {viewingAMC.expiryDate || viewingAMC.endDate ? new Date(viewingAMC.expiryDate || viewingAMC.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-semibold">Status</p>
                  <p className="font-bold text-success mt-0.5">{viewingAMC.status || 'Active'}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const a = viewingAMC;
                    setViewingAMC(null);
                    openEditModal(a);
                  }}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit AMC
                </Button>
                <Button size="sm" onClick={() => setViewingAMC(null)}>
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
