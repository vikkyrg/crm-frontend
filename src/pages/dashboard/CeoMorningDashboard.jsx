import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { AlertTriangle, Clock, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CeoMorningDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ceoView'],
    queryFn: async () => {
      const res = await api.get('/dashboard/ceo-view');
      return res.data || {};
    }
  });

  if (isLoading) return <div className="p-6"><TableSkeleton /></div>;
  if (isError) return <div className="p-6"><ErrorState title="Failed to load CEO Morning Dashboard" onRetry={refetch} /></div>;

  const needs = data.needsAttention || {};

  return (
    <div className="space-y-6 p-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-text flex items-center">
          <ShieldAlert className="mr-3 h-8 w-8 text-primary" /> CEO Morning Dashboard
        </h1>
        <p className="text-sm text-text-muted mt-1">
          High-priority executive overview: What needs attention and what's coming up today.
        </p>
      </div>

      {/* NEEDS ATTENTION SECTION */}
      <div>
        <h2 className="text-xl font-bold text-danger mb-4 flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" /> NEEDS ATTENTION (IMMEDIATE ACTION REQUIRED)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Overdue Payments */}
          <Card className="border-danger/30 bg-danger/5">
            <CardHeader>
              <CardTitle className="text-base text-danger flex items-center justify-between">
                <span>Overdue Invoices</span>
                <span className="bg-danger text-white text-xs px-2 py-0.5 rounded-full">{needs.overdueInvoices?.length || 0}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {needs.overdueInvoices?.length === 0 && <p className="text-xs text-text-muted">No overdue invoices!</p>}
              {needs.overdueInvoices?.map((inv) => (
                <div key={inv._id} className="flex justify-between items-center text-xs p-2 bg-surface rounded border border-border">
                  <div>
                    <p className="font-semibold text-text">{inv.clientId?.companyName || 'Client'}</p>
                    <p className="text-text-muted">#{inv.invoiceNumber}</p>
                  </div>
                  <span className="font-bold text-danger">₹{inv.balance}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Domain Renewals Due */}
          <Card className={`border-${needs.domainRenewals?.critical?.length > 0 || needs.domainRenewals?.expired?.length > 0 ? 'danger' : 'warning'}/30 bg-${needs.domainRenewals?.critical?.length > 0 || needs.domainRenewals?.expired?.length > 0 ? 'danger' : 'warning'}/5`}>
            <CardHeader>
              <CardTitle className={`text-base text-${needs.domainRenewals?.critical?.length > 0 || needs.domainRenewals?.expired?.length > 0 ? 'danger' : 'warning'} flex items-center justify-between`}>
                <span>Domain Renewals Due</span>
                <span className={`bg-${needs.domainRenewals?.critical?.length > 0 || needs.domainRenewals?.expired?.length > 0 ? 'danger' : 'warning'} text-white text-xs px-2 py-0.5 rounded-full`}>
                  {needs.domainRenewals?.totalDue || 0}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {needs.domainRenewals?.totalDue === 0 && (
                <p className="text-xs text-text-muted">No domains require renewal within 30 days.</p>
              )}

              {/* Expired */}
              {needs.domainRenewals?.expired?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-danger mb-2">🔴 {needs.domainRenewals.expired.length} Expired</h4>
                  {needs.domainRenewals.expired.map(d => (
                    <div key={d._id} className="flex flex-col text-xs p-2 bg-surface rounded border border-danger/30 mb-2">
                      <Link to={`/domains?search=${d.domainName}`} className="font-semibold text-text hover:underline cursor-pointer">{d.domainName}</Link>
                      <span className="text-text-muted">Expired on: {new Date(d.expiryDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Critical */}
              {needs.domainRenewals?.critical?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-warning mb-2">🟠 {needs.domainRenewals.critical.length} Expiring Within 7 Days</h4>
                  {needs.domainRenewals.critical.map(d => (
                    <div key={d._id} className="flex flex-col text-xs p-2 bg-surface rounded border border-warning/30 mb-2">
                      <Link to={`/domains?search=${d.domainName}`} className="font-semibold text-text hover:underline cursor-pointer">{d.domainName}</Link>
                      <span className="text-warning">Expires on: {new Date(d.expiryDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warning */}
              {needs.domainRenewals?.warning?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-primary mb-2">🟡 {needs.domainRenewals.warning.length} Expiring Within 30 Days</h4>
                  {needs.domainRenewals.warning.map(d => (
                    <div key={d._id} className="flex flex-col text-xs p-2 bg-surface rounded border border-border mb-2">
                      <Link to={`/domains?search=${d.domainName}`} className="font-semibold text-text hover:underline cursor-pointer">{d.domainName}</Link>
                      <span className="text-text-muted">Expires on: {new Date(d.expiryDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delayed Projects */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base text-primary flex items-center justify-between">
                <span>Delayed Projects</span>
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{needs.delayedProjects?.length || 0}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {needs.delayedProjects?.length === 0 && <p className="text-xs text-text-muted">All projects on schedule!</p>}
              {needs.delayedProjects?.map((p) => (
                <div key={p._id} className="flex justify-between items-center text-xs p-2 bg-surface rounded border border-border">
                  <span className="font-semibold text-text">{p.projectName}</span>
                  <span className="text-xs text-primary font-medium">{p.clientId?.companyName}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-text flex items-center justify-between">
                <span>Pending Approvals</span>
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{needs.pendingApprovals?.length || 0}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {needs.pendingApprovals?.length === 0 && <p className="text-xs text-text-muted">No pending approvals.</p>}
              {needs.pendingApprovals?.map((a) => (
                <div key={a._id} className="flex justify-between items-center text-xs p-2 bg-surface rounded border border-border">
                  <div>
                    <p className="font-semibold text-text">{a.module}</p>
                    <p className="text-text-muted">By: {a.requestedBy?.name || 'Staff'}</p>
                  </div>
                  <span className="font-bold text-primary">₹{a.amount || 0}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Urgent Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-text flex items-center justify-between">
                <span>Urgent Support Tickets</span>
                <span className="bg-danger text-white text-xs px-2 py-0.5 rounded-full">{needs.urgentTickets?.length || 0}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {needs.urgentTickets?.length === 0 && <p className="text-xs text-text-muted">No urgent tickets.</p>}
              {needs.urgentTickets?.map((t) => (
                <div key={t._id} className="flex justify-between items-center text-xs p-2 bg-surface rounded border border-border">
                  <span className="font-semibold text-text">{t.subject}</span>
                  <span className="text-xs text-danger font-medium">{t.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Due Follow-ups */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-text flex items-center justify-between">
                <span>Due Follow-ups</span>
                <span className="bg-success text-white text-xs px-2 py-0.5 rounded-full">{needs.dueFollowups?.length || 0}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {needs.dueFollowups?.length === 0 && <p className="text-xs text-text-muted">No follow-ups due today.</p>}
              {needs.dueFollowups?.map((f) => (
                <div key={f._id} className="flex justify-between items-center text-xs p-2 bg-surface rounded border border-border">
                  <span className="font-semibold text-text">{f.leadId?.companyName || 'Lead'}</span>
                  <span className="text-xs text-text-muted">{new Date(f.followUpDate).toLocaleDateString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
}
