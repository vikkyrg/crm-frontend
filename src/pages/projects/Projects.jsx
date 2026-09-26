import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/tables/DataTable';

const mockProjects = [
  { id: 'PROJ-001', name: 'Arc Reactor UI', client: 'Stark Industries', manager: 'Admin User', progress: '75%', status: 'Active', deadline: '2024-01-15' },
  { id: 'PROJ-002', name: 'Batcave Security', client: 'Wayne Enterprises', manager: 'Admin User', progress: '30%', status: 'Delayed', deadline: '2023-12-01' },
];

const columns = [
  { header: 'Project ID', accessor: 'id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Client', accessor: 'client' },
  { header: 'Manager', accessor: 'manager' },
  { 
    header: 'Progress', 
    accessor: 'progress',
    cell: (row) => (
      <div className="flex items-center space-x-2 w-full max-w-[120px]">
        <div className="flex-1 bg-surface border border-border h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full" 
            style={{ width: row.progress }} 
          />
        </div>
        <span className="text-xs text-text-muted">{row.progress}</span>
      </div>
    )
  },
  { header: 'Deadline', accessor: 'deadline' },
  { 
    header: 'Status', 
    accessor: 'status',
    cell: (row) => {
      const color = row.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger';
      return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${color}`}>
          {row.status}
        </span>
      );
    }
  },
];

export default function Projects() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Projects</h1>
          <p className="text-sm text-text-muted mt-1">Track and manage ongoing client projects.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Project
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={mockProjects} 
        onRowClick={(row) => navigate(`/projects/${row.id}`)}
      />
    </div>
  );
}
