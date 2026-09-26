import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/tables/DataTable';

const mockFollowUps = [
  { id: 'FU-001', lead: 'Acme Corp', type: 'Call', date: '2023-11-20', time: '10:00 AM', status: 'Pending' },
  { id: 'FU-002', lead: 'Global Tech', type: 'Email', date: '2023-11-20', time: '02:00 PM', status: 'Pending' },
  { id: 'FU-003', lead: 'Innomatrics', type: 'Meeting', date: '2023-11-21', time: '11:00 AM', status: 'Upcoming' },
];

const columns = [
  { header: 'Lead/Client', accessor: 'lead' },
  { header: 'Type', accessor: 'type' },
  { header: 'Date', accessor: 'date' },
  { header: 'Time', accessor: 'time' },
  { 
    header: 'Status', 
    accessor: 'status',
    cell: (row) => {
      const colorClass = row.status === 'Pending' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info';
      return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colorClass}`}>
          {row.status}
        </span>
      );
    }
  },
];

export default function FollowUps() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Follow-ups</h1>
          <p className="text-sm text-text-muted mt-1">Schedule and manage your follow-ups.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> Calendar View
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Schedule Follow-up
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={mockFollowUps} 
      />
    </div>
  );
}
