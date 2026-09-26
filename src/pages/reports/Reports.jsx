import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Reports & Analytics</h1>
          <p className="text-sm text-text-muted mt-1">Generate and export system reports.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sales Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between">Lead Conversion <Download className="h-4 w-4" /></Button>
            <Button variant="outline" className="w-full justify-between">Sales Pipeline <Download className="h-4 w-4" /></Button>
            <Button variant="outline" className="w-full justify-between">Lost Leads Analysis <Download className="h-4 w-4" /></Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Finance Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between">Revenue summary <Download className="h-4 w-4" /></Button>
            <Button variant="outline" className="w-full justify-between">Receivables Aging <Download className="h-4 w-4" /></Button>
            <Button variant="outline" className="w-full justify-between">Project Profitability <Download className="h-4 w-4" /></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operations Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between">SLA Performance <Download className="h-4 w-4" /></Button>
            <Button variant="outline" className="w-full justify-between">Employee Workload <Download className="h-4 w-4" /></Button>
            <Button variant="outline" className="w-full justify-between">Delayed Projects <Download className="h-4 w-4" /></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
