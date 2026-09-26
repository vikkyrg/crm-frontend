import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/tables/DataTable';

const mockAMC = [
  { id: 'AMC-001', client: 'Stark Industries', service: 'Server Maintenance', expiry: '2024-12-31', value: '$12,000/yr', status: 'Active' },
  { id: 'AMC-002', client: 'Wayne Enterprises', service: 'SEO & Marketing', expiry: '2023-11-30', value: '$5,000/mo', status: 'Expiring Soon' },
];

const columns = [
  { header: 'AMC ID', accessor: 'id' },
  { header: 'Client', accessor: 'client' },
  { header: 'Service', accessor: 'service' },
  { header: 'Expiry Date', accessor: 'expiry' },
  { header: 'Value', accessor: 'value' },
  { 
    header: 'Status', 
    accessor: 'status',
    cell: (row) => {
      let color = 'bg-success/10 text-success';
      if (row.status === 'Expiring Soon') color = 'bg-warning/10 text-warning';
      return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${color}`}>{row.status}</span>;
    }
  },
];

export default function AMC() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">AMC / Renewals</h1>
          <p className="text-sm text-text-muted mt-1">Track recurring business and annual maintenance contracts.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add AMC
        </Button>
      </div>

      <DataTable columns={columns} data={mockAMC} />
    </div>
  );
}
