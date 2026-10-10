import React, { useState } from 'react';
import { Plus, Globe, RotateCw, MoreHorizontal, CalendarClock, History } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/tables/DataTable';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Domains() {
  const queryClient = useQueryClient();
  const [filterDays, setFilterDays] = useState('all');
  const [renewModalDomain, setRenewModalDomain] = useState(null);
  
  // Renewal Modal State
  const [renewalForm, setRenewalForm] = useState({
    renewalPeriod: 1,
    renewalCost: 0,
    vendor: '',
    paymentStatus: 'Paid',
    transactionRef: '',
    notes: ''
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['domains', filterDays],
    queryFn: async () => {
      let url = '/domains';
      if (filterDays !== 'all') {
        url += `?daysRemaining=${filterDays}`;
      }
      const res = await api.get(url);
      return res.data || [];
    }
  });

  const renewMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.post(`/domains/${id}/renew`, payload),
    onSuccess: () => {
      toast.success('Domain renewed successfully!');
      setRenewModalDomain(null);
      queryClient.invalidateQueries(['domains']);
      queryClient.invalidateQueries(['ceoView']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to renew domain')
  });

  const displayData = data?.data || data || [];

  const handleRenewSubmit = (e) => {
    e.preventDefault();
    
    // Calculate new expiry date based on current expiry and renewal period (years)
    const currentExpiry = new Date(renewModalDomain.expiryDate);
    const newExpiry = new Date(currentExpiry.setFullYear(currentExpiry.getFullYear() + Number(renewalForm.renewalPeriod)));

    renewMutation.mutate({
      id: renewModalDomain._id,
      payload: {
        ...renewalForm,
        newExpiry: newExpiry.toISOString()
      }
    });
  };

  const getDaysRemaining = (expiryDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const columns = [
    { 
      header: 'Domain', 
      accessor: 'domainName',
      cell: (row) => <span className="font-semibold">{row.domainName}</span>
    },
    { 
      header: 'Client', 
      accessor: 'clientId.companyName',
      cell: (row) => row.clientId?.companyName || '-'
    },
    { header: 'Registrar', accessor: 'registrar' },
    { 
      header: 'Expiry Date', 
      accessor: 'expiryDate',
      cell: (row) => new Date(row.expiryDate).toLocaleDateString()
    },
    {
      header: 'Days Remaining',
      cell: (row) => {
        const days = getDaysRemaining(row.expiryDate);
        if (days < 0) return <span className="text-danger font-bold">Expired {Math.abs(days)} days ago</span>;
        if (days === 0) return <span className="text-danger font-bold">Expires Today</span>;
        if (days <= 7) return <span className="text-danger font-bold">{days} days remaining</span>;
        if (days <= 30) return <span className="text-warning font-semibold">{days} days remaining</span>;
        return <span className="text-success">{days} days remaining</span>;
      }
    },
    { 
      header: 'Renewal Status', 
      accessor: 'renewalStatus',
      cell: (row) => (
        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
          row.renewalStatus === 'Renewed' ? 'bg-success/20 text-success' :
          row.renewalStatus === 'Due' ? 'bg-warning/20 text-warning' :
          row.renewalStatus === 'Expired' ? 'bg-danger/20 text-danger' :
          'bg-primary/10 text-primary'
        }`}>
          {row.renewalStatus || 'Unknown'}
        </span>
      )
    },
    { 
      header: 'Cost', 
      cell: (row) => `₹${(row.renewalCost || row.costPrice || 0).toLocaleString()}` 
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRenewModalDomain(row);
              setRenewalForm({
                renewalPeriod: 1,
                renewalCost: row.renewalCost || row.costPrice || 0,
                vendor: row.registrar || '',
                paymentStatus: 'Paid',
                transactionRef: '',
                notes: ''
              });
            }}
            className="px-2.5 py-1 text-xs font-bold bg-primary text-white rounded hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            <RotateCw className="inline h-3.5 w-3.5 mr-1" /> Renew
          </button>
          
          <DropdownMenu>
            <DropdownItem icon={History} onClick={() => toast.info('History coming soon')}>Renewal History</DropdownItem>
            <DropdownItem icon={CalendarClock} onClick={() => toast.info('Edit Expiry coming soon')}>Edit Domain</DropdownItem>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <Globe className="mr-2 h-6 w-6 text-primary" /> Domain Renewals & Management
          </h1>
          <p className="text-sm text-text-muted mt-1">Track domain expiries, manage registrars, and process renewals.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filterDays}
            onChange={(e) => setFilterDays(e.target.value)}
            className="bg-surface border border-border text-sm rounded-lg px-3 py-2 text-text"
          >
            <option value="all">All Domains</option>
            <option value="7">Expiring within 7 Days (Critical)</option>
            <option value="15">Expiring within 15 Days</option>
            <option value="30">Expiring within 30 Days</option>
          </select>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Domain
          </Button>
        </div>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load domains" onRetry={refetch} />}
      {!isLoading && !isError && displayData.length === 0 && (
        <ErrorState title="No domains found" message="Try adjusting your filters or adding a new domain." />
      )}
      {!isLoading && !isError && displayData.length > 0 && (
        <DataTable 
          columns={columns} 
          data={displayData} 
          reportName="Domain_Renewals_Export" 
        />
      )}

      {/* RENEWAL MODAL */}
      {renewModalDomain && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center">
              <RotateCw className="mr-2 h-5 w-5 text-primary" /> Renew Domain: {renewModalDomain.domainName}
            </h2>
            
            <form onSubmit={handleRenewSubmit} className="space-y-4 text-sm">
              
              <div className="bg-background p-3 rounded-lg border border-border mb-4 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-text-muted">Current Expiry:</span>
                  <span className="font-semibold text-danger">{new Date(renewModalDomain.expiryDate).toLocaleDateString()}</span>
                  
                  <span className="text-text-muted">Client:</span>
                  <span className="font-semibold text-text">{renewModalDomain.clientId?.companyName || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Renewal Period (Years) *</label>
                  <select 
                    value={renewalForm.renewalPeriod}
                    onChange={(e) => setRenewalForm({ ...renewalForm, renewalPeriod: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="5">5 Years</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">New Expiry (Auto-calculated)</label>
                  <input 
                    type="text" 
                    disabled
                    value={new Date(new Date(renewModalDomain.expiryDate).setFullYear(new Date(renewModalDomain.expiryDate).getFullYear() + Number(renewalForm.renewalPeriod))).toLocaleDateString()}
                    className="w-full bg-background/50 border border-border rounded p-2 text-text-muted cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Renewal Cost (₹) *</label>
                  <input 
                    type="number" 
                    required
                    value={renewalForm.renewalCost}
                    onChange={(e) => setRenewalForm({ ...renewalForm, renewalCost: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">Registrar / Vendor</label>
                  <input 
                    type="text" 
                    value={renewalForm.vendor}
                    onChange={(e) => setRenewalForm({ ...renewalForm, vendor: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="e.g. GoDaddy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Payment Status</label>
                  <select 
                    value={renewalForm.paymentStatus}
                    onChange={(e) => setRenewalForm({ ...renewalForm, paymentStatus: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">Transaction Ref (Optional)</label>
                  <input 
                    type="text" 
                    value={renewalForm.transactionRef}
                    onChange={(e) => setRenewalForm({ ...renewalForm, transactionRef: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="Txn ID"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Notes</label>
                <textarea 
                  value={renewalForm.notes}
                  onChange={(e) => setRenewalForm({ ...renewalForm, notes: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text resize-none"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setRenewModalDomain(null)}>Cancel</Button>
                <Button type="submit" isLoading={renewMutation.isPending}>Confirm Renewal</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
