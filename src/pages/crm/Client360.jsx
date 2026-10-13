import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import DataTable from '../../components/tables/DataTable';
import { toast } from 'sonner';
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
  Clock, 
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Building,
  Edit,
  Plus,
  X,
  ExternalLink
} from 'lucide-react';

export default function Client360() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [projectStatusFilter, setProjectStatusFilter] = useState('All');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // Client Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['client360', id],
    queryFn: async () => {
      const res = await api.get(`/clients/${id}/360`);
      return res.data || {};
    }
  });

  // Client Edit Mutation
  const updateClientMutation = useMutation({
    mutationFn: async (payload) => api.put(`/clients/${id}`, payload),
    onSuccess: () => {
      toast.success('Client profile updated successfully!');
      setShowEditModal(false);
      queryClient.invalidateQueries(['client360', id]);
      queryClient.invalidateQueries(['clients']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update client profile');
    }
  });

  // Add Contact Mutation
  const addContactMutation = useMutation({
    mutationFn: async (payload) => api.post('/contacts', { ...payload, clientId: id }),
    onSuccess: () => {
      toast.success('Contact added successfully!');
      setShowAddContactModal(false);
      queryClient.invalidateQueries(['client360', id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add contact');
    }
  });

  // Add Project Mutation (Pre-linked to this client)
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    serviceType: 'Website Development',
    budget: '',
    advanceType: 'Percentage',
    advancePercentage: 30,
    advanceRequired: 0,
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: '',
    status: 'Active',
    priority: 'Medium'
  });

  const addProjectMutation = useMutation({
    mutationFn: async (payload) => api.post('/projects', { ...payload, clientId: id }),
    onSuccess: () => {
      toast.success('Project created and linked to client successfully!');
      setShowAddProjectModal(false);
      setProjectForm({
        projectName: '',
        serviceType: 'Website Development',
        budget: '',
        advanceType: 'Percentage',
        advancePercentage: 30,
        advanceRequired: 0,
        startDate: new Date().toISOString().split('T')[0],
        expectedEndDate: '',
        status: 'Active',
        priority: 'Medium'
      });
      queryClient.invalidateQueries(['client360', id]);
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['projects']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create project');
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
    creditNotes = [],
    activityTimeline = []
  } = data;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Briefcase },
    { id: 'contacts', name: `Contacts (${contacts.length})`, icon: Users },
    { id: 'projects', name: `Projects (${projects.length})`, icon: FolderKanban },
    { id: 'quotations', name: `Quotations (${quotations.length})`, icon: FileText },
    { id: 'finance', name: `Finance (${invoices.length} Inv / ${payments.length} Pay)`, icon: DollarSign },
    { id: 'digital', name: `Digital Assets (${websites.length + domains.length})`, icon: Globe },
    { id: 'support', name: `Support Tickets (${tickets.length})`, icon: Headset },
    { id: 'agreements', name: `Agreements & AMC (${contracts.length + amcs.length})`, icon: ShieldCheck },
    { id: 'timeline', name: `Activity History (${activityTimeline.length})`, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Profile Card */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text">{client.companyName}</h1>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {client.clientId || 'Client Profile'}
                  </span>
                  <span className="text-xs text-text-muted">
                    {client.clientType || 'Enterprise'} &bull; {client.industry || 'Technology'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-text-muted">
              <span className="flex items-center"><Mail className="mr-1.5 h-3.5 w-3.5 text-primary" /> {client.email || 'N/A'}</span>
              <span className="flex items-center"><Phone className="mr-1.5 h-3.5 w-3.5 text-primary" /> {client.phone || 'N/A'}</span>
              <span className="flex items-center"><MapPin className="mr-1.5 h-3.5 w-3.5 text-primary" /> {client.address ? `${client.address}, ${client.city || ''}` : 'Location N/A'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 font-semibold text-xs rounded-full ${
              client.status === 'Active' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
            }`}>
              {client.status || 'Active'}
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit Client
            </Button>
          </div>
        </div>

        {/* 360 Comprehensive KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6 pt-6 border-t border-border">
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-[11px] text-text-muted font-medium">Contract Value</p>
            <p className="text-base font-bold text-text mt-0.5">₹{(summary.totalContractValue || 0).toLocaleString()}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-[11px] text-text-muted font-medium">Total Invoiced</p>
            <p className="text-base font-bold text-primary mt-0.5">₹{(summary.totalInvoiced || 0).toLocaleString()}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-[11px] text-text-muted font-medium">Total Collected</p>
            <p className="text-base font-bold text-success mt-0.5">₹{(summary.totalPaid || 0).toLocaleString()}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-[11px] text-text-muted font-medium">Advance Received</p>
            <p className="text-base font-bold text-purple-400 mt-0.5">₹{(summary.totalAdvanceReceived || 0).toLocaleString()}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-[11px] text-text-muted font-medium">Outstanding Bal.</p>
            <p className="text-base font-bold text-danger mt-0.5">₹{(summary.totalOutstanding || 0).toLocaleString()}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-[11px] text-text-muted font-medium">Overdue Amount</p>
            <p className="text-base font-bold text-amber-500 mt-0.5">₹{(summary.totalOverdue || 0).toLocaleString()}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-[11px] text-text-muted font-medium">Unbilled Value</p>
            <p className="text-base font-bold text-text mt-0.5">₹{(summary.totalUnbilled || 0).toLocaleString()}</p>
          </div>
          <div 
            onClick={() => {
              setActiveTab('projects');
              setProjectStatusFilter('All');
            }}
            className="bg-background p-3 rounded-lg border border-border text-center cursor-pointer hover:border-primary transition-all group"
            title="Click to view all projects"
          >
            <p className="text-[11px] text-text-muted font-medium group-hover:text-primary transition-colors">Projects (Act/Tot)</p>
            <p className="text-base font-bold text-primary mt-0.5">
              <span className="text-success">{summary.activeProjects || 0}</span> / {summary.totalProjects || 0}
            </p>
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
                ? 'bg-primary text-white shadow-sm'
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
            <CardHeader><CardTitle className="text-base">Client Details & Registration</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">GST Number:</span>
                <span className="font-semibold text-text font-mono">{client.gstNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">PAN Number:</span>
                <span className="font-semibold text-text font-mono">{client.panNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">Industry:</span>
                <span className="font-semibold text-text">{client.industry || 'Technology'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">Client Classification:</span>
                <span className="font-semibold text-text">{client.clientType || 'Enterprise'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">Account Manager:</span>
                <span className="font-semibold text-text">{client.accountManager?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-text-muted">Internal Notes:</span>
                <span className="font-normal text-text">{client.notes || 'None recorded'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Connected Projects ({projects.length})</CardTitle>
              <Link to="/projects" className="text-xs text-primary font-semibold hover:underline">View All</Link>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {projects.length === 0 && <p className="text-text-muted py-4 text-center">No projects linked to this client yet.</p>}
              {projects.map((p) => (
                <div key={p._id} className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                  <div>
                    <Link to={`/projects/${p._id}`} className="font-semibold text-text hover:text-primary hover:underline">
                      {p.projectName}
                    </Link>
                    <p className="text-text-muted text-[11px]">{p.projectId} &bull; Budget: ₹{(p.budget || 0).toLocaleString()}</p>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Client Contacts Directory</CardTitle>
            <Button size="sm" onClick={() => setShowAddContactModal(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Contact
            </Button>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-xs text-text-muted py-6 text-center">No additional contacts saved for this client.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((c) => (
                  <div key={c._id} className="p-4 bg-background rounded-lg border border-border space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm text-text">{c.contactName}</p>
                      {c.isPrimary && <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded">PRIMARY</span>}
                    </div>
                    <p className="text-text-muted">{c.designation || 'Representative'}</p>
                    <p className="text-text"><span className="text-text-muted">Email:</span> {c.email || 'N/A'}</p>
                    <p className="text-text"><span className="text-text-muted">Phone:</span> {c.phone || 'N/A'}</p>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Projects Portfolio ({projects.length})</CardTitle>
            <Button size="sm" onClick={() => setShowAddProjectModal(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Project
            </Button>
          </CardHeader>
          <CardContent>
            {/* Project Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-3 border-b border-border">
              <span className="text-[11px] font-semibold text-text-muted mr-2">Filter by Status:</span>
              {['All', 'Active', 'Planning', 'In Progress', 'Testing', 'Completed', 'On Hold', 'Delayed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setProjectStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                    projectStatusFilter === st
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-background hover:bg-surface text-text-muted hover:text-text border border-border'
                  }`}
                >
                  {st}
                  {st === 'All' 
                    ? ` (${projects.length})` 
                    : ` (${projects.filter(p => p.status === st).length})`}
                </button>
              ))}
            </div>

            {projects.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-text-muted">No projects associated with this client yet.</p>
                <Button size="sm" onClick={() => setShowAddProjectModal(true)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Create First Project
                </Button>
              </div>
            ) : (
              <DataTable 
                columns={[
                  { header: 'Project ID', accessor: 'projectId' },
                  { 
                    header: 'Project Name', 
                    cell: (row) => (
                      <Link to={`/projects/${row._id}`} className="font-bold text-primary hover:underline">
                        {row.projectName}
                      </Link>
                    ) 
                  },
                  { 
                    header: 'Status', 
                    cell: (row) => (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        row.status === 'Completed' ? 'bg-success/20 text-success' :
                        row.status === 'Active' || row.status === 'In Progress' ? 'bg-primary/20 text-primary' :
                        row.status === 'Delayed' ? 'bg-danger/20 text-danger' :
                        'bg-warning/20 text-warning'
                      }`}>
                        {row.status}
                      </span>
                    )
                  },
                  { header: 'Budget', cell: (row) => `₹${(row.budget || 0).toLocaleString()}` }
                ]}
                data={projectStatusFilter === 'All' ? projects : projects.filter(p => p.status === projectStatusFilter)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* QUOTATIONS TAB */}
      {activeTab === 'quotations' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Quotations & Proposals</CardTitle>
            <Link to="/sales/quotations" className="text-xs text-primary font-semibold hover:underline">
              Manage Quotations &rarr;
            </Link>
          </CardHeader>
          <CardContent>
            {quotations.length === 0 ? (
              <p className="text-xs text-text-muted py-6 text-center">No quotations generated for this client.</p>
            ) : (
              <DataTable 
                columns={[
                  { header: 'Quotation #', accessor: 'quotationNumber' },
                  { header: 'Title', accessor: 'title' },
                  { header: 'Total Amount', cell: (row) => `₹${(row.totalAmount || 0).toLocaleString()}` },
                  { header: 'Approval', accessor: 'approvalStatus' },
                  { header: 'Status', accessor: 'status' }
                ]}
                data={quotations}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* FINANCE TAB */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Invoices ({invoices.length})</CardTitle>
              <Link to="/finance/invoices" className="text-xs text-primary font-semibold hover:underline">Open Invoices Hub</Link>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? <p className="text-xs text-text-muted py-4 text-center">No invoices issued.</p> : (
                <DataTable 
                  columns={[
                    { header: 'Invoice #', accessor: 'invoiceNumber' },
                    { header: 'Total Amount', cell: (row) => `₹${(row.totalAmount || 0).toLocaleString()}` },
                    { header: 'Amount Paid', cell: (row) => `₹${(row.amountPaid || 0).toLocaleString()}` },
                    { header: 'Balance Due', cell: (row) => `₹${(row.balance || 0).toLocaleString()}` },
                    { header: 'Status', accessor: 'status' }
                  ]}
                  data={invoices}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Payments Received ({payments.length})</CardTitle></CardHeader>
            <CardContent>
              {payments.length === 0 ? <p className="text-xs text-text-muted py-4 text-center">No recorded payments.</p> : (
                <DataTable 
                  columns={[
                    { header: 'Payment ID', accessor: 'paymentId' },
                    { header: 'Amount', cell: (row) => `₹${(row.amount || 0).toLocaleString()}` },
                    { header: 'Method', accessor: 'paymentMethod' },
                    { header: 'Transaction Ref', accessor: 'transactionReference' },
                    { header: 'Date', cell: (row) => new Date(row.paymentDate || row.createdAt).toLocaleDateString() }
                  ]}
                  data={payments}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Credit Notes & Adjustments ({creditNotes.length})</CardTitle></CardHeader>
            <CardContent>
              {creditNotes.length === 0 ? <p className="text-xs text-text-muted py-4 text-center">No credit notes issued for this client.</p> : (
                <DataTable 
                  columns={[
                    { header: 'Credit Note #', accessor: 'creditNoteNumber' },
                    { header: 'Credit Amount', cell: (row) => `₹${(row.totalCreditAmount || 0).toLocaleString()}` },
                    { header: 'Adjustment Type', accessor: 'adjustmentType' },
                    { header: 'Reason', accessor: 'reason' },
                    { header: 'Status', accessor: 'status' },
                    { header: 'Date', cell: (row) => new Date(row.issueDate || row.createdAt).toLocaleDateString() }
                  ]}
                  data={creditNotes}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* DIGITAL ASSETS TAB */}
      {activeTab === 'digital' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Websites Portfolio</CardTitle></CardHeader>
            <CardContent>
              {websites.length === 0 ? <p className="text-xs text-text-muted py-4 text-center">No websites registered.</p> : (
                <DataTable 
                  columns={[
                    { header: 'Domain Name', accessor: 'domainName' },
                    { header: 'Type', accessor: 'websiteType' },
                    { header: 'Status', accessor: 'status' }
                  ]}
                  data={websites}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Domains & SSL</CardTitle></CardHeader>
            <CardContent>
              {domains.length === 0 ? <p className="text-xs text-text-muted py-4 text-center">No domains managed.</p> : (
                <DataTable 
                  columns={[
                    { header: 'Domain', accessor: 'domainName' },
                    { header: 'Registrar', accessor: 'registrar' },
                    { header: 'Expiry Date', cell: (row) => new Date(row.expiryDate).toLocaleDateString() },
                    { header: 'Status', accessor: 'status' }
                  ]}
                  data={domains}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUPPORT TAB */}
      {activeTab === 'support' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Support Tickets</CardTitle>
            <Link to="/support/tickets" className="text-xs text-primary font-semibold hover:underline">Manage All Tickets</Link>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? <p className="text-xs text-text-muted py-6 text-center">No tickets for this client.</p> : (
              <DataTable 
                columns={[
                  { header: 'Ticket ID', accessor: 'ticketId' },
                  { header: 'Subject', accessor: 'subject' },
                  { header: 'Priority', accessor: 'priority' },
                  { header: 'Status', accessor: 'status' }
                ]}
                data={tickets}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* AGREEMENTS & AMC TAB */}
      {activeTab === 'agreements' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Contracts & Agreements</CardTitle></CardHeader>
            <CardContent>
              {contracts.length === 0 ? <p className="text-xs text-text-muted py-4 text-center">No contracts found.</p> : (
                <DataTable 
                  columns={[
                    { header: 'Contract #', accessor: 'contractNumber' },
                    { header: 'Title', accessor: 'title' },
                    { header: 'Type', accessor: 'contractType' },
                    { header: 'Status', accessor: 'status' }
                  ]}
                  data={contracts}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Annual Maintenance Contracts (AMC)</CardTitle></CardHeader>
            <CardContent>
              {amcs.length === 0 ? <p className="text-xs text-text-muted py-4 text-center">No active AMCs found.</p> : (
                <DataTable 
                  columns={[
                    { header: 'AMC #', accessor: 'amcNumber' },
                    { header: 'Title', accessor: 'title' },
                    { header: 'Value', cell: (row) => `₹${(row.amcValue || 0).toLocaleString()}` },
                    { header: 'Renewal Status', accessor: 'renewalStatus' }
                  ]}
                  data={amcs}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Activity & Audit Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {activityTimeline.length === 0 && <p className="text-xs text-text-muted py-4 text-center">No activity logged.</p>}
            {activityTimeline.map((log) => (
              <div key={log._id} className="flex items-start space-x-3 text-xs p-3 bg-background rounded-lg border border-border">
                <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-text">{log.action}</p>
                  <p className="text-text-muted mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* EDIT CLIENT MODAL */}
      {showEditModal && (
        <EditClientModal 
          client={client}
          isLoading={updateClientMutation.isPending}
          onClose={() => setShowEditModal(false)}
          onSave={(payload) => updateClientMutation.mutate(payload)}
        />
      )}

      {/* ADD CONTACT MODAL */}
      {showAddContactModal && (
        <AddContactModal 
          isLoading={addContactMutation.isPending}
          onClose={() => setShowAddContactModal(false)}
          onSave={(payload) => addContactMutation.mutate(payload)}
        />
      )}

      {/* ADD PROJECT MODAL */}
      {showAddProjectModal && (
        <AddProjectModal
          clientName={client.companyName}
          isLoading={addProjectMutation.isPending}
          onClose={() => setShowAddProjectModal(false)}
          onSave={(payload) => addProjectMutation.mutate(payload)}
        />
      )}

    </div>
  );
}

// Edit Client Modal for Client360
function EditClientModal({ client, isLoading, onClose, onSave }) {
  const [formData, setFormData] = useState({
    companyName: client.companyName || '',
    contactPerson: client.contactPerson || '',
    email: client.email || '',
    phone: client.phone || '',
    whatsapp: client.whatsapp || '',
    address: client.address || '',
    city: client.city || '',
    state: client.state || '',
    country: client.country || 'India',
    gstNumber: client.gstNumber || '',
    panNumber: client.panNumber || '',
    industry: client.industry || 'Information Technology',
    clientType: client.clientType || 'Enterprise',
    status: client.status || 'Active',
    notes: client.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast.error('Company Name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
          <h2 className="text-base font-bold text-text flex items-center">
            <Edit className="mr-2 h-4 w-4 text-primary" /> Edit Client Details
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-text block mb-1">Company Name *</label>
            <input 
              type="text" 
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full bg-background border border-border rounded p-2 text-text font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">Contact Person</label>
              <input 
                type="text" 
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              />
            </div>
            <div>
              <label className="font-semibold text-text block mb-1">Client Classification</label>
              <select 
                value={formData.clientType}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              >
                <option value="Enterprise">Enterprise</option>
                <option value="SMB">SMB</option>
                <option value="Startup">Startup</option>
                <option value="Government">Government</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              />
            </div>
            <div>
              <label className="font-semibold text-text block mb-1">Phone</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">GST Number</label>
              <input 
                type="text" 
                maxLength={15}
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className="w-full bg-background border border-border rounded p-2 text-text font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-text block mb-1">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-text block mb-1">Address</label>
            <input 
              type="text" 
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-background border border-border rounded p-2 text-text"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Contact Modal
function AddContactModal({ isLoading, onClose, onSave }) {
  const [contactData, setContactData] = useState({
    contactName: '',
    designation: '',
    email: '',
    phone: '',
    isPrimary: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactData.contactName.trim()) {
      toast.error('Contact Name is required');
      return;
    }
    onSave(contactData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
          <h2 className="text-base font-bold text-text flex items-center">
            <Users className="mr-2 h-4 w-4 text-primary" /> Add New Contact
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-text block mb-1">Contact Name *</label>
            <input 
              type="text" 
              required
              value={contactData.contactName}
              onChange={(e) => setContactData({ ...contactData, contactName: e.target.value })}
              className="w-full bg-background border border-border rounded p-2 text-text"
              placeholder="e.g. Anand Verma"
            />
          </div>

          <div>
            <label className="font-semibold text-text block mb-1">Designation</label>
            <input 
              type="text" 
              value={contactData.designation}
              onChange={(e) => setContactData({ ...contactData, designation: e.target.value })}
              className="w-full bg-background border border-border rounded p-2 text-text"
              placeholder="e.g. CTO / Product Manager"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">Email</label>
              <input 
                type="email" 
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              />
            </div>
            <div>
              <label className="font-semibold text-text block mb-1">Phone</label>
              <input 
                type="text" 
                value={contactData.phone}
                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="isPrimary"
              checked={contactData.isPrimary}
              onChange={(e) => setContactData({ ...contactData, isPrimary: e.target.checked })}
              className="rounded border-border text-primary"
            />
            <label htmlFor="isPrimary" className="text-xs text-text font-medium">Set as Primary Contact</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Save Contact</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Project Modal for Client360
function AddProjectModal({ clientName, isLoading, onClose, onSave }) {
  const [form, setForm] = useState({
    projectName: '',
    serviceType: 'Website Development',
    budget: '',
    advanceType: 'Percentage',
    advancePercentage: 30,
    advanceRequired: 0,
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: '',
    status: 'Active',
    priority: 'Medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.projectName.trim()) {
      toast.error('Project Name is required');
      return;
    }
    const numBudget = Number(form.budget) || 0;
    let advReq = 0;
    if (form.advanceType === 'Percentage') {
      advReq = (numBudget * (Number(form.advancePercentage) || 0)) / 100;
    } else if (form.advanceType === 'Fixed') {
      advReq = Number(form.advanceRequired) || 0;
    }

    onSave({
      ...form,
      budget: numBudget,
      advanceRequired: advReq
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-text">Create Project for {clientName}</h2>
            <p className="text-xs text-text-muted">Link a new independent project to this client profile</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-text block mb-1">Project Name *</label>
            <input 
              type="text" 
              required
              value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              className="w-full bg-background border border-border rounded p-2 text-text"
              placeholder="e.g. NextGen Web Portal & Mobile App"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">Service Type</label>
              <select 
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              >
                <option value="Website Development">Website Development</option>
                <option value="Website Design">Website Design</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Custom Software Development">Custom Software Development</option>
                <option value="AMC">AMC & Maintenance</option>
                <option value="SEO and Digital Marketing">SEO & Digital Marketing</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text block mb-1">Agreed Value / Budget (₹) *</label>
              <input 
                type="number" 
                required
                min="0"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
                placeholder="e.g. 250000"
              />
            </div>
          </div>

          {/* Advance Configuration */}
          <div className="p-3 bg-background border border-border rounded-lg space-y-2">
            <label className="font-semibold text-text block">Advance Payment Requirement</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <select 
                  value={form.advanceType}
                  onChange={(e) => setForm({ ...form, advanceType: e.target.value })}
                  className="w-full bg-surface border border-border rounded p-1.5 text-text"
                >
                  <option value="Percentage">Percentage of Budget</option>
                  <option value="Fixed">Fixed Amount</option>
                  <option value="None">No Advance Required</option>
                </select>
              </div>
              <div>
                {form.advanceType === 'Percentage' ? (
                  <div className="flex items-center space-x-1">
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={form.advancePercentage}
                      onChange={(e) => setForm({ ...form, advancePercentage: e.target.value })}
                      className="w-full bg-surface border border-border rounded p-1.5 text-text text-right"
                    />
                    <span className="text-text-muted font-bold">%</span>
                  </div>
                ) : form.advanceType === 'Fixed' ? (
                  <input 
                    type="number" 
                    min="0"
                    value={form.advanceRequired}
                    onChange={(e) => setForm({ ...form, advanceRequired: e.target.value })}
                    className="w-full bg-surface border border-border rounded p-1.5 text-text"
                    placeholder="Advance ₹"
                  />
                ) : (
                  <span className="text-text-muted text-[11px] block pt-1.5">No advance mandatory</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-text block mb-1">Start Date</label>
              <input 
                type="date" 
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              />
            </div>
            <div>
              <label className="font-semibold text-text block mb-1">Expected Delivery Date</label>
              <input 
                type="date" 
                value={form.expectedEndDate}
                onChange={(e) => setForm({ ...form, expectedEndDate: e.target.value })}
                className="w-full bg-background border border-border rounded p-2 text-text"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Create Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

