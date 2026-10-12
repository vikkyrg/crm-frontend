import React, { useState } from 'react';
import { 
  Plus, 
  Receipt, 
  DollarSign, 
  CheckCircle2, 
  Eye, 
  Printer, 
  Search, 
  Trash2, 
  X, 
  Calendar,
  Building,
  FolderKanban
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Invoices() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Multi-line Items Form
  const defaultLineItem = { item: 'Software Development Services', description: '', quantity: 1, rate: 50000 };
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    projectId: '',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [defaultLineItem],
    discountAmount: 0,
    taxPercent: 18,
    notes: 'Please transfer payments to Innomatrics Technologies HDFC Bank Account. GSTIN applicable.'
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    notes: ''
  });

  // Queries
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients?limit=200');
      return res.data || [];
    }
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects?limit=200');
      return res.data || [];
    }
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/invoices?limit=100');
      return res.data || [];
    }
  });

  const clientList = clientsData?.data || clientsData || [];
  const projectList = projectsData?.data || projectsData || [];
  const displayData = data?.data || data || [];

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: async (payload) => {
      const subtotal = payload.items.reduce((sum, it) => sum + (Number(it.quantity || 1) * Number(it.rate || 0)), 0);
      const discountAmount = Number(payload.discountAmount) || 0;
      const taxable = Math.max(0, subtotal - discountAmount);
      const taxAmount = (taxable * Number(payload.taxPercent || 18)) / 100;
      const totalAmount = taxable + taxAmount;

      return api.post('/invoices', {
        clientId: payload.clientId,
        projectId: payload.projectId || undefined,
        dueDate: payload.dueDate,
        items: payload.items,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        notes: payload.notes
      });
    },
    onSuccess: () => {
      toast.success('Invoice created successfully!');
      setShowAddModal(false);
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['managementMetrics']);
      queryClient.invalidateQueries(['financeDashboard']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create invoice')
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async (payload) => api.post('/payments', payload),
    onSuccess: () => {
      toast.success('Payment recorded successfully! Invoice balance updated.');
      setShowPaymentModal(false);
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['managementMetrics']);
      queryClient.invalidateQueries(['ceoView']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to record payment')
  });

  // Line item helpers
  const addItemRow = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { item: '', description: '', quantity: 1, rate: 0 }]
    });
  };

  const removeItemRow = (idx) => {
    if (invoiceForm.items.length <= 1) {
      toast.error('Invoice must have at least one line item');
      return;
    }
    const updated = invoiceForm.items.filter((_, i) => i !== idx);
    setInvoiceForm({ ...invoiceForm, items: updated });
  };

  const updateItemRow = (idx, field, value) => {
    const updated = [...invoiceForm.items];
    updated[idx][field] = value;
    setInvoiceForm({ ...invoiceForm, items: updated });
  };

  // Calculations
  const calculatedSubtotal = invoiceForm.items.reduce((s, it) => s + (Number(it.quantity || 1) * Number(it.rate || 0)), 0);
  const calculatedTaxable = Math.max(0, calculatedSubtotal - (Number(invoiceForm.discountAmount) || 0));
  const calculatedTax = (calculatedTaxable * Number(invoiceForm.taxPercent || 18)) / 100;
  const calculatedTotal = calculatedTaxable + calculatedTax;

  // Filtered List
  const filteredInvoices = displayData.filter((inv) => {
    const matchSearch = 
      !search ||
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())) ||
      (inv.clientId?.companyName && inv.clientId.companyName.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { 
      header: 'Invoice #', 
      accessor: 'invoiceNumber',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.invoiceNumber}
        </span>
      )
    },
    { 
      header: 'Client & Project', 
      cell: (row) => (
        <div>
          <span className="font-bold text-text block">{row.clientId?.companyName || 'Client'}</span>
          {row.projectId?.projectName && (
            <span className="text-[11px] text-text-muted flex items-center">
              <FolderKanban className="h-3 w-3 mr-1" /> {row.projectId.projectName}
            </span>
          )}
        </div>
      )
    },
    { header: 'Total Invoiced', cell: (row) => <span className="font-mono font-bold text-text">₹{(row.totalAmount || 0).toLocaleString()}</span> },
    { header: 'Collected', cell: (row) => <span className="font-mono font-semibold text-success">₹{(row.amountPaid || 0).toLocaleString()}</span> },
    { 
      header: 'Balance Due', 
      cell: (row) => (
        <span className={`font-mono font-bold ${row.balance > 0 ? 'text-danger' : 'text-text-muted'}`}>
          ₹{(row.balance || 0).toLocaleString()}
        </span>
      ) 
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
          row.status === 'Paid' ? 'bg-success/20 text-success' : 
          row.status === 'Partially Paid' ? 'bg-warning/20 text-warning' : 
          row.status === 'Overdue' ? 'bg-danger/20 text-danger' :
          'bg-primary/10 text-primary'
        }`}>
          {row.status}
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
            onClick={() => setViewInvoice(row)}
          >
            <Eye className="mr-1 h-3.5 w-3.5" /> View
          </Button>

          {row.balance > 0 ? (
            <button
              onClick={() => {
                setSelectedInvoice(row);
                setPaymentForm({ 
                  amount: row.balance, 
                  paymentMethod: 'Bank Transfer', 
                  transactionReference: '', 
                  notes: '' 
                });
                setShowPaymentModal(true);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold bg-success text-white rounded hover:bg-success/90 transition-colors flex items-center shadow-sm"
            >
              <DollarSign className="mr-1 h-3.5 w-3.5" /> Collect Payment
            </button>
          ) : (
            <span className="text-xs font-bold text-success flex items-center px-2 py-1 bg-success/10 rounded">
              ✓ Fully Paid
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <Receipt className="mr-2 h-6 w-6 text-primary" /> Invoices & Accounts Receivable
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage billing, generate GST tax invoices, track aging balances, and collect payments.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Tax Invoice
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by invoice #, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-xs text-text-muted font-medium">Status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-text focus:outline-none"
          >
            <option value="All">All Invoices</option>
            <option value="Sent">Sent / Unpaid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid in Full</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load invoices" onRetry={refetch} />}
      {!isLoading && !isError && filteredInvoices.length === 0 && (
        <ErrorState title="No invoices found" message="Create an invoice or convert an accepted proposal." />
      )}
      {!isLoading && !isError && filteredInvoices.length > 0 && (
        <DataTable columns={columns} data={filteredInvoices} />
      )}

      {/* CREATE INVOICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-2xl shadow-2xl my-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text flex items-center">
                <Receipt className="mr-2 h-5 w-5 text-primary" /> Create Commercial Tax Invoice
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); createInvoiceMutation.mutate(invoiceForm); }} className="space-y-4 text-xs mt-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Select Client *</label>
                  <select 
                    required
                    value={invoiceForm.clientId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientId: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                  >
                    <option value="">-- Choose Client --</option>
                    {clientList.map((c) => (
                      <option key={c._id} value={c._id}>{c.companyName} ({c.clientId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Related Project (Optional)</label>
                  <select 
                    value={invoiceForm.projectId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, projectId: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="">-- Choose Project --</option>
                    {projectList.map((p) => (
                      <option key={p._id} value={p._id}>{p.projectName} ({p.projectId})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Payment Due Date *</label>
                <input 
                  type="date" 
                  required
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                />
              </div>

              {/* Line items builder */}
              <div className="border border-border p-4 rounded-xl space-y-3 bg-background/40">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="font-bold text-text uppercase text-[11px]">Invoice Items</span>
                  <Button type="button" size="sm" variant="outline" onClick={addItemRow}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {invoiceForm.items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-surface rounded-lg border border-border space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <Input 
                          placeholder="Item name / Description"
                          value={it.item}
                          onChange={(e) => updateItemRow(idx, 'item', e.target.value)}
                          className="flex-1"
                          required
                        />
                        {invoiceForm.items.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeItemRow(idx)}
                            className="p-2 text-danger hover:bg-danger/10 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
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
                          <label className="text-[11px] text-text-muted block mb-0.5">Rate (₹)</label>
                          <Input 
                            type="number"
                            value={it.rate}
                            onChange={(e) => updateItemRow(idx, 'rate', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-text-muted block mb-0.5">Line Total</label>
                          <div className="h-10 flex items-center px-3 bg-background rounded border border-border font-bold text-text">
                            ₹{((it.quantity || 1) * (it.rate || 0)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation box */}
                <div className="bg-surface p-3.5 rounded-lg border border-border space-y-1.5">
                  <div className="flex justify-between text-text-muted">
                    <span>Subtotal:</span>
                    <span className="font-mono text-text">₹{calculatedSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-muted">
                    <span>Discount (₹):</span>
                    <input 
                      type="number" 
                      value={invoiceForm.discountAmount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, discountAmount: Number(e.target.value) })}
                      className="w-28 bg-background border border-border rounded px-2 py-1 text-right text-text"
                    />
                  </div>
                  <div className="flex justify-between items-center text-text-muted">
                    <span>GST Rate (%):</span>
                    <input 
                      type="number" 
                      value={invoiceForm.taxPercent}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, taxPercent: Number(e.target.value) })}
                      className="w-28 bg-background border border-border rounded px-2 py-1 text-right text-text"
                    />
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-border font-bold text-sm text-text">
                    <span>Invoice Total:</span>
                    <span className="text-primary font-mono text-base">₹{calculatedTotal.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Invoice Remarks & Bank Terms</label>
                <textarea 
                  rows={2}
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={createInvoiceMutation.isPending}>Save & Issue Invoice</Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text flex items-center">
                <DollarSign className="mr-1.5 h-5 w-5 text-success" /> Collect Payment
              </h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-3 p-3 bg-background rounded-lg border border-border text-xs">
              <p className="text-text font-semibold">Invoice #{selectedInvoice.invoiceNumber}</p>
              <p className="text-text-muted">{selectedInvoice.clientId?.companyName}</p>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                <span className="text-text-muted">Outstanding Balance:</span>
                <span className="font-bold text-danger font-mono text-sm">₹{selectedInvoice.balance.toLocaleString()}</span>
              </div>
            </div>

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if (Number(paymentForm.amount) > selectedInvoice.balance) {
                  toast.error(`Payment cannot exceed outstanding balance of ₹${selectedInvoice.balance}`);
                  return;
                }
                recordPaymentMutation.mutate({
                  clientId: selectedInvoice.clientId?._id || selectedInvoice.clientId,
                  invoiceId: selectedInvoice._id,
                  amount: Number(paymentForm.amount),
                  paymentMethod: paymentForm.paymentMethod,
                  transactionReference: paymentForm.transactionReference,
                  notes: paymentForm.notes
                }); 
              }} 
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-semibold text-text block mb-1">Payment Amount (₹) *</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max={selectedInvoice.balance}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded p-2 text-text font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Payment Mode</label>
                <select 
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Payment Gateway">Payment Gateway</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Transaction Ref / UTR #</label>
                <input 
                  type="text" 
                  value={paymentForm.transactionReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="e.g. UTR9823412389"
                />
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Payment Notes</label>
                <input 
                  type="text" 
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="e.g. Client confirmed via WhatsApp"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={recordPaymentMutation.isPending}>Confirm Payment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW INVOICE MODAL & PRINT/EXPORT */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl w-full max-w-2xl shadow-2xl my-6 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <div>
                <h2 className="text-base font-bold text-text">Tax Invoice #{viewInvoice.invoiceNumber}</h2>
                <p className="text-xs text-text-muted">Issued to {viewInvoice.clientId?.companyName}</p>
              </div>
              <button onClick={() => setViewInvoice(null)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-text">
              {/* Header details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg border border-border">
                <div>
                  <span className="text-text-muted block text-[11px]">BILLED TO:</span>
                  <p className="font-bold text-sm text-text mt-0.5">{viewInvoice.clientId?.companyName}</p>
                  <p className="text-text-muted">{viewInvoice.clientId?.contactPerson}</p>
                  <p className="text-text-muted">{viewInvoice.clientId?.email}</p>
                  <p className="text-text-muted font-mono mt-1">GSTIN: {viewInvoice.clientId?.gstNumber || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className="text-text-muted block text-[11px]">INVOICE DETAILS:</span>
                  <p className="font-semibold text-text mt-0.5">Date: {new Date(viewInvoice.createdAt).toLocaleDateString()}</p>
                  <p className="text-danger font-medium">Due Date: {new Date(viewInvoice.dueDate).toLocaleDateString()}</p>
                  <span className={`inline-block mt-2 px-2.5 py-0.5 font-bold rounded-full text-[10px] ${
                    viewInvoice.status === 'Paid' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                    {viewInvoice.status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background border-b border-border text-text-muted font-semibold">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Rate</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {viewInvoice.items && viewInvoice.items.length > 0 ? (
                      viewInvoice.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium">{it.item}</td>
                          <td className="p-2.5 text-center">{it.quantity}</td>
                          <td className="p-2.5 text-right font-mono">₹{(it.rate || 0).toLocaleString()}</td>
                          <td className="p-2.5 text-right font-bold font-mono">₹{(it.amount || it.quantity * it.rate).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-2.5 font-medium">Professional IT / Software Development Services</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right font-mono">₹{(viewInvoice.totalAmount || 0).toLocaleString()}</td>
                        <td className="p-2.5 text-right font-bold font-mono">₹{(viewInvoice.totalAmount || 0).toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 bg-background p-3.5 rounded-lg border border-border font-mono text-xs">
                  <div className="flex justify-between text-text-muted">
                    <span>Subtotal:</span>
                    <span className="text-text font-semibold">₹{(viewInvoice.subtotal || viewInvoice.totalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>GST Taxes:</span>
                    <span className="text-text font-semibold">₹{(viewInvoice.taxAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-border font-bold text-sm text-text">
                    <span>Total Amount:</span>
                    <span className="text-primary text-base">₹{(viewInvoice.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-success font-semibold">
                    <span>Amount Paid:</span>
                    <span>₹{(viewInvoice.amountPaid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-danger font-bold text-sm pt-1 border-t border-border">
                    <span>Balance Due:</span>
                    <span>₹{(viewInvoice.balance || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-border bg-background/50 flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / Export PDF
              </Button>
              <Button size="sm" onClick={() => setViewInvoice(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
