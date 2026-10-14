import React, { useState } from 'react';
import { Plus, FolderKanban, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/tables/DataTable';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Projects() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const initialForm = {
    projectName: '',
    clientId: '',
    budget: 150000,
    status: 'Planning'
  };

  const [formData, setFormData] = useState(initialForm);

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients');
      return res.data || [];
    }
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/projects', payload),
    onSuccess: () => {
      toast.success('Project created with 7 automatic milestones!');
      setShowAddModal(false);
      setFormData(initialForm);
      queryClient.invalidateQueries(['projects']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create project')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.put(`/projects/${id}`, payload),
    onSuccess: () => {
      toast.success('Project updated successfully!');
      setShowAddModal(false);
      setEditingProject(null);
      setFormData(initialForm);
      queryClient.invalidateQueries(['projects']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update project')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      queryClient.invalidateQueries(['projects']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete project')
  });

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData(initialForm);
    setShowAddModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      projectName: project.projectName || '',
      clientId: project.clientId?._id || project.clientId || '',
      budget: project.budget || 0,
      status: project.status || 'Active'
    });
    setShowAddModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      toast.error('Project Name is required');
      return;
    }
    if (!formData.clientId) {
      toast.error('Client selection is required');
      return;
    }
    const payload = {
      ...formData,
      budget: Number(formData.budget) || 0
    };
    if (editingProject) {
      updateMutation.mutate({ id: editingProject._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const displayData = data?.data || data || [];
  const clientList = clientsData?.data || clientsData || [];

  const columns = [
    { header: 'Project ID', accessor: 'projectId' },
    { 
      header: 'Project Name', 
      cell: (row) => (
        <Link to={`/projects/${row._id}`} className="font-bold text-primary hover:underline">
          {row.projectName}
        </Link>
      )
    },
    { header: 'Client', cell: (row) => row.clientId?.companyName || 'N/A' },
    { header: 'Budget', cell: (row) => `₹${(row.budget || 0).toLocaleString()}` },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className="px-2.5 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full">
          {row.status || 'Active'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Link 
            to={`/projects/${row._id}`} 
            className="flex items-center px-2.5 py-1 bg-primary text-white text-xs font-bold rounded hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Eye className="mr-1 h-3.5 w-3.5" /> 360 View
          </Link>
          <DropdownMenu>
            <DropdownItem icon={Edit} onClick={() => openEditModal(row)}>
              Edit Project
            </DropdownItem>
            <DropdownItem 
              icon={Trash2} 
              danger 
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete project "${row.projectName}"? Associated milestones and tasks will remain archived.`)) {
                  deleteMutation.mutate(row._id);
                }
              }}
            >
              Delete Project
            </DropdownItem>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <FolderKanban className="mr-2 h-6 w-6 text-primary" /> Project Portfolio
          </h1>
          <p className="text-sm text-text-muted mt-1">Manage software development projects, milestones, tasks, and profitability.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load projects" onRetry={refetch} />}
      {!isLoading && !isError && displayData.length === 0 && (
        <ErrorState title="No projects found" message="There are currently no project records in the database." />
      )}
      {!isLoading && !isError && displayData.length > 0 && (
        <DataTable columns={columns} data={displayData} reportName="Projects_Export" />
      )}

      {/* CREATE & EDIT PROJECT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-text mb-4">
              {editingProject ? `Edit Project: ${editingProject.projectId || editingProject.projectName}` : 'Create New Project'}
            </h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text block mb-1">Project Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="e.g. Enterprise E-Commerce Platform"
                />
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Client *</label>
                <select 
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
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
                  <label className="font-semibold text-text block mb-1">Project Budget (₹)</label>
                  <input 
                    type="number" 
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Testing">Testing</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditingProject(null); }}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editingProject ? 'Update Project' : 'Save Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
