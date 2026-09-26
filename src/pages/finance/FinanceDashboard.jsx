import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { DollarSign, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';

const financeKpis = [
  { title: "Total Revenue", value: "$452,310", trend: "+12.5%", icon: DollarSign, color: "text-success" },
  { title: "Collections (MTD)", value: "$85,000", trend: "+5.2%", icon: TrendingUp, color: "text-info" },
  { title: "Receivables", value: "$124,500", trend: "-2.4%", icon: AlertCircle, color: "text-warning" },
  { title: "Net Profit", value: "$112,000", trend: "+18%", icon: ArrowUpRight, color: "text-primary" },
];

export default function FinanceDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text">Finance Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {financeKpis.map((kpi, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text">{kpi.value}</div>
              <p className="text-xs text-text-muted mt-1">
                <span className={kpi.trend.startsWith('+') ? 'text-success' : 'text-danger'}>
                  {kpi.trend}
                </span> vs last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-text-muted border-t border-border">
            [Chart Placeholder - Recharts]
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Receivables Aging</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-text-muted border-t border-border">
            [Chart Placeholder - Recharts]
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
