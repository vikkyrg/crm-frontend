import React, { useState } from 'react';
import { 
  Plus, 
  Globe, 
  ExternalLink, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  ShieldCheck, 
  Server, 
  FolderKanban,
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

export default function Websites() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);

  // Form State
  const initialFormState = {
    clientId: '',
    projectId: '',
    domainName: '',
    websiteType: 'Corporate',
    technologyStack: 'React, Node.js',
    hostingProvider: '',
    serverIp: '',
    sslStatus: 'Active',
    status: 'Live',
    backupStatus: 'Weekly',
    repositoryUrl: '',
    deploymentDate: new Date().toISOString().split('T')[0],
    renewalDate: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch Websites
  const { data: websitesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['websites', search, statusFilter],
    queryFn: async () => {
      let url = '/websites?limit=100';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'All') url += `&status=${encodeURIComponent(statusFilter)}`;
      const res = await api.get(url);
      return res.data || [];
    }
  });

  // Fetch Clients for dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients?limit=200');
      return res.data || [];
    }
  });

  // Fetch Projects for dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects?limit=200');
      return res.data || [];
    }
  });

  const websites = websitesData?.data || websitesData || [];
  const clients = clientsData?.data || clientsData || [];
  const projects = projectsData?.data || projectsData || [];

  // Filter projects by selected client if any
  const filteredProjects = formData.clientId 
    ? projects.filter(p => (p.clientId?._id || p.clientId) === formData.clientId)
    : projects;

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/websites', payload),
    onSuccess: () => {
      toast.success('Website asset added successfully!');
      setShowAddModal(false);
      setFormData(initialFormState);
      queryClient.invalidateQueries(['websites']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add website');
    }
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.put(`/websites/${id}`, payload),
    onSuccess: () => {
      toast.success('Website updated successfully!');
      setEditingWebsite(null);
      setShowAddModal(false);
      setFormData(initialFormState);
      queryClient.invalidateQueries(['websites']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update website');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/websites/${id}`),
    onSuccess: () => {
      toast.success('Website deleted successfully');
      queryClient.invalidateQueries(['websites']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete website');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientId) {
      toast.error('Please select an associated Client');
      return;
    }
    if (!formData.domainName || !formData.domainName.trim()) {
      toast.error('Please enter a Website URL / Domain Name');
      return;
    }

    const payload = {
      ...formData,
      technologyStack: formData.technologyStack 
        ? formData.technologyStack.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };

    if (editingWebsite) {
      updateMutation.mutate({ id: editingWebsite._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (row) => {
    setEditingWebsite(row);
    setFormData({
      clientId: row.clientId?._id || row.clientId || '',
      projectId: row.projectId?._id || row.projectId || '',
      domainName: row.domainName || '',
      websiteType: row.websiteType || 'Corporate',
      technologyStack: Array.isArray(row.technologyStack) ? row.technologyStack.join(', ') : (row.technologyStack || ''),
      hostingProvider: row.hostingProvider || '',
      serverIp: row.serverIp || '',
      sslStatus: row.sslStatus || 'Active',
      status: row.status || 'Live',
      backupStatus: row.backupStatus || 'Weekly',
      repositoryUrl: row.repositoryUrl || '',
      deploymentDate: row.deploymentDate ? new Date(row.deploymentDate).toISOString().split('T')[0] : '',
      renewalDate: row.renewalDate ? new Date(row.renewalDate).toISOString().split('T')[0] : ''
    });
    setShowAddModal(true);
  };

  const columns = [
    { 
      header: 'Website ID', 
      accessor: 'websiteId',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {row.websiteId || 'WEB-ASSET'}
        </span>
      )
    },
    { 
      header: 'Domain / URL', 
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
    { 
      header: 'Project', 
      cell: (row) => row.projectId?.projectName || '-' 
    },
    { 
      header: 'Type', 
      accessor: 'websiteType',
      cell: (row) => (
        <span className="px-2 py-0.5 text-xs bg-background rounded border border-border">
          {row.websiteType}
        </span>
      )
    },
    {
      header: 'Hosting / IP',
      cell: (row) => (
        <div className="text-xs">
          <p className="font-medium text-text">{row.hostingProvider || 'N/A'}</p>
          {row.serverIp && <p className="text-text-muted font-mono">{row.serverIp}</p>}
        </div>
      )
    },
    { 
      header: 'SSL', 
      accessor: 'sslStatus',
      cell: (row) => (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center w-fit ${
          row.sslStatus === 'Active' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
        }`}>
          <ShieldCheck className="mr-1 h-3 w-3" />
          {row.sslStatus}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
          row.status === 'Live' ? 'bg-success/20 text-success' : 
          row.status === 'Development' ? 'bg-primary/20 text-primary' : 
          'bg-warning/20 text-warning'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-text-muted hover:text-primary hover:bg-background rounded transition-colors"
            title="Edit Website"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to remove website asset "${row.domainName}"?`)) {
                deleteMutation.mutate(row._id);
              }
            }}
            className="p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
            title="Delete Website"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <Globe className="mr-2.5 h-6 w-6 text-primary" /> Websites & Applications Portfolio
          </h1>
          <p className="text-xs text-text-muted mt-1">Manage client digital properties, hosting, tech stacks, and SSL configurations.</p>
        </div>
        <Button onClick={() => {
          setEditingWebsite(null);
          setFormData(initialFormState);
          setShowAddModal(true);
        }}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Website
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input 
            placeholder="Search domain, ID, hosting..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-text-muted">Status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-border text-xs rounded-lg px-3 py-2 text-text"
          >
            <option value="All">All Statuses</option>
            <option value="Live">Live</option>
            <option value="Development">Development</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Content State */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load websites" onRetry={refetch} />}
      {!isLoading && !isError && websites.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-12 text-center space-y-4 shadow-xs">
          <Globe className="h-12 w-12 text-primary mx-auto opacity-70" />
          <div>
            <h3 className="text-lg font-bold text-text">No Website Assets Found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto mt-1">
              Start tracking client web properties, hosting environments, and SSL statuses in one centralized directory.
            </p>
          </div>
          <Button onClick={() => {
            setEditingWebsite(null);
            setFormData(initialFormState);
            setShowAddModal(true);
          }}>
            <Plus className="mr-1.5 h-4 w-4" /> Add First Website
          </Button>
        </div>
      )}
      {!isLoading && !isError && websites.length > 0 && (
        <DataTable columns={columns} data={websites} reportName="Websites_Portfolio_Export" />
      )}

      {/* ADD / EDIT WEBSITE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-base font-bold text-text flex items-center">
                <Globe className="mr-2 h-4 w-4 text-primary" />
                {editingWebsite ? 'Edit Website Asset' : 'Add New Website Asset'}
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-text-muted hover:text-text p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Client Selection */}
                <div>
                  <label className="font-semibold text-text block mb-1">
                    Client <span className="text-danger">*</span>
                  </label>
                  <select 
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value, projectId: '' })}
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

                {/* Project Selection */}
                <div>
                  <label className="font-semibold text-text block mb-1">Associated Project (Optional)</label>
                  <select 
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-surface text-text text-xs focus:ring-2 focus:ring-primary outline-hidden"
                  >
                    <option value="">-- None / Standalone Asset --</option>
                    {filteredProjects.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.projectId ? `[${p.projectId}] ` : ''}{p.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Domain Name */}
                <div>
                  <label className="font-semibold text-text block mb-1">
                    Website URL / Domain Name <span className="text-danger">*</span>
                  </label>
                  <Input 
                    placeholder="e.g. clientportal.innomatrics.com"
                    value={formData.domainName}
                    onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
                    required
                  />
                </div>

                {/* Website Type */}
                <div>
                  <label className="font-semibold text-text block mb-1">Website Type</label>
                  <select 
                    value={formData.websiteType}
                    onChange={(e) => setFormData({ ...formData, websiteType: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-surface text-text text-xs focus:ring-2 focus:ring-primary outline-hidden"
                  >
                    <option value="Corporate">Corporate</option>
                    <option value="Business">Business</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Custom Web Application">Custom Web Application</option>
                    <option value="WordPress">WordPress</option>
                    <option value="React">React / SPA</option>
                    <option value="Laravel">Laravel / PHP</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Hosting Provider */}
                <div>
                  <label className="font-semibold text-text block mb-1">Hosting Provider</label>
                  <Input 
                    placeholder="e.g. AWS, Hostinger, DigitalOcean, Vercel"
                    value={formData.hostingProvider}
                    onChange={(e) => setFormData({ ...formData, hostingProvider: e.target.value })}
                  />
                </div>

                {/* Server IP */}
                <div>
                  <label className="font-semibold text-text block mb-1">Server IP Address</label>
                  <Input 
                    placeholder="e.g. 192.168.1.1 or Elastic IP"
                    value={formData.serverIp}
                    onChange={(e) => setFormData({ ...formData, serverIp: e.target.value })}
                  />
                </div>

                {/* Technology Stack */}
                <div>
                  <label className="font-semibold text-text block mb-1">Technology Stack</label>
                  <Input 
                    placeholder="e.g. React, Node.js, MongoDB, Tailwind"
                    value={formData.technologyStack}
                    onChange={(e) => setFormData({ ...formData, technologyStack: e.target.value })}
                  />
                </div>

                {/* Git Repository URL */}
                <div>
                  <label className="font-semibold text-text block mb-1">Repository URL (Git/GitHub)</label>
                  <Input 
                    placeholder="e.g. https://github.com/org/repo"
                    value={formData.repositoryUrl}
                    onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                  />
                </div>

                {/* SSL Status */}
                <div>
                  <label className="font-semibold text-text block mb-1">SSL Certificate Status</label>
                  <select 
                    value={formData.sslStatus}
                    onChange={(e) => setFormData({ ...formData, sslStatus: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-surface text-text text-xs focus:ring-2 focus:ring-primary outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="font-semibold text-text block mb-1">Deployment Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-surface text-text text-xs focus:ring-2 focus:ring-primary outline-hidden"
                  >
                    <option value="Live">Live</option>
                    <option value="Development">Development</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                {/* Deployment Date */}
                <div>
                  <label className="font-semibold text-text block mb-1">Go-Live / Deployment Date</label>
                  <Input 
                    type="date"
                    value={formData.deploymentDate}
                    onChange={(e) => setFormData({ ...formData, deploymentDate: e.target.value })}
                  />
                </div>

                {/* Renewal Date */}
                <div>
                  <label className="font-semibold text-text block mb-1">Hosting / Service Renewal Date</label>
                  <Input 
                    type="date"
                    value={formData.renewalDate}
                    onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : (editingWebsite ? 'Update Website Asset' : 'Save Website Asset')}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
