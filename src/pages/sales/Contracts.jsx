import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/tables/DataTable';

const mockContracts = [
  { id: 'CON-001', client: 'Stark Industries', type: 'Service Agreement', start: '2023-01-01', end: '2024-01-01', value: '$120,000', status: 'Active' },
  { id: 'CON-002', client: 'Wayne Enterprises', type: 'NDA', start: '2023-06-15', end: '2028-06-15', value: '-', status: 'Active' },
];

const columns = [
  { header: 'Contract ID', accessor: 'id' },
  { header: 'Client', accessor: 'client' },
  { header: 'Type', accessor: 'type' },
  { header: 'Start Date', accessor: 'start' },
  { header: 'End Date', accessor: 'end' },
  { header: 'Value', accessor: 'value' },
  { 
    header: 'Status', 
    accessor: 'status',
    cell: (row) => (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${row.status === 'Active' ? 'bg-success/10 text-success' : 'bg-text-muted/10 text-text-muted'}`}>
        {row.status}
      </span>
    )
  },
];

export default function Contracts() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Agreements / Contracts</h1>
          <p className="text-sm text-text-muted mt-1">Manage legal and service agreements.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Contract
        </Button>
      </div>

      <DataTable columns={columns} data={mockContracts} />
    </div>
  );
}
