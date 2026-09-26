import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export default function Calendar() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Calendar</h1>
        <p className="text-sm text-text-muted mt-1">Unified view of meetings, deadlines, and renewals.</p>
      </div>

      <Card className="flex-1 min-h-[500px] flex items-center justify-center">
        <CardContent className="text-center text-text-muted">
           <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
           <p>Calendar View Integration Placeholder</p>
           <p className="text-xs">Fullcalendar.io or react-big-calendar to be integrated here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
