import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Send, 
  CheckCircle, 
  FileText, 
  Printer, 
  ArrowRightCircle, 
  FolderKanban, 
  Receipt,
  Search,
  Building
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import DataTable from '../../components/tables/DataTable';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';

export default function Quotations() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State with Multi-Line Items
  const defaultItem = { item: '', description: '', quantity: 1, rate: 0, taxPercent: 18, discount: 0 };
  const initialQuotationForm = {
    title: '',
    clientId: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ ...defaultItem, item: 'Web Development / IT Consulting', rate: 50000 }],
    notes: 'Payment Terms: 50% Advance upon agreement, 50% upon final UAT & deployment. Taxes as applicable.'
  };
  const [formData, setFormData] = useState(initialQuotationForm);

  const { data: quotationsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const res = await api.get('/quotations?limit=100');
      return res.data || [];
    }
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients?limit=200');
      return res.data || [];
    }
  });

  const { data: catalogData } = useQuery({
    queryKey: ['serviceCatalog'],
    queryFn: async () => {
      const res = await api.get('/service-catalog?limit=100');
      return res.data || [];
    }
  });

  const clients = clientsData?.data || clientsData || [];
  const quotations = quotationsData?.data || quotationsData || [];
  const catalogServices = catalogData?.data || catalogData || [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/quotations', payload),
    onSuccess: () => {
      toast.success('Quotation created successfully!');
      queryClient.invalidateQueries(['quotations']);
      setIsCreateModalOpen(false);
      setFormData(initialQuotationForm);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create quotation')
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.put(`/quotations/${id}`, payload),
    onSuccess: () => {
      toast.success('Quotation updated successfully!');
      queryClient.invalidateQueries(['quotations']);
      setIsCreateModalOpen(false);
      setEditingQuotation(null);
      setFormData(initialQuotationForm);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update quotation')
  });

  // Submit Approval Mutation
  const submitApprovalMutation = useMutation({
    mutationFn: async (id) => api.post(`/quotations/${id}/submit-approval`),
    onSuccess: () => {
      toast.success('Quotation submitted for management approval!');
      queryClient.invalidateQueries(['quotations']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit approval')
  });

  // Convert to Invoice Mutation
  const convertToInvoiceMutation = useMutation({
    mutationFn: async (id) => api.post(`/quotations/${id}/convert-to-invoice`),
    onSuccess: (res) => {
      toast.success(`Converted to Invoice #${res.data?.invoice?.invoiceNumber || 'Created'} successfully!`);
      queryClient.invalidateQueries(['quotations']);
      queryClient.invalidateQueries(['invoices']);
      setIsViewModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to convert quotation to invoice')
  });

  // Convert to Project Mutation
  const convertToProjectMutation = useMutation({
    mutationFn: async (id) => api.post(`/quotations/${id}/convert-to-project`),
    onSuccess: (res) => {
      toast.success(`Converted to Project "${res.data?.project?.projectName}" with 7 standard milestones!`);
      queryClient.invalidateQueries(['quotations']);
      queryClient.invalidateQueries(['projects']);
      setIsViewModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to convert quotation to project')
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/quotations/${id}`),
    onSuccess: () => {
      toast.success('Quotation deleted successfully!');
      queryClient.invalidateQueries(['quotations']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete quotation')
  });

  const openCreateModal = () => {
    setEditingQuotation(null);
    setFormData(initialQuotationForm);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (quotation) => {
    setEditingQuotation(quotation);
    setFormData({
      title: quotation.title || '',
      clientId: quotation.clientId?._id || quotation.clientId || '',
      validUntil: quotation.validUntil ? new Date(quotation.validUntil).toISOString().split('T')[0] : '',
      items: (quotation.items && quotation.items.length > 0) ? quotation.items : [{ ...defaultItem }],
      notes: quotation.notes || ''
    });
    setIsCreateModalOpen(true);
  };

  // Item Management in Form
  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { ...defaultItem }]
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length <= 1) {
      toast.error('Quotation must contain at least one line item');
      return;
    }
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  const updateItemRow = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData({ ...formData, items: updated });
  };

  // Calculation helpers
  const calculatedSubtotal = formData.items.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.rate || 0)), 0);
  const calculatedDiscount = formData.items.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const calculatedTax = formData.items.reduce((sum, item) => {
    const base = (Number(item.quantity || 1) * Number(item.rate || 0)) - Number(item.discount || 0);
    return sum + (Math.max(0, base) * Number(item.taxPercent || 18)) / 100;
  }, 0);
  const calculatedGrandTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + calculatedTax);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Quotation Title is required');
      return;
    }
    if (!formData.clientId) {
      toast.error('Please select a Client for this quotation');
      return;
    }
    if (editingQuotation) {
      updateMutation.mutate({ id: editingQuotation._id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Filtered List
  const filteredQuotations = quotations.filter((q) => {
    const matchSearch = 
      !search ||
      (q.title && q.title.toLowerCase().includes(search.toLowerCase())) ||
      (q.quotationNumber && q.quotationNumber.toLowerCase().includes(search.toLowerCase())) ||
      (q.clientId?.companyName && q.clientId.companyName.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'All' || q.status === statusFilter || q.approvalStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const columnsWithActions = [
    { 
      header: 'Quotation #', 
      accessor: 'quotationNumber', 
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.quotationNumber || row._id?.slice(-6)}
        </span>
      )
    },
    { header: 'Title', accessor: 'title', cell: (row) => <span className="font-medium text-text">{row.title}</span> },
    { 
      header: 'Client', 
      cell: (row) => (
        <span className="font-semibold text-text">
          {row.clientId?.companyName || 'N/A'}
        </span>
      )
    },
    { 
      header: 'Grand Total', 
      cell: (row) => (
        <span className="font-bold text-text">
          ₹{(row.totalAmount || 0).toLocaleString('en-IN')}
        </span>
      ) 
    },
    { 
      header: 'Approval', 
      accessor: 'approvalStatus',
      cell: (row) => {
        const app = row.approvalStatus || 'Draft';
        const badgeColor = app === 'Approved' ? 'bg-success/20 text-success' : app === 'Pending Approval' ? 'bg-warning/20 text-warning' : 'bg-surface text-text-muted';
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeColor}`}>{app}</span>;
      }
    },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
          {row.status || 'Active'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => { setSelectedQuotation(row); setIsViewModalOpen(true); }}
          >
            <Eye className="mr-1 h-3.5 w-3.5" /> View
          </Button>

          <DropdownMenu>
            <DropdownItem 
              icon={Edit} 
              onClick={() => openEditModal(row)}
            >
              Edit Quotation
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
              icon={Receipt} 
              onClick={() => convertToInvoiceMutation.mutate(row._id)}
            >
              Convert to Invoice
            </DropdownItem>

            <DropdownItem 
              icon={FolderKanban} 
              onClick={() => convertToProjectMutation.mutate(row._id)}
            >
              Convert to Project
            </DropdownItem>

            <DropdownItem 
              icon={Trash2} 
              danger 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this quotation?')) {
                  deleteMutation.mutate(row._id);
                }
              }}
            >
              Delete Quotation
            </DropdownItem>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <FileText className="mr-2 h-6 w-6 text-primary" /> Quotations & Client Proposals
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Build proposals with multi-item costing, GST calculations, approval lifecycles, and 1-click invoice/project conversion.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Create Quotation
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search quotations, numbers, clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-xs text-text-muted font-medium">Filter:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-text focus:outline-none"
          >
            <option value="All">All Quotations</option>
            <option value="Draft">Draft</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Accepted">Accepted</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load quotations" onRetry={refetch} />}
      {!isLoading && !isError && filteredQuotations.length === 0 && (
        <ErrorState title="No quotations found" message="Create your first proposal to get started." />
      )}
      {!isLoading && !isError && filteredQuotations.length > 0 && (
        <DataTable columns={columnsWithActions} data={filteredQuotations} />
      )}

      {/* CREATE / EDIT QUOTATION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden my-6 animate-in fade-in zoom-in duration-150">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-base font-bold text-text flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" /> 
                {editingQuotation ? `Edit Quotation: ${editingQuotation.quotationNumber || editingQuotation.title}` : 'Create New Commercial Quotation'}
              </h2>
              <button onClick={() => { setIsCreateModalOpen(false); setEditingQuotation(null); }} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Quotation Title *</label>
                  <Input 
                    placeholder="e.g. Enterprise Web App & Mobile App Development"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Client *</label>
                  <select 
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map(c => (
                      <option key={c._id} value={c._id}>{c.companyName} ({c.clientId})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Valid Until Date</label>
                <Input 
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>

              {/* Multi-line items section */}
              <div className="border border-border p-4 rounded-xl space-y-3 bg-background/40">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="font-bold text-text text-xs uppercase tracking-wider">Proposal Line Items</span>
                  <Button type="button" size="sm" variant="outline" onClick={addItemRow}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Line Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-surface rounded-lg border border-border space-y-2">
                      {catalogServices.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-text-muted whitespace-nowrap">Catalog Preset:</span>
                          <select
                            className="w-full text-xs p-1.5 rounded bg-background border border-border text-text"
                            onChange={(e) => {
                              const srv = catalogServices.find(s => s._id === e.target.value);
                              if (srv) {
                                const updated = [...formData.items];
                                updated[idx] = {
                                  ...updated[idx],
                                  item: srv.serviceName,
                                  description: srv.description || '',
                                  rate: srv.unitPrice || 0,
                                  taxPercent: srv.taxRate ?? 18
                                };
                                setFormData({ ...formData, items: updated });
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="">-- Choose from Master Catalog (Optional) --</option>
                            {catalogServices.filter(s => s.isActive).map(s => (
                              <option key={s._id} value={s._id}>
                                {s.serviceCode} - {s.serviceName} (₹{(s.unitPrice || 0).toLocaleString()})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex justify-between items-center gap-2">
                        <Input 
                          placeholder="Item Name / Description of Service"
                          value={it.item}
                          onChange={(e) => updateItemRow(idx, 'item', e.target.value)}
                          className="flex-1"
                          required
                        />
                        {formData.items.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeItemRow(idx)}
                            className="p-2 text-danger hover:bg-danger/10 rounded transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[11px] text-text-muted block mb-0.5">Quantity</label>
                          <Input 
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => updateItemRow(idx, 'quantity', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-text-muted block mb-0.5">Unit Rate (₹)</label>
                          <Input 
                            type="number"
                            value={it.rate}
                            onChange={(e) => updateItemRow(idx, 'rate', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-text-muted block mb-0.5">Tax (GST %)</label>
                          <Input 
                            type="number"
                            value={it.taxPercent}
                            onChange={(e) => updateItemRow(idx, 'taxPercent', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-text-muted block mb-0.5">Line Total</label>
                          <div className="h-10 flex items-center px-3 bg-background rounded border border-border font-bold text-text">
                            ₹{(((it.quantity || 1) * (it.rate || 0)) * (1 + (it.taxPercent || 18) / 100)).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation Summary Box */}
                <div className="bg-surface p-3.5 rounded-lg border border-border space-y-1.5 text-xs">
                  <div className="flex justify-between text-text-muted">
                    <span>Subtotal:</span>
                    <span className="font-medium text-text">₹{calculatedSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>GST (CGST/SGST 18%):</span>
                    <span className="font-medium text-text">₹{calculatedTax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-border font-bold text-sm text-text">
                    <span>Grand Total:</span>
                    <span className="text-primary text-base">₹{calculatedGrandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Terms & Conditions</label>
                <textarea 
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => { setIsCreateModalOpen(false); setEditingQuotation(null); }}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editingQuotation ? 'Update Quotation' : 'Create Quotation'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW QUOTATION MODAL & PRINT/CONVERT */}
      {isViewModalOpen && selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in duration-150">
            
            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-base font-bold text-text">{selectedQuotation.title}</h2>
                  <p className="text-xs font-mono text-text-muted">{selectedQuotation.quotationNumber}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Area */}
            <div className="p-6 space-y-6 text-xs text-text">
              
              {/* Meta details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg border border-border">
                <div>
                  <span className="text-text-muted block text-[11px]">PREPARED FOR:</span>
                  <p className="font-bold text-sm text-text mt-0.5">{selectedQuotation.clientId?.companyName || 'Valued Client'}</p>
                  <p className="text-text-muted">{selectedQuotation.clientId?.contactPerson}</p>
                  <p className="text-text-muted">{selectedQuotation.clientId?.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-text-muted block text-[11px]">DATE & STATUS:</span>
                  <p className="font-semibold text-text mt-0.5">Created: {new Date(selectedQuotation.createdAt).toLocaleDateString()}</p>
                  <p className="text-text-muted">Valid Until: {selectedQuotation.validUntil ? new Date(selectedQuotation.validUntil).toLocaleDateString() : '30 Days'}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 font-bold rounded-full text-[10px] bg-primary/20 text-primary">
                    {selectedQuotation.approvalStatus || 'Draft'}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background border-b border-border text-text-muted font-semibold">
                    <tr>
                      <th className="p-2.5">Item & Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Rate</th>
                      <th className="p-2.5 text-right">GST %</th>
                      <th className="p-2.5 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedQuotation.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface">
                        <td className="p-2.5 font-medium">{item.item}</td>
                        <td className="p-2.5 text-center">{item.quantity}</td>
                        <td className="p-2.5 text-right font-mono">₹{(item.rate || 0).toLocaleString()}</td>
                        <td className="p-2.5 text-right">{item.taxPercent || 18}%</td>
                        <td className="p-2.5 text-right font-bold font-mono">₹{(item.amount || item.quantity * item.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs bg-background p-3.5 rounded-lg border border-border">
                  <div className="flex justify-between text-text-muted">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-text font-mono">₹{(selectedQuotation.subtotal || selectedQuotation.totalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Taxes (GST):</span>
                    <span className="font-semibold text-text font-mono">₹{(selectedQuotation.taxTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border font-bold text-sm text-text">
                    <span>Grand Total:</span>
                    <span className="text-primary font-mono text-base">₹{(selectedQuotation.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedQuotation.notes && (
                <div className="p-3 bg-background rounded border border-border text-[11px] text-text-muted">
                  <span className="font-bold text-text block mb-0.5">Terms:</span>
                  {selectedQuotation.notes}
                </div>
              )}

            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t border-border bg-background/50 flex flex-wrap justify-between items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / Export PDF
              </Button>

              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => convertToProjectMutation.mutate(selectedQuotation._id)}
                  isLoading={convertToProjectMutation.isPending}
                >
                  <FolderKanban className="mr-1.5 h-3.5 w-3.5" /> Convert to Project
                </Button>

                <Button 
                  size="sm"
                  onClick={() => convertToInvoiceMutation.mutate(selectedQuotation._id)}
                  isLoading={convertToInvoiceMutation.isPending}
                >
                  <Receipt className="mr-1.5 h-3.5 w-3.5" /> Convert to Invoice
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
