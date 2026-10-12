import React, { useState } from 'react';
import { 
  Plus, 
  CreditCard, 
  DollarSign, 
  Search, 
  Calendar, 
  Receipt, 
  X,
  Building
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
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');

  const [paymentForm, setPaymentForm] = useState({
    clientId: '',
    invoiceId: '',
    amount: '',
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

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/invoices?limit=200');
      return res.data || [];
    }
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await api.get('/payments?limit=100');
      return res.data || [];
    }
  });

  const clients = clientsData?.data || clientsData || [];
  const invoices = invoicesData?.data || invoicesData || [];
  const displayData = data?.data || data || [];

  // Record Payment Mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async (payload) => api.post('/payments', payload),
    onSuccess: () => {
      toast.success('Payment recorded successfully!');
      setShowAddModal(false);
      setPaymentForm({
        clientId: '',
        invoiceId: '',
        amount: '',
        paymentMethod: 'Bank Transfer',
        transactionReference: '',
        notes: ''
      });
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['managementMetrics']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
  });

  // Filter invoices for selected client
  const clientInvoices = invoices.filter(inv => {
    if (!paymentForm.clientId) return true;
    const cId = inv.clientId?._id || inv.clientId;
    return cId === paymentForm.clientId;
  });

  // Filtered payments list
  const filteredPayments = displayData.filter(p => {
    const matchSearch = 
      !search ||
      (p.paymentId && p.paymentId.toLowerCase().includes(search.toLowerCase())) ||
      (p.clientId?.companyName && p.clientId.companyName.toLowerCase().includes(search.toLowerCase())) ||
      (p.transactionReference && p.transactionReference.toLowerCase().includes(search.toLowerCase())) ||
      (p.invoiceId?.invoiceNumber && p.invoiceId.invoiceNumber.toLowerCase().includes(search.toLowerCase()));

    const matchMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
    return matchSearch && matchMethod;
  });

  const columns = [
    { 
      header: 'Payment ID', 
      accessor: 'paymentId',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.paymentId || row._id?.slice(-6)}
        </span>
      )
    },
    { 
      header: 'Client', 
      cell: (row) => <span className="font-bold text-text">{row.clientId?.companyName || 'Client'}</span> 
    },
    { 
      header: 'Invoice #', 
      cell: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {row.invoiceId?.invoiceNumber ? `#${row.invoiceId.invoiceNumber}` : 'Direct Payment'}
        </span>
      )
    },
    { 
      header: 'Amount Collected', 
      cell: (row) => (
        <span className="font-mono font-bold text-success text-sm">
          ₹{(row.amount || 0).toLocaleString()}
        </span>
      )
    },
    { header: 'Payment Method', accessor: 'paymentMethod' },
    { 
      header: 'Transaction Ref', 
      cell: (row) => <span className="font-mono text-xs text-text-muted">{row.transactionReference || 'N/A'}</span> 
    },
    { 
      header: 'Date', 
      cell: (row) => new Date(row.paymentDate || row.createdAt).toLocaleDateString() 
    },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className="px-2.5 py-0.5 text-[11px] font-bold bg-success/20 text-success rounded-full">
          {row.status || 'Completed'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <CreditCard className="mr-2 h-6 w-6 text-primary" /> Payment Receipts & Collections
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Complete transaction ledger of customer payments and verified bank credits.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Record New Payment
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search payments, receipts, UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-xs text-text-muted font-medium">Method:</span>
          <select 
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-text focus:outline-none"
          >
            <option value="All">All Methods</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Cheque">Cheque</option>
            <option value="Cash">Cash</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load payments" onRetry={refetch} />}
      {!isLoading && !isError && filteredPayments.length === 0 && (
        <ErrorState title="No payments recorded" message="Collect payments on invoices to build your ledger." />
      )}
      {!isLoading && !isError && filteredPayments.length > 0 && (
        <DataTable columns={columns} data={filteredPayments} />
      )}

      {/* RECORD PAYMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl my-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text flex items-center">
                <DollarSign className="mr-1.5 h-5 w-5 text-success" /> Record Client Payment
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
                  toast.error('Payment amount must be greater than zero');
                  return;
                }
                recordPaymentMutation.mutate({
                  ...paymentForm,
                  amount: Number(paymentForm.amount)
                });
              }} 
              className="space-y-4 text-xs mt-4"
            >
              <div>
                <label className="font-semibold text-text block mb-1">Select Client *</label>
                <select 
                  required
                  value={paymentForm.clientId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, clientId: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>{c.companyName} ({c.clientId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Select Linked Invoice (Optional)</label>
                <select 
                  value={paymentForm.invoiceId}
                  onChange={(e) => {
                    const invId = e.target.value;
                    const inv = invoices.find(i => i._id === invId);
                    setPaymentForm({ 
                      ...paymentForm, 
                      invoiceId: invId,
                      amount: inv ? inv.balance : paymentForm.amount
                    });
                  }}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                >
                  <option value="">-- Direct Advance / Retainer Payment --</option>
                  {clientInvoices.filter(i => i.balance > 0).map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      #{inv.invoiceNumber} - Due: ₹{inv.balance.toLocaleString()} (Total: ₹{inv.totalAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Amount Paid (₹) *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text font-mono font-bold"
                    placeholder="e.g. 50000"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Payment Method</label>
                  <select 
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="Payment Gateway">Payment Gateway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Transaction Ref / UTR / Cheque #</label>
                <input 
                  type="text" 
                  value={paymentForm.transactionReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="e.g. HDFC0001928374"
                />
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Notes</label>
                <input 
                  type="text" 
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="Optional notes or remarks"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={recordPaymentMutation.isPending}>Save Payment</Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
