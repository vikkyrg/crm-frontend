import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage system configurations and roles.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-sm text-text-muted">Configure your company name, GST, and branch details here.</p>
             <button className="text-sm text-primary font-medium hover:underline">Edit Company Profile</button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-sm text-text-muted">Manage RBAC matrices and user access levels.</p>
             <button className="text-sm text-primary font-medium hover:underline">Configure Roles</button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
