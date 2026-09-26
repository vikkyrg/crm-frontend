import React from 'react';
import { Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function Workflows() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Automation Workflows</h1>
        <p className="text-sm text-text-muted mt-1">Visual builder for business rules and triggers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5"/> Active Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="p-4 border border-border rounded-md bg-background flex justify-between items-center">
              <div>
                <p className="font-medium text-text">Overdue Invoice Escalation</p>
                <p className="text-xs text-text-muted">Trigger: Invoice past due date by 7 days → Action: Email client & alert Account Manager</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium bg-success/10 text-success rounded-full">Active</span>
           </div>
           
           <div className="p-4 border border-border rounded-md bg-background flex justify-between items-center">
              <div>
                <p className="font-medium text-text">Domain Renewal Reminder</p>
                <p className="text-xs text-text-muted">Trigger: Domain expires in 30 days → Action: Send reminder to client</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium bg-success/10 text-success rounded-full">Active</span>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
