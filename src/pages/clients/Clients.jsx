import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clientService } from '../../services/clientService';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/tables/DataTable';
import ClientForm from '../../components/forms/ClientForm';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';

const columns = [
  { header: 'Client ID', accessor: 'id' },
  { header: 'Company', accessor: 'company' },
  { header: 'Primary Contact', accessor: 'contact' },
  { header: 'Email', accessor: 'email' },
  { header: 'Active Projects', accessor: 'projects' },
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

export default function Clients() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const { data: clients, isLoading, isError, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getClients,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Clients</h1>
          <p className="text-sm text-text-muted mt-1">Manage all your company clients.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface border border-border p-6 rounded-lg mb-6">
          <h2 className="text-lg font-bold text-text mb-4">Create New Client</h2>
          <ClientForm 
            onSuccess={() => setShowForm(false)} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}

      {!showForm && (
        <>
          {isLoading && <TableSkeleton />}
          
          {isError && <ErrorState title="Failed to load clients" onRetry={refetch} />}
          
          {!isLoading && !isError && clients && (
            <DataTable 
              columns={columns} 
              data={clients} 
              onRowClick={(row) => navigate(`/clients/${row.id}`)}
            />
          )}
        </>
      )}
    </div>
  );
}
