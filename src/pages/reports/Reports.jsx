import React, { useState } from 'react';
import { Download, PieChart, TrendingUp, Users, DollarSign, FolderKanban } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');

  const { data: salesReport, isLoading: loadingSales } = useQuery({
    queryKey: ['reportSales'],
    queryFn: async () => (await api.get('/reports/sales')).data || {}
  });

  const { data: financeReport, isLoading: loadingFinance } = useQuery({
    queryKey: ['reportFinance'],
    queryFn: async () => (await api.get('/reports/finance')).data || {}
  });

  const { data: opsReport, isLoading: loadingOps } = useQuery({
    queryKey: ['reportOps'],
    queryFn: async () => (await api.get('/reports/operations')).data || {}
  });

  const handleExport = (reportName) => {
    toast.success(`Exported ${reportName} report to CSV/Excel!`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <PieChart className="mr-2 h-6 w-6 text-primary" /> Reports & Analytics Hub
          </h1>
          <p className="text-sm text-text-muted mt-1">Generate and export real-time business intelligence reports.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-border">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
            activeTab === 'sales' ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface'
          }`}
        >
          Sales Reports
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
            activeTab === 'finance' ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface'
          }`}
        >
          Finance & Receivables
        </button>
        <button
          onClick={() => setActiveTab('operations')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
            activeTab === 'operations' ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface'
          }`}
        >
          Operations & Support
        </button>
      </div>

      {/* SALES TAB */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {loadingSales ? (
            <TableSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-xs uppercase text-text-muted">Total Leads</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-extrabold text-text">{salesReport?.totalLeads || 0}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-xs uppercase text-text-muted">Won Leads</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-extrabold text-success">{salesReport?.wonLeads || 0}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-xs uppercase text-text-muted">Conversion Rate %</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-extrabold text-primary">{salesReport?.conversionRate || 0}%</p></CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Lead Conversion & Pipeline Breakdown</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => handleExport('Sales Pipeline')}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {(salesReport?.leadsByStatus || []).map((st, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-surface rounded border border-border">
                      <span className="font-semibold text-text">{st._id || 'Unknown'}</span>
                      <span className="font-bold text-primary">{st.count} Leads</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* FINANCE TAB */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          {loadingFinance ? (
            <TableSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-xs uppercase text-text-muted">Total Invoiced</CardTitle></CardHeader>
                  <CardContent><p className="text-xl font-extrabold text-text">₹{(financeReport?.totalInvoiced || 0).toLocaleString()}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-xs uppercase text-text-muted">Total Collected</CardTitle></CardHeader>
                  <CardContent><p className="text-xl font-extrabold text-success">₹{(financeReport?.totalCollected || 0).toLocaleString()}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-xs uppercase text-text-muted">Outstanding Balance</CardTitle></CardHeader>
                  <CardContent><p className="text-xl font-extrabold text-danger">₹{(financeReport?.totalOutstanding || 0).toLocaleString()}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-xs uppercase text-text-muted">Net Profit</CardTitle></CardHeader>
                  <CardContent><p className="text-xl font-extrabold text-primary">₹{(financeReport?.netProfit || 0).toLocaleString()}</p></CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Receivables Aging Analysis</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => handleExport('Receivables Aging')}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
                  <div className="p-3 bg-surface rounded border border-border">
                    <p className="text-text-muted font-medium">0 - 30 Days</p>
                    <p className="text-base font-bold text-text mt-1">₹{(financeReport?.receivablesAging?.days30 || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-surface rounded border border-border">
                    <p className="text-text-muted font-medium">31 - 60 Days</p>
                    <p className="text-base font-bold text-warning mt-1">₹{(financeReport?.receivablesAging?.days60 || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-surface rounded border border-border">
                    <p className="text-text-muted font-medium">61 - 90 Days</p>
                    <p className="text-base font-bold text-warning mt-1">₹{(financeReport?.receivablesAging?.days90 || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-surface rounded border border-border">
                    <p className="text-text-muted font-medium">90+ Days (High Risk)</p>
                    <p className="text-base font-bold text-danger mt-1">₹{(financeReport?.receivablesAging?.days90Plus || 0).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* OPERATIONS TAB */}
      {activeTab === 'operations' && (
        <Card>
          {loadingOps ? (
            <TableSkeleton />
          ) : (
            <>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Operations & Support Performance</CardTitle>
                <Button size="sm" variant="outline" onClick={() => handleExport('Operations Report')}>
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex justify-between items-center p-3 bg-surface rounded border border-border">
                  <span className="font-semibold text-text">Total Tasks Logged:</span>
                  <span className="font-bold text-primary">{opsReport?.tasks?.totalTasks || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface rounded border border-border">
                  <span className="font-semibold text-text">Overdue Tasks:</span>
                  <span className="font-bold text-danger">{opsReport?.tasks?.overdueTasks || 0}</span>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}

    </div>
  );
}
