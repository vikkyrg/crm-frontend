import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';

const fetchProjects = async () => {
  const res = await api.get('/projects');
  return res.data || res;
};

const fetchClients = async () => {
  const res = await api.get('/clients');
  return res.data || res;
};

export default function Projects() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    clientId: '',
    startDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: '',
    estimatedBudget: '',
    description: ''
  });

  const { data: projectsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients
  });

  const clients = clientsData?.data || clientsData || [];
  const projects = projectsData?.data || projectsData || [];

  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/projects', payload),
    onSuccess: () => {
      toast.success('Project created with standard milestones!');
      queryClient.invalidateQueries(['projects']);
      setIsModalOpen(false);
      setFormData({
        projectName: '',
        clientId: '',
        startDate: new Date().toISOString().split('T')[0],
        targetCompletionDate: '',
        estimatedBudget: '',
        description: ''
      });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create project')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      queryClient.invalidateQueries(['projects']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete project')
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectName) {
      toast.error('Project Name is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const columns = [
    { header: 'ID', accessor: 'projectId', cell: (row) => row.projectId || row._id?.slice(-6) },
    { header: 'Project Name', accessor: 'projectName', cell: (row) => row.projectName || row.name },
    { 
      header: 'Client', 
      accessor: 'clientId', 
      cell: (row) => row.clientId?.companyName || row.clientId?.name || row.client || 'N/A' 
    },
    { 
      header: 'Manager', 
      accessor: 'projectManager', 
      cell: (row) => row.projectManager?.name || row.manager || 'Unassigned' 
    },
    { 
      header: 'Progress', 
      accessor: 'completionPercentage',
      cell: (row) => {
        const pct = `${row.completionPercentage || row.progress || 0}%`;
        return (
          <div className="flex items-center space-x-2 w-full max-w-[120px]">
            <div className="flex-1 bg-surface border border-border h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full" 
                style={{ width: pct }} 
              />
            </div>
            <span className="text-xs text-text-muted">{pct}</span>
          </div>
        );
      }
    },
    { 
      header: 'Deadline', 
      accessor: 'targetCompletionDate',
      cell: (row) => {
        const d = row.targetCompletionDate || row.deadline;
        return d ? new Date(d).toLocaleDateString() : '-';
      }
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => {
        const status = row.status || 'Active';
        const color = status === 'Completed' ? 'bg-success/10 text-success' : status === 'Delayed' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary';
        return (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${color}`}>
            {status}
          </span>
        );
      }
    },
  ];

  const columnsWithActions = [
    ...columns,
    {
      header: 'Actions',
      cell: (row) => (
        <DropdownMenu>
          <DropdownItem 
            icon={Eye} 
            onClick={() => navigate(`/projects/${row._id}`)}
          >
            Project 360 View
          </DropdownItem>
          <DropdownItem 
            icon={Trash2} 
            danger 
            onClick={() => {
              if (window.confirm('Delete this project?')) {
                deleteMutation.mutate(row._id);
              }
            }}
          >
            Delete
          </DropdownItem>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Projects</h1>
          <p className="text-sm text-text-muted mt-1">Track and manage ongoing client projects.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Project
        </Button>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load projects" onRetry={refetch} />}
      {!isLoading && !isError && (
        <DataTable 
          columns={columnsWithActions} 
          data={projects} 
          onRowClick={(row) => navigate(`/projects/${row._id}`)}
        />
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-lg font-semibold text-text">Create New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Project Name *</label>
                <Input 
                  placeholder="e.g. Enterprise E-Commerce Platform"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Client</label>
                <select 
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.companyName || c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1">Start Date</label>
                  <Input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1">Target End Date</label>
                  <Input 
                    type="date"
                    value={formData.targetCompletionDate}
                    onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Estimated Budget (₹)</label>
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={formData.estimatedBudget}
                  onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Description / Scope</label>
                <textarea 
                  className="w-full rounded-md border border-border bg-background p-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary h-20"
                  placeholder="Project scope and details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
