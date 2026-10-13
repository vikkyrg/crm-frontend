import React, { useState } from 'react';
import { 
  Plus, 
  Globe, 
  RotateCw, 
  CalendarClock, 
  History, 
  Search, 
  X, 
  Edit, 
  Trash2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
  const [search, setSearch] = useState('');
  const [renewModalDomain, setRenewModalDomain] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  
  // Renewal Modal State
  const [renewalForm, setRenewalForm] = useState({
    renewalPeriod: 1,
    renewalCost: 0,
    vendor: '',
    paymentStatus: 'Paid',
    transactionRef: '',
    notes: ''
  });

  // Add/Edit Domain Form State
  const initialDomainForm = {
    domainName: '',
    clientId: '',
    registrar: 'GoDaddy',
    registrationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    autoRenew: false,
    renewalCost: 1200,
    costPrice: 900,
    sellingPrice: 1500,
    dnsProvider: 'Cloudflare',
    nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com',
    status: 'Active',
    renewalStatus: 'Renewed',
    notes: ''
  };

  const [domainForm, setDomainForm] = useState(initialDomainForm);

  // Domains Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['domains', filterDays, search],
    queryFn: async () => {
      let url = '/domains?limit=100';
      if (filterDays !== 'all') {
        url += `&daysRemaining=${filterDays}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await api.get(url);
      return res.data || [];
    }
  });

  // Clients Query for dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients?limit=200');
      return res.data || [];
    }
  });

  const displayData = data?.data || data || [];
  const clients = clientsData?.data || clientsData || [];

  // Create Domain Mutation
  const createDomainMutation = useMutation({
    mutationFn: async (payload) => api.post('/domains', payload),
    onSuccess: () => {
      toast.success('Domain record added successfully!');
      setShowAddModal(false);
      setDomainForm(initialDomainForm);
      queryClient.invalidateQueries(['domains']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add domain');
    }
  });

  // Update Domain Mutation
  const updateDomainMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.put(`/domains/${id}`, payload),
    onSuccess: () => {
      toast.success('Domain updated successfully!');
      setShowAddModal(false);
      setEditingDomain(null);
      setDomainForm(initialDomainForm);
      queryClient.invalidateQueries(['domains']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update domain');
    }
  });

  // Delete Domain Mutation
  const deleteDomainMutation = useMutation({
    mutationFn: async (id) => api.delete(`/domains/${id}`),
    onSuccess: () => {
      toast.success('Domain deleted successfully');
      queryClient.invalidateQueries(['domains']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete domain');
    }
  });

  // Renew Mutation
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

  const handleRenewSubmit = (e) => {
    e.preventDefault();
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

  const handleDomainSubmit = (e) => {
    e.preventDefault();
    if (!domainForm.domainName || !domainForm.domainName.trim()) {
      toast.error('Please enter a valid domain name');
      return;
    }
    if (!domainForm.clientId) {
      toast.error('Please select an associated Client');
      return;
    }
    if (!domainForm.expiryDate) {
      toast.error('Please specify an expiry date');
      return;
    }

    const payload = {
      ...domainForm,
      nameservers: domainForm.nameservers 
        ? domainForm.nameservers.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };

    if (editingDomain) {
      updateDomainMutation.mutate({ id: editingDomain._id, payload });
    } else {
      createDomainMutation.mutate(payload);
    }
  };

  const handleEdit = (row) => {
    setEditingDomain(row);
    setDomainForm({
      domainName: row.domainName || '',
      clientId: row.clientId?._id || row.clientId || '',
      registrar: row.registrar || 'GoDaddy',
      registrationDate: row.registrationDate ? new Date(row.registrationDate).toISOString().split('T')[0] : '',
      expiryDate: row.expiryDate ? new Date(row.expiryDate).toISOString().split('T')[0] : '',
      autoRenew: !!row.autoRenew,
      renewalCost: row.renewalCost || 0,
      costPrice: row.costPrice || 0,
      sellingPrice: row.sellingPrice || 0,
      dnsProvider: row.dnsProvider || '',
      nameservers: Array.isArray(row.nameservers) ? row.nameservers.join(', ') : (row.nameservers || ''),
      status: row.status || 'Active',
      renewalStatus: row.renewalStatus || 'Renewed',
      notes: row.notes || ''
    });
    setShowAddModal(true);
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
      cell: (row) => (
        <div className="flex items-center space-x-1.5">
          <Globe className="h-4 w-4 text-primary shrink-0" />
          <a 
            href={`https://${row.domainName}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-text hover:text-primary hover:underline flex items-center"
          >
            {row.domainName}
            <ExternalLink className="h-3 w-3 ml-1 text-text-muted" />
          </a>
        </div>
      )
    },
    { 
      header: 'Client', 
      cell: (row) => row.clientId?.companyName || 'Unassigned'
    },
    { header: 'Registrar', accessor: 'registrar' },
    { 
      header: 'Expiry Date', 
      cell: (row) => new Date(row.expiryDate).toLocaleDateString()
    },
    {
      header: 'Days Remaining',
      cell: (row) => {
        const days = getDaysRemaining(row.expiryDate);
        if (days < 0) return <span className="text-danger font-bold">Expired {Math.abs(days)}d ago</span>;
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
          {row.renewalStatus || 'Active'}
        </span>
      )
    },
    { 
      header: 'Renewal Cost', 
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
          
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-text-muted hover:text-primary hover:bg-background rounded transition-colors"
            title="Edit Domain"
          >
            <Edit className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete domain "${row.domainName}"?`)) {
                deleteDomainMutation.mutate(row._id);
              }
            }}
            className="p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
            title="Delete Domain"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
            <Globe className="mr-2.5 h-6 w-6 text-primary" /> Domain Renewals & Management
          </h1>
          <p className="text-xs text-text-muted mt-1">Track domain expiries, registrars, nameservers, and process renewals.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filterDays}
            onChange={(e) => setFilterDays(e.target.value)}
            className="bg-surface border border-border text-xs rounded-lg px-3 py-2 text-text"
          >
            <option value="all">All Domains</option>
            <option value="7">Expiring within 7 Days (Critical)</option>
            <option value="15">Expiring within 15 Days</option>
            <option value="30">Expiring within 30 Days</option>
          </select>
          <Button onClick={() => {
            setEditingDomain(null);
            setDomainForm(initialDomainForm);
            setShowAddModal(true);
          }}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Domain
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input 
            placeholder="Search domain name, registrar..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load domains" onRetry={refetch} />}
      {!isLoading && !isError && displayData.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-12 text-center space-y-4 shadow-xs">
          <Globe className="h-12 w-12 text-primary mx-auto opacity-70" />
          <div>
            <h3 className="text-lg font-bold text-text">No Domains Found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto mt-1">
              Add domain registrations to monitor critical expiration dates, automated renewals, and DNS settings.
            </p>
          </div>
          <Button onClick={() => {
            setEditingDomain(null);
            setDomainForm(initialDomainForm);
            setShowAddModal(true);
          }}>
            <Plus className="mr-1.5 h-4 w-4" /> Add First Domain
          </Button>
        </div>
      )}
      {!isLoading && !isError && displayData.length > 0 && (
        <DataTable 
          columns={columns} 
          data={displayData} 
          reportName="Domain_Renewals_Export" 
        />
      )}

      {/* ADD / EDIT DOMAIN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-base font-bold text-text flex items-center">
                <Globe className="mr-2 h-4 w-4 text-primary" />
                {editingDomain ? 'Edit Domain Record' : 'Register New Domain'}
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-text-muted hover:text-text p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDomainSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Domain Name */}
                <div className="sm:col-span-2">
                  <label className="font-semibold text-text block mb-1">
                    Domain Name <span className="text-danger">*</span>
                  </label>
                  <Input 
                    placeholder="e.g. yourclientbrand.com"
                    value={domainForm.domainName}
                    onChange={(e) => setDomainForm({ ...domainForm, domainName: e.target.value })}
                    required
                  />
                </div>

                {/* Client Association */}
                <div>
                  <label className="font-semibold text-text block mb-1">
                    Associated Client <span className="text-danger">*</span>
                  </label>
                  <select 
                    value={domainForm.clientId}
                    onChange={(e) => setDomainForm({ ...domainForm, clientId: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-surface text-text text-xs focus:ring-2 focus:ring-primary outline-hidden"
                    required
                  >
                    <option value="">-- Select Client Organization --</option>
                    {clients.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.companyName} {c.contactPerson ? `(${c.contactPerson})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Registrar */}
                <div>
                  <label className="font-semibold text-text block mb-1">Domain Registrar</label>
                  <Input 
                    placeholder="e.g. GoDaddy, Namecheap, Cloudflare, AWS"
                    value={domainForm.registrar}
                    onChange={(e) => setDomainForm({ ...domainForm, registrar: e.target.value })}
                  />
                </div>

                {/* Registration Date */}
                <div>
                  <label className="font-semibold text-text block mb-1">Registration Date</label>
                  <Input 
                    type="date"
                    value={domainForm.registrationDate}
                    onChange={(e) => setDomainForm({ ...domainForm, registrationDate: e.target.value })}
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="font-semibold text-text block mb-1">
                    Expiry Date <span className="text-danger">*</span>
                  </label>
                  <Input 
                    type="date"
                    value={domainForm.expiryDate}
                    onChange={(e) => setDomainForm({ ...domainForm, expiryDate: e.target.value })}
                    required
                  />
                </div>

                {/* Renewal Cost */}
                <div>
                  <label className="font-semibold text-text block mb-1">Annual Renewal Cost (₹)</label>
                  <Input 
                    type="number"
                    min="0"
                    value={domainForm.renewalCost}
                    onChange={(e) => setDomainForm({ ...domainForm, renewalCost: Number(e.target.value) })}
                  />
                </div>

                {/* DNS Provider */}
                <div>
                  <label className="font-semibold text-text block mb-1">DNS Provider</label>
                  <Input 
                    placeholder="e.g. Cloudflare, Route53"
                    value={domainForm.dnsProvider}
                    onChange={(e) => setDomainForm({ ...domainForm, dnsProvider: e.target.value })}
                  />
                </div>

                {/* Nameservers */}
                <div className="sm:col-span-2">
                  <label className="font-semibold text-text block mb-1">Configured Nameservers</label>
                  <Input 
                    placeholder="e.g. ns1.cloudflare.com, ns2.cloudflare.com"
                    value={domainForm.nameservers}
                    onChange={(e) => setDomainForm({ ...domainForm, nameservers: e.target.value })}
                  />
                </div>

                {/* Renewal Status */}
                <div>
                  <label className="font-semibold text-text block mb-1">Renewal Status</label>
                  <select 
                    value={domainForm.renewalStatus}
                    onChange={(e) => setDomainForm({ ...domainForm, renewalStatus: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-surface text-text text-xs focus:ring-2 focus:ring-primary outline-hidden"
                  >
                    <option value="Renewed">Renewed (Good Standing)</option>
                    <option value="Due">Due for Renewal</option>
                    <option value="Renewal In Progress">Renewal In Progress</option>
                    <option value="Expired">Expired</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Auto Renew Checkbox */}
                <div className="flex items-center space-x-2 pt-6">
                  <input 
                    type="checkbox"
                    id="autoRenewCheck"
                    checked={domainForm.autoRenew}
                    onChange={(e) => setDomainForm({ ...domainForm, autoRenew: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="autoRenewCheck" className="font-semibold text-text cursor-pointer">
                    Enable Auto-Renewal at Registrar
                  </label>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="font-semibold text-text block mb-1">Internal Notes</label>
                  <textarea 
                    rows={2}
                    placeholder="Account details, registrant email reference, or DNS notes..."
                    value={domainForm.notes}
                    onChange={(e) => setDomainForm({ ...domainForm, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text text-xs focus:ring-2 focus:ring-primary outline-hidden resize-none"
                  />
                </div>

              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createDomainMutation.isPending || updateDomainMutation.isPending}
                >
                  {createDomainMutation.isPending || updateDomainMutation.isPending 
                    ? 'Saving...' 
                    : (editingDomain ? 'Update Domain' : 'Save Domain')}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* RENEWAL MODAL */}
      {renewModalDomain && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-base font-bold text-text mb-4 flex items-center">
              <RotateCw className="mr-2 h-5 w-5 text-primary" /> Renew Domain: {renewModalDomain.domainName}
            </h2>
            
            <form onSubmit={handleRenewSubmit} className="space-y-4 text-xs">
              
              <div className="bg-background p-3 rounded-lg border border-border mb-4">
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
                    onChange={(e) => setRenewalForm({ ...renewalForm, renewalPeriod: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value={1}>1 Year</option>
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years</option>
                    <option value={5}>5 Years</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">New Expiry Date (Auto-calc)</label>
                  <input 
                    type="text" 
                    disabled
                    value={(() => {
                      const d = new Date(renewModalDomain.expiryDate);
                      d.setFullYear(d.getFullYear() + Number(renewalForm.renewalPeriod));
                      return d.toLocaleDateString();
                    })()}
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
                <Button type="submit" disabled={renewMutation.isPending}>
                  {renewMutation.isPending ? 'Processing...' : 'Confirm Renewal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
