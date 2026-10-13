import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter,
  Layers,
  Wrench,
  Receipt,
  PhoneCall
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState('All');

  // Load active events from across CRM modules: Tasks, Follow-ups, AMCs, Invoices
  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ['calendarTasks'],
    queryFn: async () => {
      try {
        const res = await api.get('/tasks?limit=150');
        return res.data || [];
      } catch (e) {
        return [];
      }
    }
  });

  const { data: followupsData, isLoading: loadingFollowups } = useQuery({
    queryKey: ['calendarFollowups'],
    queryFn: async () => {
      try {
        const res = await api.get('/followups?limit=150');
        return res.data || [];
      } catch (e) {
        return [];
      }
    }
  });

  const { data: amcsData, isLoading: loadingAmcs } = useQuery({
    queryKey: ['calendarAmcs'],
    queryFn: async () => {
      try {
        const res = await api.get('/amc');
        return res.data || [];
      } catch (e) {
        return [];
      }
    }
  });

  const { data: invoicesData, isLoading: loadingInvoices } = useQuery({
    queryKey: ['calendarInvoices'],
    queryFn: async () => {
      try {
        const res = await api.get('/invoices?limit=100');
        return res.data || [];
      } catch (e) {
        return [];
      }
    }
  });

  const tasks = Array.isArray(tasksData) ? tasksData : (tasksData?.data || []);
  const followups = Array.isArray(followupsData) ? followupsData : (followupsData?.data || []);
  const amcs = Array.isArray(amcsData) ? amcsData : (amcsData?.data || []);
  const invoices = Array.isArray(invoicesData) ? invoicesData : (invoicesData?.data || []);

  // Consolidate into standardized event items
  const allEvents = [
    ...tasks.filter(t => t.dueDate).map(t => ({
      id: `task-${t._id}`,
      title: t.taskName || t.title || 'Project Task',
      date: new Date(t.dueDate),
      type: 'Task',
      badgeClass: 'bg-primary/10 text-primary border-primary/20',
      icon: Layers,
      meta: t.status || 'Pending'
    })),
    ...followups.filter(f => f.scheduledAt || f.followupDate || f.date).map(f => ({
      id: `fup-${f._id}`,
      title: f.title || f.notes || 'Lead Follow-up',
      date: new Date(f.scheduledAt || f.followupDate || f.date),
      type: 'Follow-up',
      badgeClass: 'bg-warning/10 text-warning border-warning/20',
      icon: PhoneCall,
      meta: f.type || 'Call'
    })),
    ...amcs.filter(a => a.endDate || a.expiryDate).map(a => ({
      id: `amc-${a._id}`,
      title: `AMC Expiry: ${a.title || a.serviceName || 'Maintenance'}`,
      date: new Date(a.endDate || a.expiryDate),
      type: 'AMC Renewal',
      badgeClass: 'bg-danger/10 text-danger border-danger/20',
      icon: Wrench,
      meta: a.clientId?.companyName || 'Contract'
    })),
    ...invoices.filter(i => i.dueDate && i.balance > 0).map(i => ({
      id: `inv-${i._id}`,
      title: `Due: Invoice #${i.invoiceNumber}`,
      date: new Date(i.dueDate),
      type: 'Invoice Due',
      badgeClass: 'bg-success/10 text-success border-success/20',
      icon: Receipt,
      meta: `₹${(i.balance || 0).toLocaleString()}`
    }))
  ];

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Filter events
  const filteredEvents = selectedType === 'All' 
    ? allEvents 
    : allEvents.filter(e => e.type === selectedType);

  // Group events by day in current month
  const getEventsForDay = (day) => {
    return filteredEvents.filter(e => {
      const d = e.date;
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  // Build grid calendar cells
  const calendarCells = [];

  // Previous month trailing days
  for (let x = firstDayIndex; x > 0; x--) {
    calendarCells.push({
      day: prevMonthLastDate - x + 1,
      isCurrentMonth: false,
      events: []
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      events: getEventsForDay(i)
    });
  }

  // Next month leading days to complete 35 or 42 grid
  const remainingCells = 35 - calendarCells.length;
  const nextMonthFill = remainingCells >= 0 ? remainingCells : (42 - calendarCells.length);
  for (let j = 1; j <= nextMonthFill; j++) {
    calendarCells.push({
      day: j,
      isCurrentMonth: false,
      events: []
    });
  }

  const isLoading = loadingTasks || loadingFollowups || loadingAmcs || loadingInvoices;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <CalendarIcon className="mr-2.5 h-6 w-6 text-primary" /> Operational Calendar
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time schedule of project deadlines, lead follow-ups, AMC renewals, and invoice due dates.
          </p>
        </div>

        {/* Month Navigation & Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>Today</Button>
          <div className="flex items-center bg-surface border border-border rounded-lg p-0.5">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-background rounded text-text-muted hover:text-text transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 font-semibold text-xs text-text min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-background rounded text-text-muted hover:text-text transition-colors"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <span className="text-xs font-semibold text-text-muted flex items-center mr-1">
          <Filter className="h-3.5 w-3.5 mr-1" /> Filter Schedule:
        </span>
        {['All', 'Task', 'Follow-up', 'AMC Renewal', 'Invoice Due'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedType === type
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface border border-border text-text-muted hover:text-text'
            }`}
          >
            {type}
          </button>
        ))}
        <span className="ml-auto text-xs text-text-muted">
          Showing <strong>{filteredEvents.length}</strong> active scheduled event(s)
        </span>
      </div>

      {isLoading && <TableSkeleton />}

      {!isLoading && (
        <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-border bg-background/50 text-center text-xs font-bold text-text-muted py-2.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border">
            {calendarCells.map((cell, idx) => (
              <div 
                key={idx}
                className={`min-h-[105px] p-1.5 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth ? 'bg-surface' : 'bg-background/30 opacity-40'
                } ${isToday(cell.day) && cell.isCurrentMonth ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    isToday(cell.day) && cell.isCurrentMonth
                      ? 'bg-primary text-white font-bold'
                      : 'text-text'
                  }`}>
                    {cell.day}
                  </span>
                  {cell.events.length > 0 && (
                    <span className="text-[10px] text-text-muted font-medium">
                      {cell.events.length} event(s)
                    </span>
                  )}
                </div>

                {/* Day events list */}
                <div className="space-y-1 overflow-y-auto max-h-[70px]">
                  {cell.events.slice(0, 3).map(ev => {
                    const Icon = ev.icon;
                    return (
                      <div 
                        key={ev.id}
                        className={`text-[10px] font-medium p-1 rounded border truncate flex items-center gap-1 ${ev.badgeClass}`}
                        title={`${ev.type}: ${ev.title} (${ev.meta})`}
                      >
                        <Icon className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    );
                  })}
                  {cell.events.length > 3 && (
                    <div className="text-[9px] text-text-muted font-semibold pl-1">
                      +{cell.events.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
