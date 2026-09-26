import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/tables/DataTable';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';

const fetchLeave = async () => {
  const res = await api.get('/leaves');
  return res.data || res;
};

const columns = [
  { header: 'ID', accessor: '_id' },
  { header: 'Created At', accessor: 'createdAt' },
  { 
    header: 'Status', 
    accessor: 'status',
    cell: (row) => (
      <span className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
        {row.status || 'Active'}
      </span>
    )
  }
];

export default function Leave() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leaves'],
    queryFn: fetchLeave
  });

  const displayData = data?.data || data || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Leave</h1>
          <p className="text-sm text-text-muted mt-1">Manage and track your leave.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Leave
        </Button>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load leave" onRetry={refetch} />}
      {!isLoading && !isError && displayData.length === 0 && (
        <ErrorState title="No records found" message="There are currently no leave in the database." />
      )}
      {!isLoading && !isError && displayData.length > 0 && (
        <DataTable 
          columns={columns} 
          data={displayData} 
          onRowClick={(row) => console.log('Clicked', row)} 
        />
      )}
    </div>
  );
}
