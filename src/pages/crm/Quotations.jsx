import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, X, Send, CheckCircle, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import DataTable from '../../components/tables/DataTable';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';

const fetchQuotations = async () => {
  const res = await api.get('/quotations');
  return res.data || res;
};

const fetchClients = async () => {
  const res = await api.get('/clients');
  return res.data || res;
};

export default function Quotations() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    validUntil: '',
    item: '',
    rate: '',
    quantity: 1,
    taxPercent: 18,
    notes: ''
  });

  const { data: quotationsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['quotations'],
    queryFn: fetchQuotations
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients
  });

  const clients = clientsData?.data || clientsData || [];
  const quotations = quotationsData?.data || quotationsData || [];

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const items = [
        {
          item: payload.item || 'Service / Product',
          rate: Number(payload.rate) || 0,
          quantity: Number(payload.quantity) || 1,
          taxPercent: Number(payload.taxPercent) || 18
        }
      ];
      return api.post('/quotations', {
        title: payload.title,
        clientId: payload.clientId || undefined,
        validUntil: payload.validUntil || undefined,
        items,
        notes: payload.notes
      });
    },
    onSuccess: () => {
      toast.success('Quotation created successfully!');
      queryClient.invalidateQueries(['quotations']);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        clientId: '',
        validUntil: '',
        item: '',
        rate: '',
        quantity: 1,
        taxPercent: 18,
        notes: ''
      });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create quotation')
  });

  const submitApprovalMutation = useMutation({
    mutationFn: async (id) => api.post(`/quotations/${id}/submit-approval`),
    onSuccess: () => {
      toast.success('Quotation submitted for approval!');
      queryClient.invalidateQueries(['quotations']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit approval')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/quotations/${id}`),
    onSuccess: () => {
      toast.success('Quotation deleted successfully!');
      queryClient.invalidateQueries(['quotations']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete quotation')
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Quotation title is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const columns = [
    { header: 'Quotation #', accessor: 'quotationNumber', cell: (row) => row.quotationNumber || row._id?.slice(-6) },
    { header: 'Title', accessor: 'title', cell: (row) => row.title || 'Quotation' },
    { 
      header: 'Client', 
      accessor: 'clientId', 
      cell: (row) => row.clientId?.companyName || row.clientId?.name || 'N/A' 
    },
    { 
      header: 'Total Amount', 
      accessor: 'totalAmount', 
      cell: (row) => row.totalAmount ? `₹${Number(row.totalAmount).toLocaleString('en-IN')}` : '₹0' 
    },
    { 
      header: 'Approval', 
      accessor: 'approvalStatus',
      cell: (row) => {
        const app = row.approvalStatus || 'Draft';
        const badgeColor = app === 'Approved' ? 'bg-success/10 text-success' : app === 'Pending Approval' ? 'bg-warning/10 text-warning' : 'bg-surface text-text-muted';
        return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badgeColor}`}>{app}</span>;
      }
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
          {row.status || 'Active'}
        </span>
      )
    }
  ];

  const columnsWithActions = [
    ...columns,
    {
      header: 'Actions',
      cell: (row) => (
        <DropdownMenu>
          <DropdownItem 
            icon={Eye} 
            onClick={() => {
              setSelectedQuotation(row);
              setIsViewModalOpen(true);
            }}
          >
            View Details
          </DropdownItem>

          {row.approvalStatus !== 'Approved' && row.approvalStatus !== 'Pending Approval' && (
            <DropdownItem 
              icon={Send} 
              onClick={() => submitApprovalMutation.mutate(row._id)}
            >
              Submit for Approval
            </DropdownItem>
          )}

          <DropdownItem 
            icon={Trash2} 
            danger 
            onClick={() => {
              if (window.confirm('Delete this quotation?')) {
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
          <h1 className="text-2xl font-bold tracking-tight text-text">Quotations</h1>
          <p className="text-sm text-text-muted mt-1">Manage and track your proposals & quotations.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Quotation
        </Button>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load quotations" onRetry={refetch} />}
      {!isLoading && !isError && (
        <DataTable 
          columns={columnsWithActions} 
          data={quotations} 
        />
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-lg font-semibold text-text">Create New Quotation</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Quotation Title *</label>
                <Input 
                  placeholder="e.g. Website Development Proposal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="text-xs font-medium text-text-muted block mb-1">Valid Until</label>
                  <Input 
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div className="border border-border p-3 rounded-lg space-y-3 bg-background/30">
                <span className="text-xs font-semibold text-text uppercase tracking-wider block">Line Item</span>
                <div>
                  <Input 
                    placeholder="Item Description / Service Name"
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Rate (₹)</label>
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Quantity</label>
                    <Input 
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Tax (%)</label>
                    <Input 
                      type="number"
                      value={formData.taxPercent}
                      onChange={(e) => setFormData({ ...formData, taxPercent: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Notes / Terms</label>
                <textarea 
                  className="w-full rounded-md border border-border bg-background p-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary h-20"
                  placeholder="Additional terms or notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Quotation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {isViewModalOpen && selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <div>
                <h2 className="text-lg font-semibold text-text">{selectedQuotation.title || 'Quotation Details'}</h2>
                <p className="text-xs text-text-muted">{selectedQuotation.quotationNumber}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-sm text-text">
              <div className="grid grid-cols-2 gap-4 border-b border-border pb-3">
                <div>
                  <span className="text-xs text-text-muted block">Client:</span>
                  <p className="font-medium">{selectedQuotation.clientId?.companyName || selectedQuotation.clientId?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">Approval Status:</span>
                  <p className="font-medium text-primary">{selectedQuotation.approvalStatus || 'Draft'}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-text-muted block mb-2 font-semibold uppercase">Items:</span>
                <div className="space-y-2">
                  {selectedQuotation.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-background p-2.5 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-text">{item.item}</p>
                        <p className="text-xs text-text-muted">Qty: {item.quantity} × ₹{item.rate}</p>
                      </div>
                      <span className="font-semibold text-text">₹{item.amount?.toLocaleString('en-IN') || (item.quantity * item.rate)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-base font-bold">Total Amount:</span>
                <span className="text-xl font-bold text-primary">₹{selectedQuotation.totalAmount?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
