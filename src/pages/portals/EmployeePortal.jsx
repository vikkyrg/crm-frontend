import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function EmployeePortal() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text">Employee Dashboard</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>My Tasks</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-text">5</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Attendance</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-success">Present</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending Approvals</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-text">2</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
