import React from 'react';
import { AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function ActionCenter() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Action Center</h1>
        <p className="text-sm text-text-muted mt-1">Centralized hub for all pending business actions requiring your attention.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-danger/50">
          <CardHeader className="bg-danger/5 pb-4">
            <CardTitle className="text-danger flex items-center"><AlertCircle className="mr-2 h-5 w-5" /> Critical</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
             <div className="border-l-2 border-danger pl-3">
               <p className="text-sm font-medium">Domain stark.com expiring tomorrow</p>
               <p className="text-xs text-text-muted">Requires immediate renewal.</p>
             </div>
             <div className="border-l-2 border-danger pl-3">
               <p className="text-sm font-medium">Invoice #INV-2023-003 Overdue by 30 days</p>
               <p className="text-xs text-text-muted">Client: Oscorp</p>
             </div>
          </CardContent>
        </Card>

        <Card className="border-warning/50">
          <CardHeader className="bg-warning/5 pb-4">
            <CardTitle className="text-warning flex items-center"><Clock className="mr-2 h-5 w-5" /> Due Soon</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
             <div className="border-l-2 border-warning pl-3">
               <p className="text-sm font-medium">SLA Risk: Ticket #TKT-0102</p>
               <p className="text-xs text-text-muted">Due in 2 hours.</p>
             </div>
          </CardContent>
        </Card>
        
        <Card className="border-info/50">
          <CardHeader className="bg-info/5 pb-4">
            <CardTitle className="text-info flex items-center"><ShieldAlert className="mr-2 h-5 w-5" /> Approvals</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
             <div className="border-l-2 border-info pl-3">
               <p className="text-sm font-medium">Quotation #QUO-004 needs approval</p>
               <p className="text-xs text-text-muted">Value: $150,000</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
