import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Users, DollarSign, Briefcase, Activity, TrendingUp, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { Link } from 'react-router-dom';

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
    { title: "New / Qualified Leads", value: `${sales.newLeads || 0} / ${sales.qualifiedLeads || 0}`, icon: Users, color: "text-primary", sub: `${sales.wonLeads || 0} Leads Converted` },
    { title: "Total Revenue Collected", value: `₹${(finance.collected || 0).toLocaleString()}`, icon: DollarSign, color: "text-success", sub: `₹${(finance.outstanding || 0).toLocaleString()} Outstanding` },
    { title: "Active Projects", value: ops.activeProjects || 0, icon: Briefcase, color: "text-primary", sub: `${ops.delayedProjects || 0} Delayed` },
    { title: "Net Profit", value: `₹${(finance.profit || 0).toLocaleString()}`, icon: TrendingUp, color: finance.profit >= 0 ? "text-success" : "text-danger", sub: `Revenue - Expenses` },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Management Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">Real-time enterprise overview aggregated across all company departments.</p>
        </div>

        <div className="flex space-x-3">
          <Link to="/dashboard/ceo-view" className="flex items-center px-4 py-2 bg-primary text-white text-xs font-semibold rounded-md shadow hover:bg-primary/90 transition-colors">
            <ShieldAlert className="mr-2 h-4 w-4" /> CEO Morning View
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-text-muted uppercase">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-text">{kpi.value}</div>
              <p className="text-xs text-text-muted mt-1 font-medium">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-surface rounded-lg border border-border">
                <p className="text-xs text-text-muted font-medium">Invoiced Revenue</p>
                <p className="text-lg font-bold text-text">₹{(finance.revenue || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-border">
                <p className="text-xs text-text-muted font-medium">Operating Expenses</p>
                <p className="text-lg font-bold text-danger">₹{(finance.expenses || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-border">
                <p className="text-xs text-text-muted font-medium">Net Profit</p>
                <p className="text-lg font-bold text-success">₹{(finance.profit || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operations & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-surface rounded border border-border">
              <span className="font-semibold text-text">Open Support Tickets:</span>
              <span className="font-bold text-warning">{ops.openTickets || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface rounded border border-border">
              <span className="font-semibold text-text">Expiring Domains (30 days):</span>
              <span className="font-bold text-danger">{recurring.expiringDomains || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
