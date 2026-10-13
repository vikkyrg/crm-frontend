import React, { useState } from 'react';
import { 
  Plus, 
  Layers, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  X, 
  DollarSign,
  Tag,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

const CATEGORIES = [
  'All',
  'Website Development',
  'Website Design',
  'E-commerce Development',
  'Mobile App Development',
  'SEO and Digital Marketing',
  'Hosting and Domain Services',
  'Website Maintenance',
  'AMC',
  'Custom Software Development',
  'IT Consulting',
  'Other'
];

export default function ServiceCatalog() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const initialForm = {
    serviceName: '',
    serviceCode: '',
    category: 'Custom Software Development',
    description: '',
    defaultPrice: '',
    billingType: 'Fixed',
    billingFrequency: 'One-time',
    defaultSLA: '',
    defaultTerms: '',
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch Services
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['serviceCatalog'],
    queryFn: async () => {
      const res = await api.get('/service-catalog?limit=200');
      return res.data || [];
    }
  });

  const services = data?.data || data || [];

  // Mutation Create
  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/service-catalog', payload),
    onSuccess: () => {
      toast.success('Service added to catalog successfully!');
      setShowModal(false);
      setFormData(initialForm);
      queryClient.invalidateQueries(['serviceCatalog']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add service');
    }
  });

  // Mutation Update
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/service-catalog/${id}`, payload),
    onSuccess: () => {
      toast.success('Service updated successfully!');
      setShowModal(false);
      setEditingService(null);
      setFormData(initialForm);
      queryClient.invalidateQueries(['serviceCatalog']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update service');
    }
  });

  // Mutation Delete
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/service-catalog/${id}`),
    onSuccess: () => {
      toast.success('Service archived successfully');
      queryClient.invalidateQueries(['serviceCatalog']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to archive service');
    }
  });

  const openCreateModal = () => {
    setEditingService(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      serviceName: service.serviceName || '',
      serviceCode: service.serviceCode || '',
      category: service.category || 'Custom Software Development',
      description: service.description || '',
      defaultPrice: service.defaultPrice || '',
      billingType: service.billingType || 'Fixed',
      billingFrequency: service.billingFrequency || 'One-time',
      defaultSLA: service.defaultSLA || '',
      defaultTerms: service.defaultTerms || '',
      status: service.status || 'Active'
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.serviceName.trim()) {
      toast.error('Service Name is required');
      return;
    }
    const payload = {
      ...formData,
      defaultPrice: Number(formData.defaultPrice) || 0
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchSearch = 
      !search ||
      s.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
      s.serviceCode?.toLowerCase().includes(search.toLowerCase()) ||
      s.serviceId?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (isLoading) return <div className="p-6"><TableSkeleton /></div>;
  if (isError) return <div className="p-6"><ErrorState title="Failed to load Service Catalog" onRetry={refetch} /></div>;

  const columns = [
    {
      header: 'Service Code',
      accessor: 'serviceId',
      cell: (row) => (
        <div>
          <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
            {row.serviceId || 'N/A'}
          </span>
          {row.serviceCode && (
            <span className="block text-[11px] text-text-muted mt-0.5">{row.serviceCode}</span>
          )}
        </div>
      )
    },
    {
      header: 'Service Name & Description',
      cell: (row) => (
        <div>
          <p className="font-bold text-text text-sm">{row.serviceName}</p>
          <p className="text-xs text-text-muted line-clamp-1">{row.description || 'No description provided'}</p>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row) => (
        <span className="text-xs font-medium text-text bg-surface px-2.5 py-1 rounded border border-border">
          {row.category}
        </span>
      )
    },
    {
      header: 'Billing Model',
      cell: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-text">{row.billingType}</span>
          <span className="block text-text-muted">{row.billingFrequency}</span>
        </div>
      )
    },
    {
      header: 'Default Price',
      cell: (row) => (
        <span className="font-mono font-bold text-success text-xs">
          ₹{(row.defaultPrice || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
          row.status === 'Active' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => openEditModal(row)}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-danger hover:text-danger" 
            onClick={() => {
              if (window.confirm(`Archive service "${row.serviceName}"? Existing quotes and projects remain unaffected.`)) {
                deleteMutation.mutate(row._id);
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Service Catalog</h1>
          <p className="text-xs text-text-muted">Master catalogue of digital products, development services, and recurring maintenance solutions</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add New Service
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input 
            placeholder="Search service name, code, or identifier..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={filteredServices} />
        </CardContent>
      </Card>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border sticky top-0 bg-surface">
              <h2 className="text-lg font-bold text-text">
                {editingService ? 'Edit Service Record' : 'Add New Service to Catalog'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Service Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="e.g. Full-Stack Web Application"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">Service Code (SKU)</label>
                  <input 
                    type="text" 
                    value={formData.serviceCode}
                    onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="e.g. WEB-DEV-FULL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">Default Base Price (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.defaultPrice}
                    onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="e.g. 75000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Billing Type</label>
                  <select 
                    value={formData.billingType}
                    onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Fixed">Fixed Price</option>
                    <option value="Hourly">Hourly Rate</option>
                    <option value="Monthly Recurring">Monthly Recurring</option>
                    <option value="Annual Recurring">Annual Recurring</option>
                    <option value="Milestone Based">Milestone Based</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">Billing Frequency</label>
                  <select 
                    value={formData.billingFrequency}
                    onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="One-time">One-time</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Description & Deliverables</label>
                <textarea 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="Detail the scope, core deliverables, and tech stack options..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Standard SLA Terms</label>
                  <input 
                    type="text" 
                    value={formData.defaultSLA}
                    onChange={(e) => setFormData({ ...formData, defaultSLA: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="e.g. 99.9% uptime, 24-hr ticket resolution"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editingService ? 'Save Changes' : 'Create Service'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
