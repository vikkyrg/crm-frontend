import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Briefcase, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  FileText,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Clients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search & Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editClient, setEditClient] = useState(null);

  // Form State
  const initialForm = {
    companyName: '',
    clientType: 'Enterprise',
    contactPerson: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    gstNumber: '',
    panNumber: '',
    industry: 'Information Technology',
    accountManager: '',
    status: 'Active',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch Users for Account Manager Dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const res = await api.get('/users');
        return res.data || [];
      } catch (e) {
        return [];
      }
    }
  });
  const users = usersData || [];

  // Fetch Clients
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients?limit=200');
      return res.data || [];
    }
  });

  const rawList = data?.data || data || [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/clients', payload),
    onSuccess: (res) => {
      toast.success('Client profile created successfully!');
      setShowAddModal(false);
      setFormData(initialForm);
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['managementMetrics']);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to create client';
      toast.error(msg, { duration: 5000 });
    }
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.put(`/clients/${id}`, payload),
    onSuccess: () => {
      toast.success('Client profile updated successfully!');
      setEditClient(null);
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['client360']);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to update client';
      toast.error(msg, { duration: 5000 });
    }
  });

  // Delete Mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id) => api.delete(`/clients/${id}?permanent=true`),
    onSuccess: (res) => {
      toast.success(res?.message || 'Client and all linked records removed across all pages successfully!');
      // Invalidate all affected collections in frontend cache
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['quotations']);
      queryClient.invalidateQueries(['contracts']);
      queryClient.invalidateQueries(['amc']);
      queryClient.invalidateQueries(['websites']);
      queryClient.invalidateQueries(['domains']);
      queryClient.invalidateQueries(['tickets']);
      queryClient.invalidateQueries(['expenses']);
      queryClient.invalidateQueries(['documents']);
      queryClient.invalidateQueries(['managementMetrics']);
      queryClient.invalidateQueries(['ceoView']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete client')
  });

  // Validation function
  const validateForm = (data) => {
    if (!data.companyName.trim()) {
      toast.error('Company Name is required');
      return false;
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (data.gstNumber && data.gstNumber.trim().length > 0 && data.gstNumber.trim().length !== 15) {
      toast.error('GST Number should be 15 alphanumeric characters (e.g., 29AAAAA0000A1Z5)');
      return false;
    }
    return true;
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return;
    createMutation.mutate(formData);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return;
    updateMutation.mutate({ id: editClient._id, payload: formData });
  };

  const openEditModal = (client) => {
    setEditClient(client);
    setFormData({
      companyName: client.companyName || '',
      clientType: client.clientType || 'Enterprise',
      contactPerson: client.contactPerson || '',
      email: client.email || '',
      phone: client.phone || '',
      whatsapp: client.whatsapp || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      country: client.country || 'India',
      gstNumber: client.gstNumber || '',
      panNumber: client.panNumber || '',
      industry: client.industry || 'Information Technology',
      accountManager: client.accountManager?._id || client.accountManager || '',
      status: client.status || 'Active',
      notes: client.notes || ''
    });
  };

  // Filtered Clients
  const filteredData = useMemo(() => {
    return rawList.filter((item) => {
      const matchSearch = 
        !search ||
        (item.companyName && item.companyName.toLowerCase().includes(search.toLowerCase())) ||
        (item.clientId && item.clientId.toLowerCase().includes(search.toLowerCase())) ||
        (item.contactPerson && item.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(search.toLowerCase())) ||
        (item.phone && item.phone.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchType = typeFilter === 'All' || item.clientType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [rawList, search, statusFilter, typeFilter]);

  const columns = [
    { 
      header: 'Client ID', 
      accessor: 'clientId',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.clientId || 'N/A'}
        </span>
      )
    },
    { 
      header: 'Company & Contact', 
      cell: (row) => (
        <div>
          <Link to={`/clients/${row._id}`} className="font-bold text-text hover:text-primary hover:underline block">
            {row.companyName}
          </Link>
          <span className="text-xs text-text-muted flex items-center mt-0.5">
            <User className="h-3 w-3 mr-1" /> {row.contactPerson || 'Direct'}
          </span>
        </div>
      )
    },
    { 
      header: 'Communication', 
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center text-text-muted">
            <Mail className="h-3 w-3 mr-1 text-primary" /> {row.email || 'N/A'}
          </div>
          <div className="flex items-center text-text-muted">
            <Phone className="h-3 w-3 mr-1 text-primary" /> {row.phone || 'N/A'}
          </div>
        </div>
      )
    },
    { 
      header: 'Type & Industry', 
      cell: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-text">{row.clientType || 'SMB'}</span>
          <span className="block text-text-muted">{row.industry || 'Technology'}</span>
        </div>
      )
    },
    { 
      header: 'Projects & Services', 
      cell: (row) => (
        <div className="text-xs space-y-1">
          <div className="font-semibold text-text">
            {row.projectsCount || 0} Project{row.projectsCount === 1 ? '' : 's'}
          </div>
          <div className="text-[11px] text-text-muted truncate max-w-[140px]">
            {row.servicesList && row.servicesList.length > 0 
              ? row.servicesList.slice(0, 2).join(', ') + (row.servicesList.length > 2 ? '...' : '') 
              : 'Standard Services'}
          </div>
        </div>
      )
    },
    { 
      header: 'Financials', 
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="text-text">
            <span className="text-text-muted">Inv:</span> ₹{(row.totalInvoiced || 0).toLocaleString()}
          </div>
          <div className={`font-semibold ${(row.totalOutstanding || 0) > 0 ? 'text-danger' : 'text-success'}`}>
            <span className="text-text-muted font-normal">Bal:</span> ₹{(row.totalOutstanding || 0).toLocaleString()}
          </div>
        </div>
      )
    },
    { 
      header: 'Status', 
      cell: (row) => {
        const isAct = row.status === 'Active';
        return (
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
            isAct ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
          }`}>
            {row.status || 'Active'}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Link 
            to={`/clients/${row._id}`} 
            className="flex items-center px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Eye className="mr-1 h-3.5 w-3.5" /> 360 View
          </Link>
          <DropdownMenu>
            <DropdownItem icon={Edit} onClick={() => openEditModal(row)}>
              Edit Client
            </DropdownItem>
            <DropdownItem 
              icon={Trash2} 
              danger 
              onClick={() => {
                if (window.confirm(`Warning: Are you sure you want to completely delete client "${row.companyName}"?\n\nThis will permanently delete this client and all associated projects, tasks, invoices, payments, contracts, quotations, assets, tickets, and documents across all pages.`)) {
                  deleteClientMutation.mutate(row._id);
                }
              }}
            >
              Delete Client (All Data)
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
            <Briefcase className="mr-2 h-6 w-6 text-primary" /> Client Master Directory
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Central repository of enterprise clients with comprehensive Client 360° analytics.
          </p>
        </div>
        <Button onClick={() => { setFormData(initialForm); setShowAddModal(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by company, ID, contact, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-muted font-medium">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-muted font-medium">Type:</span>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Enterprise">Enterprise</option>
              <option value="SMB">SMB</option>
              <option value="Startup">Startup</option>
              <option value="Government">Government</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-text-muted border-l border-border pl-3">
            Showing {filteredData.length} of {rawList.length} clients
          </span>
        </div>
      </div>

      {/* Table Content */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load clients" onRetry={refetch} />}
      {!isLoading && !isError && filteredData.length === 0 && (
        <ErrorState 
          title="No clients found" 
          message={search || statusFilter !== 'All' ? "No records match the current filters. Try resetting search criteria." : "There are currently no client profiles in the database."} 
        />
      )}
      {!isLoading && !isError && filteredData.length > 0 && (
        <DataTable columns={columns} data={filteredData} />
      )}

      {/* CREATE CLIENT MODAL */}
      {showAddModal && (
        <ClientModal 
          title="Create New Client Profile"
          formData={formData}
          setFormData={setFormData}
          users={users}
          isLoading={createMutation.isPending}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* EDIT CLIENT MODAL */}
      {editClient && (
        <ClientModal 
          title={`Edit Client: ${editClient.companyName}`}
          formData={formData}
          setFormData={setFormData}
          users={users}
          isLoading={updateMutation.isPending}
          onClose={() => setEditClient(null)}
          onSubmit={handleUpdateSubmit}
          isEdit
        />
      )}

    </div>
  );
}

// Modular Client Modal Component
function ClientModal({ title, formData, setFormData, users, isLoading, onClose, onSubmit, isEdit }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
          <h2 className="text-base font-bold text-text flex items-center">
            <Building className="mr-2 h-5 w-5 text-primary" /> {title}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Primary Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">Company / Client Name *</label>
              <input 
                type="text" 
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                placeholder="e.g. Acme Technologies Pvt Ltd"
              />
            </div>

            <div>
              <label className="font-semibold text-text block mb-1">Client Classification</label>
              <select 
                value={formData.clientType}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              >
                <option value="Enterprise">Enterprise</option>
                <option value="SMB">SMB</option>
                <option value="Startup">Startup</option>
                <option value="Government">Government</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Primary Contact Person & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">Primary Contact Person</label>
              <input 
                type="text" 
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
                placeholder="e.g. Ramesh Sharma"
              />
            </div>

            <div>
              <label className="font-semibold text-text block mb-1">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
                placeholder="contact@acme.com"
              />
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="font-semibold text-text block mb-1">WhatsApp / Alternate Phone</label>
              <input 
                type="text" 
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
                placeholder="+91 9876543211"
              />
            </div>
          </div>

          {/* Tax Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">GSTIN Number</label>
              <input 
                type="text" 
                maxLength={15}
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className="w-full bg-background border border-border rounded p-2 text-text uppercase font-mono"
                placeholder="29AAAAA0000A1Z5"
              />
            </div>

            <div>
              <label className="font-semibold text-text block mb-1">PAN Number</label>
              <input 
                type="text" 
                maxLength={10}
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                className="w-full bg-background border border-border rounded p-2 text-text uppercase font-mono"
                placeholder="ABCDE1234F"
              />
            </div>
          </div>

          {/* Location & Billing Address */}
          <div>
            <label className="font-semibold text-text block mb-1">Billing / Registered Address</label>
            <input 
              type="text" 
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-background border border-border rounded p-2 text-text"
              placeholder="Suite 500, Cyber Tower, Sector 62"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">City</label>
              <input 
                type="text" 
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
                placeholder="Noida / Mumbai"
              />
            </div>
            <div>
              <label className="font-semibold text-text block mb-1">State</label>
              <input 
                type="text" 
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
                placeholder="Uttar Pradesh / Maharashtra"
              />
            </div>
            <div>
              <label className="font-semibold text-text block mb-1">Country</label>
              <input 
                type="text" 
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              />
            </div>
          </div>

          {/* Management & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">Assigned Account Manager</label>
              <select 
                value={formData.accountManager}
                onChange={(e) => setFormData({ ...formData, accountManager: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              >
                <option value="">-- Choose Account Manager --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-text block mb-1">Client Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-text block mb-1">Internal Notes & Remarks</label>
            <textarea 
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-background border border-border rounded p-2 text-text resize-none"
              placeholder="Important business context or client preferences..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEdit ? 'Save Changes' : 'Save Client Profile'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
