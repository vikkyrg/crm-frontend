import React, { useState } from 'react';
import { Plus, Briefcase, Eye, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Clients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstNumber: '',
    industry: '',
    clientType: 'Enterprise'
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients');
      return res.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/clients', payload),
    onSuccess: (res) => {
      toast.success('Client added successfully!');
      setShowAddModal(false);
      setFormData({ companyName: '', contactPerson: '', email: '', phone: '', gstNumber: '', industry: '', clientType: 'Enterprise' });
      queryClient.invalidateQueries(['clients']);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to create client';
      toast.error(msg, { duration: 5000 });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id) => api.delete(`/clients/${id}`),
    onSuccess: () => {
      toast.success('Client deleted successfully!');
      queryClient.invalidateQueries(['clients']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete client')
  });

  const displayData = data?.data || data || [];

  const columns = [
    { header: 'Client ID', accessor: 'clientId' },
    { 
      header: 'Company Name', 
      cell: (row) => (
        <Link to={`/clients/${row._id}`} className="font-bold text-primary hover:underline">
          {row.companyName}
        </Link>
      )
    },
    { header: 'Contact Person', accessor: 'contactPerson' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Client Type', accessor: 'clientType' },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className="px-2.5 py-1 text-xs font-bold bg-success/20 text-success rounded-full">
          {row.status || 'Active'}
        </span>
      )
    },
    {
      header: 'Client 360',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Link 
            to={`/clients/${row._id}`} 
            className="flex items-center px-3 py-1 bg-primary text-white text-xs font-bold rounded hover:bg-primary/90 transition-colors"
          >
            <Eye className="mr-1 h-3.5 w-3.5" /> 360 View
          </Link>
          <DropdownMenu>
            <DropdownItem icon={Edit} onClick={() => toast.info('Edit Client coming soon')}>Edit Client</DropdownItem>
            <DropdownItem 
              icon={Trash2} 
              danger 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this client?')) {
                  deleteClientMutation.mutate(row._id);
                }
              }}
            >
              Delete Client
            </DropdownItem>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <Briefcase className="mr-2 h-6 w-6 text-primary" /> Client Master Database
          </h1>
          <p className="text-sm text-text-muted mt-1">Single master directory of all company enterprise clients with 360° view integration.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load clients" onRetry={refetch} />}
      {!isLoading && !isError && displayData.length === 0 && (
        <ErrorState title="No clients found" message="There are currently no client records in the master database." />
      )}
      {!isLoading && !isError && displayData.length > 0 && (
        <DataTable columns={columns} data={displayData} />
      )}

      {/* CREATE CLIENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-text mb-4">Add Master Client</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text block mb-1">Company Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="e.g. Acme Technologies"
                />
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Contact Person</label>
                <input 
                  type="text" 
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="contact@acme.com"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">GST Number</label>
                  <input 
                    type="text" 
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="29AAAAA0000A1Z5"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Client Type</label>
                  <select 
                    value={formData.clientType}
                    onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Enterprise">Enterprise</option>
                    <option value="SMB">SMB</option>
                    <option value="Startup">Startup</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={createMutation.isPending}>Save Client</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
