import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/tables/DataTable';

const mockWebsites = [
  { id: 'WEB-001', client: 'Stark Industries', domain: 'starkindustries.com', type: 'Corporate', status: 'Active', amc: 'Active' },
  { id: 'WEB-002', client: 'Wayne Enterprises', domain: 'waynecorp.com', type: 'E-commerce', status: 'In Development', amc: 'Pending' },
];

const columns = [
  { header: 'Website ID', accessor: 'id' },
  { header: 'Client', accessor: 'client' },
  { header: 'Domain', accessor: 'domain' },
  { header: 'Type', accessor: 'type' },
  { 
    header: 'AMC', 
    accessor: 'amc',
    cell: (row) => (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${row.amc === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
        {row.amc}
      </span>
    )
  },
  { 
    header: 'Status', 
    accessor: 'status',
    cell: (row) => (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${row.status === 'Active' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'}`}>
        {row.status}
      </span>
    )
  },
];

export default function Websites() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Websites Portfolio</h1>
          <p className="text-sm text-text-muted mt-1">Manage client websites, domains, and hosting records.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Website
        </Button>
      </div>

      <DataTable columns={columns} data={mockWebsites} />
    </div>
  );
}
