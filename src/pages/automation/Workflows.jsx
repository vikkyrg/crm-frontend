import React, { useState } from 'react';
import { Settings2, UploadCloud, Bot, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { toast } from 'sonner';

export default function Workflows() {
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleBulkImport = async () => {
    try {
      setIsImporting(true);
      const records = JSON.parse(importText);
      const res = await api.post('/migration/import-websites', { records });
      toast.success(res.message || 'Legacy websites imported!');
      setImportText('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'JSON parse or import error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
          <Bot className="mr-2 h-6 w-6 text-primary" /> Workflow Automation Engine
        </h1>
        <p className="text-sm text-text-muted mt-1">Configurable trigger-condition-action business automation rules.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base"><Settings2 className="mr-2 h-5 w-5"/> Active Automation Triggers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
           <div className="p-4 border border-border rounded-lg bg-background flex justify-between items-center">
              <div>
                <p className="font-bold text-text">Overdue Invoice Escalation</p>
                <p className="text-text-muted">Trigger: Invoice past due date by 7 days → Action: Email client & Action Center Alert</p>
              </div>
              <span className="px-2.5 py-1 font-bold bg-success/20 text-success rounded-full">Active</span>
           </div>
           
           <div className="p-4 border border-border rounded-lg bg-background flex justify-between items-center">
              <div>
                <p className="font-bold text-text">Domain Expiry Reminder Engine</p>
                <p className="text-text-muted">Trigger: Domain expires in 90, 60, 30, 15, 7 days → Action: Automatic notification</p>
              </div>
              <span className="px-2.5 py-1 font-bold bg-success/20 text-success rounded-full">Active</span>
           </div>

           <div className="p-4 border border-border rounded-lg bg-background flex justify-between items-center">
              <div>
                <p className="font-bold text-text">Lead Conversion Onboarding Workflow</p>
                <p className="text-text-muted">Trigger: Lead Status changed to Won → Action: Create Client, Primary Contact & Onboarding Checklist</p>
              </div>
              <span className="px-2.5 py-1 font-bold bg-success/20 text-success rounded-full">Active</span>
           </div>
        </CardContent>
      </Card>

      {/* DATA MIGRATION SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base"><UploadCloud className="mr-2 h-5 w-5"/> Legacy Data Migration (200+ Websites Import)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <p className="text-text-muted">
            Paste JSON array of existing legacy websites/clients to import into MongoDB Atlas:
          </p>
          <textarea
            rows={5}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={`[
  { "companyName": "Innomatrics Tech", "domainName": "innomatrics.com", "websiteType": "Corporate" }
]`}
            className="w-full bg-background border border-border rounded-lg p-3 font-mono text-text focus:outline-none focus:border-primary"
          />

          <Button onClick={handleBulkImport} isLoading={isImporting}>
            <UploadCloud className="mr-2 h-4 w-4" /> Run Bulk Data Import
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
