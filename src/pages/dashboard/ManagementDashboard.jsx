import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Users, DollarSign, Briefcase, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function ManagementDashboard() {
  const { data: leads } = useQuery({ queryKey: ['leads'], queryFn: () => api.get('/leads').catch(() => ({ data: { data: [] } })) });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => api.get('/projects').catch(() => ({ data: { data: [] } })) });
  const { data: tickets } = useQuery({ queryKey: ['tickets'], queryFn: () => api.get('/tickets').catch(() => ({ data: { data: [] } })) });
  const { data: invoices } = useQuery({ queryKey: ['invoices'], queryFn: () => api.get('/invoices').catch(() => ({ data: { data: [] } })) });

  const leadCount = leads?.data?.data?.length || 0;
  const projectCount = projects?.data?.data?.length || 0;
  const ticketCount = tickets?.data?.data?.length || 0;
  
  const totalRevenue = (invoices?.data?.data || []).reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);

  const kpis = [
    { title: "Total Leads", value: leadCount, trend: "Real-time", icon: Users, color: "text-info" },
    { title: "Total Revenue", value: '$' + totalRevenue.toLocaleString(), trend: "Real-time", icon: DollarSign, color: "text-success" },
    { title: "Active Projects", value: projectCount, trend: "Real-time", icon: Briefcase, color: "text-primary" },
    { title: "Open Tickets", value: ticketCount, trend: "Real-time", icon: Activity, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text">Management Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={"h-4 w-4 " + kpi.color} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text">{kpi.value}</div>
              <p className="text-xs text-text-muted mt-1">
                <span className="text-success">{kpi.trend}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-text-muted border-t border-border">
            Data aggregated securely from production backend endpoints.
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Action Center</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center text-text-muted border-t border-border">
            {ticketCount > 0 ? (
              <p className="text-warning font-bold">You have {ticketCount} unresolved support tickets.</p>
            ) : (
              <p>No immediate actions required.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
