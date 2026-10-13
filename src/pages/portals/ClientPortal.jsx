import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import DataTable from '../../components/tables/DataTable';
import { Briefcase, FolderKanban, Receipt, Headset, FileArchive, Building, Printer, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState('projects');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clientPortalData'],
    queryFn: async () => {
      const res = await api.get('/portal/client');
      return res.data || {};
    }
  });

  if (isLoading) return <div className="p-6"><TableSkeleton /></div>;
  if (isError) return <div className="p-6"><ErrorState title="Failed to load Client Portal" message="Please ensure you are logged in as a Client user." onRetry={refetch} /></div>;

  const {
    client = {},
    projects = [],
    quotations = [],
    invoices = [],
    payments = [],
    tickets = [],
    documents = []
  } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Profile */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text flex items-center">
            <Building className="mr-2 sm:mr-3 h-5 sm:h-7 w-5 sm:w-7 text-primary" /> {client.companyName || 'Client Portal'}
          </h1>
          <p className="text-xs text-text-muted mt-1">Client Account ID: {client.clientId} | Contact: {client.contactPerson}</p>
        </div>
        <span className="px-3 py-1 bg-success/20 text-success text-[11px] sm:text-xs font-bold rounded-full">Authorized Portal Access</span>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-border overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
            activeTab === 'projects' ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface'
          }`}
        >
          <FolderKanban className="mr-2 h-4 w-4" /> My Projects ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
            activeTab === 'invoices' ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface'
          }`}
        >
          <Receipt className="mr-2 h-4 w-4" /> Invoices & Payments ({invoices.length})
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
            activeTab === 'support' ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface'
          }`}
        >
          <Headset className="mr-2 h-4 w-4" /> Support Tickets ({tickets.length})
        </button>
      </div>

      {/* TAB CONTENT */}

      {activeTab === 'projects' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Project Status & Progress</CardTitle></CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { header: 'Project ID', accessor: 'projectId' },
                { header: 'Project Name', accessor: 'projectName' },
                { header: 'Status', accessor: 'status' }
              ]}
              data={projects}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'invoices' && (
        <Card>
          <CardHeader><CardTitle className="text-base">My Invoices</CardTitle></CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { header: 'Invoice #', accessor: 'invoiceNumber' },
                { header: 'Total Amount', cell: (row) => `₹${(row.totalAmount || 0).toLocaleString()}` },
                { header: 'Paid Amount', cell: (row) => `₹${(row.amountPaid || 0).toLocaleString()}` },
                { header: 'Balance Due', cell: (row) => `₹${(row.balance || 0).toLocaleString()}` },
                { header: 'Status', accessor: 'status' },
                {
                  header: 'Actions',
                  cell: (row) => (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`http://localhost:5000/api/v1/invoices/${row._id}/print-html`, '_blank')}
                      title="View Official Branded PDF / Print Invoice"
                    >
                      <Printer className="mr-1 h-3.5 w-3.5" /> PDF / Print
                    </Button>
                  )
                }
              ]}
              data={invoices}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'support' && (
        <Card>
          <CardHeader><CardTitle className="text-base">My Support Tickets</CardTitle></CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { header: 'Ticket ID', accessor: 'ticketId' },
                { header: 'Subject', accessor: 'subject' },
                { header: 'Priority', accessor: 'priority' },
                { header: 'Status', accessor: 'status' }
              ]}
              data={tickets}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
