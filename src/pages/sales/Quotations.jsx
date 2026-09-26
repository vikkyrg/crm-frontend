import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/tables/DataTable';

const mockQuotations = [
  { id: 'QUO-001', client: 'Stark Industries', project: 'Arc Reactor UI', amount: '$45,000', status: 'Sent', date: '2023-11-15' },
  { id: 'QUO-002', client: 'Wayne Enterprises', project: 'Batcave Security', amount: '$120,000', status: 'Approved', date: '2023-11-10' },
  { id: 'QUO-003', client: 'Oscorp', project: 'Glider Navigation', amount: '$85,000', status: 'Draft', date: '2023-11-18' },
];

const columns = [
  { header: 'Quotation #', accessor: 'id' },
  { header: 'Client', accessor: 'client' },
  { header: 'Project', accessor: 'project' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Date', accessor: 'date' },
  { 
    header: 'Status', 
    accessor: 'status',
    cell: (row) => {
      let color = 'bg-text-muted/10 text-text-muted';
      if (row.status === 'Approved') color = 'bg-success/10 text-success';
      if (row.status === 'Sent') color = 'bg-info/10 text-info';
      
      return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${color}`}>
          {row.status}
        </span>
      );
    }
  },
];

export default function Quotations() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Quotations</h1>
          <p className="text-sm text-text-muted mt-1">Manage sales proposals and quotations.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Quotation
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={mockQuotations} 
        onRowClick={(row) => navigate(`/sales/quotations/${row.id}`)}
      />
    </div>
  );
}
