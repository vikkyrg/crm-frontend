import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import DataTable from '../../components/tables/DataTable';
import { 
  Briefcase, 
  Users, 
  FileText, 
  ShieldCheck, 
  FolderKanban, 
  Globe, 
  Smartphone, 
  Wrench, 
  Headset, 
  Receipt, 
  CreditCard, 
  FileArchive, 
  Clock, 
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Building
} from 'lucide-react';

export default function Client360() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['client360', id],
    queryFn: async () => {
      const res = await api.get(`/clients/${id}/360`);
      return res.data || {};
    }
  });

  if (isLoading) return <div className="p-6"><TableSkeleton /></div>;
  if (isError) return <div className="p-6"><ErrorState title="Failed to load Client 360 View" onRetry={refetch} /></div>;

  const {
    client = {},
    summary = {},
    contacts = [],
    quotations = [],
    contracts = [],
    projects = [],
    websites = [],
    mobileApps = [],
    domains = [],
    hostings = [],
    amcs = [],
    tickets = [],
    invoices = [],
    payments = [],
    expenses = [],
    documents = [],
    activityTimeline = []
  } = data;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Briefcase },
    { id: 'contacts', name: `Contacts (${contacts.length})`, icon: Users },
    { id: 'projects', name: `Projects (${projects.length})`, icon: FolderKanban },
    { id: 'digital', name: `Digital Assets (${websites.length + mobileApps.length + domains.length})`, icon: Globe },
    { id: 'finance', name: `Finance (${invoices.length} Inv / ${payments.length} Pay)`, icon: DollarSign },
    { id: 'support', name: `Support Tickets (${tickets.length})`, icon: Headset },
    { id: 'agreements', name: `Agreements & AMC (${contracts.length + amcs.length})`, icon: ShieldCheck },
    { id: 'timeline', name: `Activity History`, icon: Clock },
  ];

  return (
    <div className="space-y-6 p-6">
      
      {/* Header Profile Card */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-text">{client.companyName}</h1>
                <p className="text-xs font-mono text-text-muted">Client ID: {client.clientId}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-text-muted">
              <span className="flex items-center"><Mail className="mr-1 h-3.5 w-3.5 text-primary" /> {client.email || 'N/A'}</span>
              <span className="flex items-center"><Phone className="mr-1 h-3.5 w-3.5 text-primary" /> {client.phone || 'N/A'}</span>
              <span className="flex items-center"><MapPin className="mr-1 h-3.5 w-3.5 text-primary" /> {client.address ? `${client.address}, ${client.city || ''}` : 'Location N/A'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-primary/10 text-primary font-semibold text-xs rounded-full">
              {client.status || 'Active'}
            </span>
          </div>
        </div>

        {/* 360 Financial KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-text-muted font-medium">Total Invoiced</p>
            <p className="text-lg font-bold text-text mt-0.5">₹{summary.totalInvoiced || 0}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-text-muted font-medium">Total Collected</p>
            <p className="text-lg font-bold text-success mt-0.5">₹{summary.totalPaid || 0}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-text-muted font-medium">Outstanding Balance</p>
            <p className="text-lg font-bold text-danger mt-0.5">₹{summary.totalOutstanding || 0}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-text-muted font-medium">Active Projects</p>
            <p className="text-lg font-bold text-primary mt-0.5">{summary.totalProjects || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex space-x-2 border-b border-border overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text hover:bg-surface'
            }`}
          >
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Client Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">GST Number:</span>
                <span className="font-semibold text-text">{client.gstNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">PAN Number:</span>
                <span className="font-semibold text-text">{client.panNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">Industry:</span>
                <span className="font-semibold text-text">{client.industry || 'Technology'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">Client Type:</span>
                <span className="font-semibold text-text">{client.clientType || 'Enterprise'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Active Projects ({projects.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              {projects.length === 0 && <p className="text-text-muted">No active projects.</p>}
              {projects.map((p) => (
                <div key={p._id} className="flex justify-between items-center p-2.5 bg-background rounded border border-border">
                  <div>
                    <p className="font-semibold text-text">{p.projectName}</p>
                    <p className="text-text-muted">{p.projectId}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary font-medium rounded text-[10px]">{p.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* CONTACTS TAB */}
      {activeTab === 'contacts' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Client Contacts</CardTitle></CardHeader>
          <CardContent>
            {contacts.length === 0 ? <p className="text-xs text-text-muted">No contacts saved.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((c) => (
                  <div key={c._id} className="p-4 bg-background rounded-lg border border-border space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm text-text">{c.contactName}</p>
                      {c.isPrimary && <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded">PRIMARY</span>}
                    </div>
                    <p className="text-text-muted">{c.designation || 'Contact'}</p>
                    <p className="text-text">Email: {c.email || 'N/A'}</p>
                    <p className="text-text">Phone: {c.phone || 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PROJECTS TAB */}
      {activeTab === 'projects' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Connected Projects</CardTitle></CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { header: 'Project ID', accessor: 'projectId' },
                { header: 'Project Name', accessor: 'projectName' },
                { header: 'Status', accessor: 'status' },
                { header: 'Budget', cell: (row) => `₹${row.budget || 0}` }
              ]}
              data={projects}
            />
          </CardContent>
        </Card>
      )}

      {/* DIGITAL ASSETS TAB */}
      {activeTab === 'digital' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Websites Portfolio</CardTitle></CardHeader>
            <CardContent>
              <DataTable 
                columns={[
                  { header: 'Website ID', accessor: 'websiteId' },
                  { header: 'Domain Name', accessor: 'domainName' },
                  { header: 'Type', accessor: 'websiteType' },
                  { header: 'Status', accessor: 'status' }
                ]}
                data={websites}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Domains & SSL</CardTitle></CardHeader>
            <CardContent>
              <DataTable 
                columns={[
                  { header: 'Domain', accessor: 'domainName' },
                  { header: 'Expiry Date', cell: (row) => new Date(row.expiryDate).toLocaleDateString() },
                  { header: 'Status', accessor: 'status' }
                ]}
                data={domains}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* FINANCE TAB */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Invoices</CardTitle></CardHeader>
            <CardContent>
              <DataTable 
                columns={[
                  { header: 'Invoice #', accessor: 'invoiceNumber' },
                  { header: 'Total Amount', cell: (row) => `₹${row.totalAmount}` },
                  { header: 'Amount Paid', cell: (row) => `₹${row.amountPaid || 0}` },
                  { header: 'Balance', cell: (row) => `₹${row.balance}` },
                  { header: 'Status', accessor: 'status' }
                ]}
                data={invoices}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Payments Received</CardTitle></CardHeader>
            <CardContent>
              <DataTable 
                columns={[
                  { header: 'Payment ID', accessor: 'paymentId' },
                  { header: 'Amount', cell: (row) => `₹${row.amount}` },
                  { header: 'Method', accessor: 'paymentMethod' },
                  { header: 'Date', cell: (row) => new Date(row.paymentDate || row.createdAt).toLocaleDateString() }
                ]}
                data={payments}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUPPORT TAB */}
      {activeTab === 'support' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Support Tickets</CardTitle></CardHeader>
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

      {/* AGREEMENTS & AMC TAB */}
      {activeTab === 'agreements' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Contracts & Agreements</CardTitle></CardHeader>
            <CardContent>
              <DataTable 
                columns={[
                  { header: 'Contract #', accessor: 'contractNumber' },
                  { header: 'Title', accessor: 'title' },
                  { header: 'Type', accessor: 'contractType' },
                  { header: 'Status', accessor: 'status' }
                ]}
                data={contracts}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Annual Maintenance Contracts (AMC)</CardTitle></CardHeader>
            <CardContent>
              <DataTable 
                columns={[
                  { header: 'AMC #', accessor: 'amcNumber' },
                  { header: 'Title', accessor: 'title' },
                  { header: 'Value', cell: (row) => `₹${row.amcValue}` },
                  { header: 'Renewal Status', accessor: 'renewalStatus' }
                ]}
                data={amcs}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Activity & Audit Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {activityTimeline.length === 0 && <p className="text-xs text-text-muted">No recent activity logged.</p>}
            {activityTimeline.map((log) => (
              <div key={log._id} className="flex items-start space-x-3 text-xs p-2.5 bg-background rounded border border-border">
                <Clock className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-text">{log.action}</p>
                  <p className="text-text-muted">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
