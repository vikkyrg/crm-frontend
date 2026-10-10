import React, { useState } from 'react';
import { Plus, Receipt, DollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
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

  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    totalAmount: 100000,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'Bank Transfer',
    transactionReference: ''
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients');
      return res.data || [];
    }
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/invoices');
      return res.data || [];
    }
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload) => api.post('/invoices', payload),
    onSuccess: () => {
      toast.success('Invoice created successfully!');
      setShowAddModal(false);
      queryClient.invalidateQueries(['invoices']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create invoice')
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async (payload) => api.post('/payments', payload),
    onSuccess: () => {
      toast.success('Payment recorded and Invoice updated!');
      setShowPaymentModal(false);
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['dashboardMetrics']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to record payment')
  });

  const displayData = data?.data || data || [];
  const clientList = clientsData?.data || clientsData || [];

  const columns = [
    { header: 'Invoice #', accessor: 'invoiceNumber' },
    { header: 'Client', cell: (row) => row.clientId?.companyName || 'Client' },
    { header: 'Total Amount', cell: (row) => `₹${(row.totalAmount || 0).toLocaleString()}` },
    { header: 'Amount Paid', cell: (row) => `₹${(row.amountPaid || 0).toLocaleString()}` },
    { header: 'Balance Due', cell: (row) => `₹${(row.balance || 0).toLocaleString()}` },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
          row.status === 'Paid' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div>
          {row.balance > 0 ? (
            <button
              onClick={() => {
                setSelectedInvoice(row);
                setPaymentForm({ ...paymentForm, amount: row.balance });
                setShowPaymentModal(true);
              }}
              className="px-2.5 py-1 text-xs font-bold bg-success text-white rounded hover:bg-success/90 transition-colors flex items-center"
            >
              <DollarSign className="mr-1 h-3.5 w-3.5" /> Record Payment
            </button>
          ) : (
            <span className="text-xs font-bold text-success flex items-center">✓ Paid in Full</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <Receipt className="mr-2 h-6 w-6 text-primary" /> Invoice & Accounts Receivable
          </h1>
          <p className="text-sm text-text-muted mt-1">Manage invoices, collect payments, and track client outstanding balances.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load invoices" onRetry={refetch} />}
      {!isLoading && !isError && displayData.length === 0 && (
        <ErrorState title="No invoices found" message="There are currently no invoice records in the database." />
      )}
      {!isLoading && !isError && displayData.length > 0 && (
        <DataTable columns={columns} data={displayData} />
      )}

      {/* CREATE INVOICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-text mb-4">Create New Invoice</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); createInvoiceMutation.mutate(invoiceForm); }} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text block mb-1">Select Client *</label>
                <select 
                  required
                  value={invoiceForm.clientId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, clientId: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                >
                  <option value="">-- Select Client --</option>
                  {clientList.map((c) => (
                    <option key={c._id} value={c._id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Total Amount (₹) *</label>
                  <input 
                    type="number" 
                    required
                    value={invoiceForm.totalAmount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, totalAmount: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Due Date *</label>
                  <input 
                    type="date" 
                    required
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={createInvoiceMutation.isPending}>Save Invoice</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-text mb-2">Record Payment for Invoice #{selectedInvoice.invoiceNumber}</h2>
            <p className="text-xs text-text-muted mb-4">Total Balance Due: <span className="font-bold text-danger">₹{selectedInvoice.balance}</span></p>

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                recordPaymentMutation.mutate({
                  clientId: selectedInvoice.clientId?._id || selectedInvoice.clientId,
                  invoiceId: selectedInvoice._id,
                  amount: Number(paymentForm.amount),
                  paymentMethod: paymentForm.paymentMethod,
                  transactionReference: paymentForm.transactionReference
                }); 
              }} 
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-semibold text-text block mb-1">Payment Amount (₹) *</label>
                <input 
                  type="number" 
                  required
                  max={selectedInvoice.balance}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded p-2 text-text font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Payment Method</label>
                <select 
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Transaction Ref / Cheque #</label>
                <input 
                  type="text" 
                  value={paymentForm.transactionReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="e.g. TXN987654321"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={recordPaymentMutation.isPending}>Record Payment</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
