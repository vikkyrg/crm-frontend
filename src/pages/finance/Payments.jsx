import React, { useState } from 'react';
import { 
  Plus, 
  CreditCard, 
  DollarSign, 
  Search, 
  Calendar, 
  Receipt, 
  X,
  Building,
  CheckCircle2,
  Printer,
  Download,
  AlertCircle,
  FolderKanban,
  FileText,
  Clock,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Payments() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [formErrors, setFormErrors] = useState({});

  const initialFormState = {
    clientId: '',
    invoiceId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    bankName: '',
    notes: ''
  };

  const [paymentForm, setPaymentForm] = useState(initialFormState);

  // Queries
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients?limit=200');
      return res.data || [];
    }
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/invoices?limit=200');
      return res.data || [];
    }
  });

  const { data: paymentsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['payments', search, methodFilter, statusFilter, dateRange],
    queryFn: async () => {
      let url = '/payments?limit=200';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (methodFilter !== 'All') url += `&paymentMethod=${encodeURIComponent(methodFilter)}`;
      if (statusFilter !== 'All') url += `&status=${encodeURIComponent(statusFilter)}`;
      if (dateRange.start) url += `&startDate=${encodeURIComponent(dateRange.start)}`;
      if (dateRange.end) url += `&endDate=${encodeURIComponent(dateRange.end)}`;
      const res = await api.get(url);
      return res.data || [];
    }
  });

  const clients = clientsData?.data || clientsData || [];
  const invoices = invoicesData?.data || invoicesData || [];
  const rawPayments = paymentsData?.data || paymentsData || [];

  // Filter invoices for selected client
  const clientInvoices = invoices.filter(inv => {
    if (!paymentForm.clientId) return true;
    const cId = inv.clientId?._id || inv.clientId;
    return String(cId) === String(paymentForm.clientId);
  });

  const selectedInvoice = invoices.find(i => String(i._id) === String(paymentForm.invoiceId));

  // Reset modal state
  const handleCloseModal = () => {
    setShowAddModal(false);
    setPaymentForm(initialFormState);
    setFormErrors({});
  };

  // Record Payment Mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async (payload) => api.post('/payments', payload),
    onSuccess: (res) => {
      toast.success('Payment recorded and reconciled successfully!');
      handleCloseModal();
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['managementMetrics']);
      queryClient.invalidateQueries(['client360']);
      // Automatically prompt receipt view
      const createdPayment = res?.data || res;
      if (createdPayment && createdPayment._id) {
        handleViewReceipt(createdPayment._id);
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to record payment';
      toast.error(msg);
      setFormErrors(prev => ({ ...prev, api: msg }));
    }
  });

  // Receipt Loader
  const handleViewReceipt = async (paymentId) => {
    try {
      // First attempt dedicated receipt endpoint
      const res = await api.get(`/payments/${paymentId}/receipt`);
      const receiptData = res?.data || res;
      if (receiptData && (receiptData.payment || receiptData._id)) {
        setSelectedReceipt(receiptData.payment ? receiptData : { payment: receiptData });
        return;
      }
    } catch (err) {
      // Fallback: If server is running older process without /receipt route, fetch standard payment record
      if (err.response?.status === 404) {
        try {
          const fallbackRes = await api.get(`/payments/${paymentId}`);
          const paymentData = fallbackRes?.data || fallbackRes;
          if (paymentData) {
            setSelectedReceipt({
              payment: paymentData,
              company: {
                name: 'Innomatrics Technologies Pvt Ltd',
                address: 'Suite 404, Cyber City',
                city: 'Gurugram',
                state: 'Haryana',
                gstNumber: '07AAAAA0000A1Z5',
                email: 'finance@innomatrics.com'
              }
            });
            return;
          }
        } catch (fallbackErr) {
          // ignore fallback error
        }
      }
      toast.error(err.response?.data?.message || 'Failed to fetch receipt');
    }
  };

  const validatePayment = () => {
    const errors = {};
    if (!paymentForm.clientId) {
      errors.clientId = 'Please select a client organization';
    }

    const numAmount = Number(paymentForm.amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      errors.amount = 'Amount must be greater than zero';
    } else if (selectedInvoice && numAmount > (selectedInvoice.balance || 0)) {
      errors.amount = `Amount cannot exceed invoice balance (₹${(selectedInvoice.balance || 0).toLocaleString()})`;
    }

    if (!paymentForm.paymentDate) {
      errors.paymentDate = 'Payment date is required';
    }

    if (['Bank Transfer', 'UPI', 'Cheque'].includes(paymentForm.paymentMethod) && !paymentForm.transactionReference?.trim()) {
      errors.transactionReference = `Transaction reference / UTR is required for ${paymentForm.paymentMethod}`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePayment()) return;

    const payload = {
      ...paymentForm,
      amount: Number(paymentForm.amount),
      invoiceId: paymentForm.invoiceId ? paymentForm.invoiceId : null,
      paymentType: paymentForm.invoiceId ? 'Invoice Payment' : 'Advance'
    };

    recordPaymentMutation.mutate(payload);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Table Columns
  const columns = [
    { 
      header: 'Receipt #', 
      accessor: 'receiptNumber',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.receiptNumber || row.paymentId || 'RCT-00000'}
        </span>
      )
    },
    { 
      header: 'Client', 
      cell: (row) => (
        <div className="text-xs">
          <span className="font-bold text-text block">{row.clientId?.companyName || row.clientId?.name || 'Unassigned'}</span>
          {row.clientId?.contactPerson && <span className="text-[11px] text-text-muted">{row.clientId.contactPerson}</span>}
        </div>
      )
    },
    { 
      header: 'Invoice #', 
      cell: (row) => (
        <span className="font-mono text-xs font-medium text-text-muted">
          {row.invoiceId?.invoiceNumber ? `#${row.invoiceId.invoiceNumber}` : '-'}
        </span>
      )
    },
    { 
      header: 'Type', 
      cell: (row) => (
        <span className={`px-2 py-0.5 text-xs rounded font-medium ${
          row.invoiceId ? 'bg-primary/10 text-primary' : 'bg-purple-500/10 text-purple-400'
        }`}>
          {row.invoiceId ? 'Invoice Payment' : (row.paymentType || 'Advance')}
        </span>
      )
    },
    { 
      header: 'Amount Collected', 
      accessor: 'amount',
      cell: (row) => (
        <span className="font-mono font-bold text-success text-sm">
          ₹{(row.amount || 0).toLocaleString()}
        </span>
      )
    },
    { 
      header: 'Method', 
      accessor: 'paymentMethod',
      cell: (row) => (
        <span className="px-2 py-0.5 text-xs bg-background rounded border border-border">
          {row.paymentMethod}
        </span>
      )
    },
    { 
      header: 'Transaction Ref', 
      accessor: 'transactionReference',
      cell: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {row.transactionReference || 'N/A'}
        </span>
      )
    },
    { 
      header: 'Payment Date', 
      cell: (row) => (
        <span className="text-xs text-text-muted">
          {row.paymentDate ? new Date(row.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
          row.status === 'Completed' ? 'bg-success/20 text-success' :
          row.status === 'Pending' ? 'bg-warning/20 text-warning' :
          row.status === 'Refunded' ? 'bg-info/20 text-info' :
          'bg-danger/20 text-danger'
        }`}>
          {row.status || 'Completed'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => handleViewReceipt(row._id)}
          className="p-1 text-primary hover:bg-primary/10 rounded transition-colors flex items-center gap-1 text-xs font-semibold"
          title="View & Print Receipt"
        >
          <Receipt className="h-4 w-4" /> Receipt
        </button>
      )
    }
  ];

  // Quick summary statistics from raw payments
  const totalCollectedSum = rawPayments
    .filter(p => p.status === 'Completed' || !p.status)
    .reduce((s, p) => s + (p.amount || 0), 0);
  const bankTransferCount = rawPayments.filter(p => p.paymentMethod === 'Bank Transfer').length;
  const upiCount = rawPayments.filter(p => p.paymentMethod === 'UPI').length;

  return (
    <div className="space-y-6 p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <CreditCard className="mr-2 h-6 w-6 text-primary" /> Payment Receipts & Collections Ledger
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Reconciled transaction ledger with verified bank credits, atomic balance enforcement, and receipts.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Record New Payment
        </Button>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted uppercase font-medium">Total Ledger Collections</span>
            <div className="text-xl font-bold font-mono text-success mt-0.5">₹{totalCollectedSum.toLocaleString()}</div>
          </div>
          <DollarSign className="h-8 w-8 text-success/30" />
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted uppercase font-medium">Total Receipts Issued</span>
            <div className="text-xl font-bold font-mono text-text mt-0.5">{rawPayments.length}</div>
          </div>
          <Receipt className="h-8 w-8 text-primary/30" />
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted uppercase font-medium">Channel Split</span>
            <div className="text-xs font-semibold text-text mt-1">
              Bank: {bankTransferCount} | UPI: {upiCount} | Other: {rawPayments.length - bankTransferCount - upiCount}
            </div>
          </div>
          <TrendingUp className="h-8 w-8 text-warning/30" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search receipt #, client, UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-text focus:outline-hidden focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          <span className="text-text-muted font-medium">Method:</span>
          <select 
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-hidden"
          >
            <option value="All">All Methods</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Cheque">Cheque</option>
            <option value="Cash">Cash</option>
            <option value="Payment Gateway">Payment Gateway</option>
          </select>

          <span className="text-text-muted font-medium ml-2">Status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
          </select>

          <div className="flex items-center gap-1 ml-2">
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-text"
              title="Start Date"
            />
            <span className="text-text-muted">-</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-text"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load payments" onRetry={refetch} />}
      {!isLoading && !isError && rawPayments.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-12 text-center space-y-3">
          <CreditCard className="h-12 w-12 text-primary mx-auto opacity-70" />
          <h3 className="text-base font-bold text-text">No Payment Records Found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Collect payments on outstanding invoices or record advances to populate your financial ledger.
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Record First Payment
          </Button>
        </div>
      )}
      {!isLoading && !isError && rawPayments.length > 0 && (
        <DataTable columns={columns} data={rawPayments} reportName="Payments_Ledger_Export" />
      )}

      {/* RECORD PAYMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl my-6">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text flex items-center">
                <DollarSign className="mr-1.5 h-5 w-5 text-success" /> Record Client Payment
              </h2>
              <button type="button" onClick={handleCloseModal} className="text-text-muted hover:text-text p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-4">
              {formErrors.api && (
                <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-md text-xs">
                  {formErrors.api}
                </div>
              )}

              {/* Client Selection */}
              <div>
                <label className="font-semibold text-text block mb-1">
                  Select Client Organization <span className="text-danger">*</span>
                </label>
                <select 
                  value={paymentForm.clientId}
                  onChange={(e) => {
                    setPaymentForm({ 
                      ...paymentForm, 
                      clientId: e.target.value, 
                      invoiceId: '', 
                      amount: '' 
                    });
                    if (formErrors.clientId) setFormErrors(prev => ({ ...prev, clientId: null }));
                  }}
                  className={`w-full bg-background border ${formErrors.clientId ? 'border-danger' : 'border-border'} rounded p-2 text-text font-medium outline-hidden`}
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.companyName || c.name} {c.clientId ? `(${c.clientId})` : ''}
                    </option>
                  ))}
                </select>
                {formErrors.clientId && <p className="text-danger text-[11px] mt-1">{formErrors.clientId}</p>}
              </div>

              {/* Invoice Selection */}
              <div>
                <label className="font-semibold text-text block mb-1">
                  Select Linked Invoice (Optional)
                </label>
                <select 
                  value={paymentForm.invoiceId}
                  onChange={(e) => {
                    const invId = e.target.value;
                    const inv = invoices.find(i => String(i._id) === String(invId));
                    setPaymentForm({ 
                      ...paymentForm, 
                      invoiceId: invId,
                      amount: inv ? inv.balance : paymentForm.amount
                    });
                    if (formErrors.amount) setFormErrors(prev => ({ ...prev, amount: null }));
                  }}
                  className="w-full bg-background border border-border rounded p-2 text-text outline-hidden"
                >
                  <option value="">-- Direct Advance / Retainer Payment (No Invoice Linked) --</option>
                  {clientInvoices
                    .filter(i => (i.balance > 0 || String(i._id) === String(paymentForm.invoiceId)) && i.status !== 'Cancelled')
                    .map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        #{inv.invoiceNumber} - Outstanding Balance: ₹{(inv.balance || 0).toLocaleString()} (Total: ₹{(inv.totalAmount || 0).toLocaleString()})
                      </option>
                    ))}
                </select>
                {selectedInvoice && (
                  <div className="mt-1 p-2 bg-primary/10 border border-primary/20 rounded flex justify-between items-center text-[11px]">
                    <span className="text-text-muted">Invoice Available Balance:</span>
                    <span className="font-mono font-bold text-primary">₹{(selectedInvoice.balance || 0).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">
                    Amount Paid (₹) <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="1"
                    value={paymentForm.amount}
                    onChange={(e) => {
                      setPaymentForm({ ...paymentForm, amount: e.target.value });
                      if (formErrors.amount) setFormErrors(prev => ({ ...prev, amount: null }));
                    }}
                    className={`w-full bg-background border ${formErrors.amount ? 'border-danger' : 'border-border'} rounded p-2 text-text font-mono font-bold outline-hidden`}
                    placeholder="e.g. 50000"
                  />
                  {formErrors.amount && <p className="text-danger text-[11px] mt-1">{formErrors.amount}</p>}
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">
                    Payment Date <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text outline-hidden"
                  />
                  {formErrors.paymentDate && <p className="text-danger text-[11px] mt-1">{formErrors.paymentDate}</p>}
                </div>
              </div>

              {/* Payment Method & Bank */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Payment Method</label>
                  <select 
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text outline-hidden"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="Payment Gateway">Payment Gateway</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Bank Name / Provider</label>
                  <input 
                    type="text" 
                    value={paymentForm.bankName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text outline-hidden"
                    placeholder="e.g. HDFC Bank, ICICI"
                  />
                </div>
              </div>

              {/* Transaction Ref */}
              <div>
                <label className="font-semibold text-text block mb-1">
                  Transaction Reference / UTR / Cheque #{' '}
                  {['Bank Transfer', 'UPI', 'Cheque'].includes(paymentForm.paymentMethod) && (
                    <span className="text-danger">*</span>
                  )}
                </label>
                <input 
                  type="text" 
                  value={paymentForm.transactionReference}
                  onChange={(e) => {
                    setPaymentForm({ ...paymentForm, transactionReference: e.target.value });
                    if (formErrors.transactionReference) setFormErrors(prev => ({ ...prev, transactionReference: null }));
                  }}
                  className={`w-full bg-background border ${formErrors.transactionReference ? 'border-danger' : 'border-border'} rounded p-2 text-text font-mono outline-hidden`}
                  placeholder="e.g. UTR / Ref # 202610149872"
                />
                {formErrors.transactionReference && (
                  <p className="text-danger text-[11px] mt-1">{formErrors.transactionReference}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="font-semibold text-text block mb-1">Internal Notes</label>
                <textarea 
                  rows={2}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text outline-hidden resize-none"
                  placeholder="Optional remarks, bank account deposited into, etc."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={recordPaymentMutation.isPending}>
                  {recordPaymentMutation.isPending ? 'Processing...' : 'Save & Reconcile Payment'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW & PRINT RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl w-full max-w-xl shadow-2xl my-6 overflow-hidden">
            
            {/* Header Toolbar */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <span className="text-sm font-bold text-text flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-primary" /> Official Payment Receipt
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={handlePrintReceipt}>
                  <Printer className="h-3.5 w-3.5 mr-1" /> Print / Save as PDF
                </Button>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 text-text-muted hover:text-text rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div id="payment-receipt-print-area" className="p-8 space-y-6 bg-white text-black text-xs font-sans">
              
              {/* Receipt Top Header */}
              <div className="flex justify-between items-start border-b border-gray-300 pb-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-blue-900">
                    {selectedReceipt.company?.name || 'INNOMATRICS TECHNOLOGIES'}
                  </h1>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    {selectedReceipt.company?.address || 'Suite 404, Tech Park'}, {selectedReceipt.company?.city || 'Gurugram'}, {selectedReceipt.company?.state || 'Haryana'}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    GSTIN: <span className="font-mono font-semibold">{selectedReceipt.company?.gstNumber || '07AAAAA0000A1Z5'}</span> | Email: {selectedReceipt.company?.email || 'accounts@innomatrics.com'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-green-100 border border-green-300 text-green-800 font-bold text-sm uppercase rounded">
                    Payment Receipt
                  </div>
                  <div className="text-xs font-mono font-bold text-gray-700 mt-2">
                    {selectedReceipt.payment?.receiptNumber || selectedReceipt.payment?.paymentId}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Date: {new Date(selectedReceipt.payment?.paymentDate || selectedReceipt.payment?.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Receipt Summary Grid */}
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded border border-gray-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Received From:</span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {selectedReceipt.payment?.clientId?.companyName || selectedReceipt.payment?.clientId?.name || 'Client'}
                  </p>
                  <p className="text-[11px] text-gray-600">{selectedReceipt.payment?.clientId?.contactPerson}</p>
                  <p className="text-[11px] text-gray-600">{selectedReceipt.payment?.clientId?.email}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Transaction Information:</span>
                  <p className="text-[11px] text-gray-700 mt-1">
                    <span className="font-semibold">Method:</span> {selectedReceipt.payment?.paymentMethod}
                  </p>
                  <p className="text-[11px] text-gray-700 font-mono">
                    <span className="font-sans font-semibold">Reference/UTR:</span> {selectedReceipt.payment?.transactionReference || 'N/A'}
                  </p>
                  <p className="text-[11px] text-gray-700">
                    <span className="font-semibold">Linked Invoice:</span> {selectedReceipt.payment?.invoiceId?.invoiceNumber ? `#${selectedReceipt.payment.invoiceId.invoiceNumber}` : 'Direct Advance Payment'}
                  </p>
                </div>
              </div>

              {/* Amount Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded flex justify-between items-center">
                <div>
                  <span className="text-xs font-semibold text-blue-900">Total Amount Paid</span>
                  <p className="text-[11px] text-gray-600">Electronic remittance verified and credited</p>
                </div>
                <div className="text-2xl font-extrabold font-mono text-blue-900">
                  ₹{(selectedReceipt.payment?.amount || 0).toLocaleString()}
                </div>
              </div>

              {/* Remaining Invoice Balance Breakdown if linked */}
              {selectedReceipt.payment?.invoiceId && (
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="p-2">Invoice Total</th>
                        <th className="p-2 text-right">Total Collected</th>
                        <th className="p-2 text-right">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 font-mono">₹{(selectedReceipt.payment.invoiceId.totalAmount || 0).toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-green-700 font-semibold">
                          ₹{((selectedReceipt.payment.invoiceId.totalAmount || 0) - (selectedReceipt.payment.invoiceId.balance || 0)).toLocaleString()}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-gray-900">
                          ₹{(selectedReceipt.payment.invoiceId.balance || 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Verification & Signature footer */}
              <div className="flex justify-between items-end pt-6 border-t border-gray-200 text-gray-500 text-[10px]">
                <div>
                  <p>Computer-generated digital receipt — Valid without physical signature.</p>
                  <p className="mt-0.5">Recorded By: {selectedReceipt.payment?.createdBy?.name || 'Authorized Finance Officer'}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">Innomatrics Technologies</div>
                  <div>Finance & Accounts Department</div>
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-border flex justify-end bg-background/50">
              <Button onClick={() => setSelectedReceipt(null)}>Close</Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
