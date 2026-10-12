import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  ArrowUpRight, 
  Plus, 
  Receipt, 
  Headset, 
  FolderKanban, 
  Globe 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function ManagementDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['managementMetrics'],
    queryFn: async () => {
      const res = await api.get('/dashboard/metrics');
      return res.data || {};
    }
  });

  if (isLoading) return <div className="p-6"><TableSkeleton /></div>;
  if (isError) return <div className="p-6"><ErrorState title="Failed to load dashboard metrics" onRetry={refetch} /></div>;

  const sales = data.sales || {};
  const finance = data.finance || {};
  const ops = data.operations || {};
  const recurring = data.recurring || {};

  const kpis = [
    { 
      title: "New / Qualified Leads", 
      value: `${sales.newLeads || 0} / ${sales.qualifiedLeads || 0}`, 
      icon: Users, 
      color: "text-primary", 
      sub: `${sales.wonLeads || 0} Leads Converted`,
      link: "/crm/leads"
    },
    { 
      title: "Cash Collected", 
      value: `₹${(finance.collected || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-success", 
      sub: `₹${(finance.outstanding || 0).toLocaleString()} Outstanding`,
      link: "/finance/invoices"
    },
    { 
      title: "Active Projects", 
      value: ops.activeProjects || 0, 
      icon: Briefcase, 
      color: "text-primary", 
      sub: `${ops.delayedProjects || 0} Delayed`,
      link: "/projects"
    },
    { 
      title: "Net Profit", 
      value: `₹${(finance.profit || 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: (finance.profit || 0) >= 0 ? "text-success" : "text-danger", 
      sub: `Invoiced ₹${(finance.revenue || 0).toLocaleString()}`,
      link: "/finance"
    },
  ];

  return (
    <div className="space-y-6 p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Management Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Real-time business performance aggregated across CRM, Finance, Operations, and Recurring Assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/dashboard/ceo-view" className="flex items-center px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-md shadow-sm hover:bg-primary/90 transition-colors">
            <ShieldAlert className="mr-1.5 h-4 w-4" /> CEO Morning View
          </Link>
          <Link to="/clients" className="flex items-center px-3 py-2 bg-surface border border-border text-text text-xs font-semibold rounded-md hover:bg-background transition-colors">
            <Users className="mr-1.5 h-3.5 w-3.5" /> Client Directory
          </Link>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <span className="text-xs font-semibold text-text uppercase tracking-wider">Quick Actions:</span>
        <div className="flex flex-wrap gap-2">
          <Link to="/clients" className="flex items-center px-2.5 py-1.5 bg-background border border-border rounded text-xs font-medium text-text hover:border-primary hover:text-primary transition-colors">
            <Plus className="mr-1 h-3.5 w-3.5 text-primary" /> New Client
          </Link>
          <Link to="/crm/leads" className="flex items-center px-2.5 py-1.5 bg-background border border-border rounded text-xs font-medium text-text hover:border-primary hover:text-primary transition-colors">
            <Plus className="mr-1 h-3.5 w-3.5 text-primary" /> New Lead
          </Link>
          <Link to="/sales/quotations" className="flex items-center px-2.5 py-1.5 bg-background border border-border rounded text-xs font-medium text-text hover:border-primary hover:text-primary transition-colors">
            <Plus className="mr-1 h-3.5 w-3.5 text-primary" /> Create Quotation
          </Link>
          <Link to="/finance/invoices" className="flex items-center px-2.5 py-1.5 bg-background border border-border rounded text-xs font-medium text-text hover:border-primary hover:text-primary transition-colors">
            <Receipt className="mr-1 h-3.5 w-3.5 text-primary" /> New Invoice
          </Link>
          <Link to="/support/tickets" className="flex items-center px-2.5 py-1.5 bg-background border border-border rounded text-xs font-medium text-text hover:border-primary hover:text-primary transition-colors">
            <Headset className="mr-1 h-3.5 w-3.5 text-primary" /> Open Ticket
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <Link key={idx} to={kpi.link} className="block transition-transform hover:-translate-y-0.5">
            <Card className="h-full hover:border-primary/50 transition-colors shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-text font-mono">{kpi.value}</div>
                <p className="text-xs text-text-muted mt-1 font-medium">{kpi.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Two Column Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Financial Breakdown */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Financial Overview & Net Margins</CardTitle>
            <Link to="/finance" className="text-xs text-primary font-semibold hover:underline">Open Finance Hub &rarr;</Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-background rounded-xl border border-border">
                <p className="text-xs text-text-muted font-medium">Invoiced Revenue</p>
                <p className="text-lg font-bold text-text font-mono mt-1">₹{(finance.revenue || 0).toLocaleString()}</p>
                <span className="text-[10px] text-text-muted">Total billings issued</span>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border">
                <p className="text-xs text-text-muted font-medium">Operating Expenses</p>
                <p className="text-lg font-bold text-danger font-mono mt-1">₹{(finance.expenses || 0).toLocaleString()}</p>
                <span className="text-[10px] text-text-muted">Direct costs & overhead</span>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border">
                <p className="text-xs text-text-muted font-medium">Net Operating Profit</p>
                <p className="text-lg font-bold text-success font-mono mt-1">₹{(finance.profit || 0).toLocaleString()}</p>
                <span className="text-[10px] text-text-muted">Cash collected - expenses</span>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-lg border border-border flex justify-between items-center text-xs">
              <span className="text-text-muted">Total Accounts Receivable Pending Collection:</span>
              <span className="font-bold text-danger font-mono text-sm">₹{(finance.outstanding || 0).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Operations & Urgent Care */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operations & Recurring Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <Link to="/support/tickets" className="flex justify-between items-center p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors">
              <span className="font-medium text-text flex items-center">
                <Headset className="h-4 w-4 mr-2 text-primary" /> Open Support Tickets:
              </span>
              <span className="font-bold font-mono text-warning text-sm">{ops.openTickets || 0}</span>
            </Link>

            <Link to="/domains" className="flex justify-between items-center p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors">
              <span className="font-medium text-text flex items-center">
                <Globe className="h-4 w-4 mr-2 text-primary" /> Expiring Domains (30d):
              </span>
              <span className="font-bold font-mono text-danger text-sm">{recurring.expiringDomains || 0}</span>
            </Link>

            <Link to="/projects" className="flex justify-between items-center p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors">
              <span className="font-medium text-text flex items-center">
                <FolderKanban className="h-4 w-4 mr-2 text-primary" /> Delayed Milestones:
              </span>
              <span className="font-bold font-mono text-danger text-sm">{ops.delayedProjects || 0}</span>
            </Link>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
