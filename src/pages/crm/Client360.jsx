import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';

const fetchClient360 = async (id) => {
  const [clientRes, projectsRes, invoicesRes, ticketsRes] = await Promise.all([
    api.get('/clients/' + id),
    api.get('/projects?clientId=' + id).catch(() => ({ data: [] })),
    api.get('/invoices?clientId=' + id).catch(() => ({ data: [] })),
    api.get('/tickets?clientId=' + id).catch(() => ({ data: [] }))
  ]);
  return {
    client: clientRes.data || clientRes,
    projects: projectsRes.data || [],
    invoices: invoicesRes.data || [],
    tickets: ticketsRes.data || []
  };
};

export default function Client360() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['client360', id],
    queryFn: () => fetchClient360(id)
  });

  if (isLoading) return <div className="p-6"><TableSkeleton /></div>;
  if (isError) return <div className="p-6 text-red-500">Failed to load Client 360 view</div>;

  const { client, projects, invoices, tickets } = data;

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900">{client.companyName || 'Unknown Client'}</h1>
        <p className="text-gray-500 mt-2">Client ID: {client.clientId}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded text-center">
            <h3 className="font-bold text-blue-700">Projects</h3>
            <p className="text-2xl">{projects.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded text-center">
            <h3 className="font-bold text-green-700">Invoices</h3>
            <p className="text-2xl">{invoices.length}</p>
          </div>
          <div className="bg-red-50 p-4 rounded text-center">
            <h3 className="font-bold text-red-700">Tickets</h3>
            <p className="text-2xl">{tickets.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
