import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  Receipt, 
  CreditCard,
  Building,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';

export default function FinanceDashboard() {
  const { data: metricsData, isLoading: loadingMetrics, isError: errorMetrics, refetch } = useQuery({
    queryKey: ['managementMetrics'],
    queryFn: async () => {
      const res = await api.get('/dashboard/metrics');
      return res.data || {};
    }
  });

  const { data: invoicesData, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/invoices?limit=100');
      return res.data || [];
    }
  });

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await api.get('/payments?limit=100');
      return res.data || [];
    }
  });

  const { data: expensesData, isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await api.get('/expenses?limit=100');
      return res.data || [];
    }
  });

  if (loadingMetrics || loadingInvoices) return <div className="p-6"><TableSkeleton /></div>;
  if (errorMetrics) return <div className="p-6"><ErrorState title="Failed to load Finance Dashboard" onRetry={refetch} /></div>;

  const finance = metricsData.finance || {};
  const invoices = invoicesData?.data || invoicesData || [];
  const payments = paymentsData?.data || paymentsData || [];
  const expenses = expensesData?.data || expensesData || [];

  const totalInvoiced = finance.revenue || 0;
  const totalCollected = finance.collected || 0;
  const collectedToday = finance.collectedToday || 0;
  const collectedThisMonth = finance.collectedThisMonth || 0;
  const totalReceivables = finance.outstanding || 0;
  const totalExpensesCost = finance.expenses || 0;
  const netProfit = finance.profit || (totalCollected - totalExpensesCost);

  const financeKpis = [
    { 
      title: "Total Invoiced Revenue", 
      value: `₹${totalInvoiced.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-primary",
      sub: `${invoices.length} Invoices Issued`
    },
    { 
      title: "Cash Collected", 
      value: `₹${totalCollected.toLocaleString()}`, 
      icon: TrendingUp, 
      color: "text-success",
      sub: `Today: ₹${collectedToday.toLocaleString()} | Month: ₹${collectedThisMonth.toLocaleString()}`
    },
    { 
      title: "Accounts Receivable", 
      value: `₹${totalReceivables.toLocaleString()}`, 
      icon: AlertCircle, 
      color: "text-warning",
      sub: "Pending Collection"
    },
    { 
      title: "Net Operating Profit", 
      value: `₹${netProfit.toLocaleString()}`, 
      icon: ArrowUpRight, 
      color: netProfit >= 0 ? "text-success" : "text-danger",
      sub: `Collected - Operating Costs`
    },
  ];

  // Prepare monthly aggregate chart data from real records
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  
  // Last 6 months dataset
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(currentMonthIdx - i);
    const mName = monthNames[d.getMonth()];
    const yr = d.getFullYear();

    const mInvoiced = invoices
      .filter(inv => {
        const dt = new Date(inv.createdAt);
        return dt.getMonth() === d.getMonth() && dt.getFullYear() === yr;
      })
      .reduce((s, it) => s + (it.totalAmount || 0), 0);

    const mCollected = payments
      .filter(p => {
        const dt = new Date(p.paymentDate || p.createdAt);
        return dt.getMonth() === d.getMonth() && dt.getFullYear() === yr;
      })
      .reduce((s, it) => s + (it.amount || 0), 0);

    const mExpenses = expenses
      .filter(e => {
        const dt = new Date(e.expenseDate || e.createdAt);
        return dt.getMonth() === d.getMonth() && dt.getFullYear() === yr;
      })
      .reduce((s, it) => s + (it.amount || 0), 0);

    chartData.push({
      month: mName,
      invoiced: mInvoiced,
      collected: mCollected,
      expenses: mExpenses
    });
  }

  // Receivables breakdown by aging / status
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
  const partiallyPaidInvoices = invoices.filter(i => i.status === 'Partially Paid');
  const unpaidInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Draft');

  const agingData = [
    { name: 'Fully Unpaid', value: unpaidInvoices.reduce((s, i) => s + (i.balance || 0), 0) },
    { name: 'Partially Paid', value: partiallyPaidInvoices.reduce((s, i) => s + (i.balance || 0), 0) },
    { name: 'Overdue', value: overdueInvoices.reduce((s, i) => s + (i.balance || 0), 0) }
  ];

  return (
    <div className="space-y-6 p-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <TrendingUp className="mr-2 h-6 w-6 text-primary" /> Finance Hub & Cashflow Analytics
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Real-time financial performance, collections, accounts receivable, and net margins.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link to="/finance/invoices" className="px-3 py-2 bg-primary text-white text-xs font-semibold rounded-md shadow-sm hover:bg-primary/90 transition-colors">
            <Receipt className="inline mr-1.5 h-3.5 w-3.5" /> Invoices
          </Link>
          <Link to="/finance/payments" className="px-3 py-2 bg-surface border border-border text-text text-xs font-semibold rounded-md hover:bg-background transition-colors">
            <CreditCard className="inline mr-1.5 h-3.5 w-3.5" /> Payments
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {financeKpis.map((kpi, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-text-muted uppercase">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-text font-mono">{kpi.value}</div>
              <p className="text-xs text-text-muted mt-1 font-medium">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Revenue vs Expenses Recharts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Revenue vs Operating Expenses</span>
              <span className="text-xs text-text-muted font-normal">Last 6 Months (₹)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: 'var(--color-surface, #fff)', borderColor: 'var(--color-border, #ccc)', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="collected" name="Cash Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Collections Trend Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Cash Flow Trend</span>
              <span className="text-xs text-text-muted font-normal">Invoiced vs Collected</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorColl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: 'var(--color-surface, #fff)', borderColor: 'var(--color-border, #ccc)', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="invoiced" name="Invoiced" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInv)" />
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#10b981" fillOpacity={1} fill="url(#colorColl)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Receivables Aging Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receivables Aging & Collections Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agingData.map((ag, i) => (
              <div key={i} className="p-4 bg-background rounded-xl border border-border text-center">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">{ag.name}</span>
                <span className="text-xl font-bold font-mono text-text mt-1 block">₹{ag.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
