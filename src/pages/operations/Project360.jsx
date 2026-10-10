import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import DataTable from '../../components/tables/DataTable';
import { 
  FolderKanban, 
  CheckSquare, 
  Bug as BugIcon, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Globe, 
  FileText, 
  Layers,
  Building
} from 'lucide-react';

export default function Project360() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['project360', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}/360`);
      return res.data || {};
    }
  });

  if (isLoading) return <div className="p-6"><TableSkeleton /></div>;
  if (isError) return <div className="p-6"><ErrorState title="Failed to load Project 360 View" onRetry={refetch} /></div>;

  const {
    project = {},
    profitability = {},
    milestones = [],
    tasks = [],
    bugs = [],
    changeRequests = [],
    timeEntries = [],
    expenses = [],
    invoices = [],
    payments = [],
    websites = [],
    documents = [],
    activityTimeline = []
  } = data;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FolderKanban },
    { id: 'milestones', name: `Milestones (${milestones.length})`, icon: Layers },
    { id: 'tasks', name: `Tasks (${tasks.length})`, icon: CheckSquare },
    { id: 'bugs', name: `Bugs (${bugs.length})`, icon: BugIcon },
    { id: 'timetracking', name: `Time Tracking (${timeEntries.length})`, icon: Clock },
    { id: 'profitability', name: `Profitability Analysis`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 p-6">
      
      {/* Header Profile Card */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <FolderKanban className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-text">{project.projectName}</h1>
                <p className="text-xs font-mono text-text-muted">Project ID: {project.projectId} | Client: {project.clientId?.companyName || 'N/A'}</p>
              </div>
            </div>
          </div>

          <span className="px-3 py-1 bg-primary/10 text-primary font-semibold text-xs rounded-full">
            {project.status || 'Active'}
          </span>
        </div>

        {/* Financial Profitability Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-text-muted font-medium">Project Revenue</p>
            <p className="text-lg font-bold text-text mt-0.5">₹{profitability.revenue || 0}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-text-muted font-medium">Total Cost (Labor + Direct)</p>
            <p className="text-lg font-bold text-warning mt-0.5">₹{profitability.totalCost || 0}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-text-muted font-medium">Project Profit</p>
            <p className={`text-lg font-bold mt-0.5 ${profitability.projectProfit >= 0 ? 'text-success' : 'text-danger'}`}>
              ₹{profitability.projectProfit || 0}
            </p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-text-muted font-medium">Margin %</p>
            <p className="text-lg font-bold text-primary mt-0.5">{profitability.marginPercent || 0}%</p>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex space-x-2 border-b border-border overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text hover:bg-surface'
            }`}
          >
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Project Overview</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">Start Date:</span>
                <span className="font-semibold text-text">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">Target Completion:</span>
                <span className="font-semibold text-text">{project.expectedEndDate ? new Date(project.expectedEndDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted">Project Manager:</span>
                <span className="font-semibold text-text">{project.projectManager?.name || 'Unassigned'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MILESTONES TAB */}
      {activeTab === 'milestones' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Project Milestones</CardTitle></CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { header: 'Milestone Title', accessor: 'title' },
                { header: 'Completion %', cell: (row) => `${row.completionPercent || 0}%` },
                { header: 'Status', accessor: 'status' }
              ]}
              data={milestones}
            />
          </CardContent>
        </Card>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Project Tasks</CardTitle></CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { header: 'Task Name', accessor: 'taskName' },
                { header: 'Assigned To', cell: (row) => row.assignedEmployee?.name || 'Unassigned' },
                { header: 'Priority', accessor: 'priority' },
                { header: 'Status', accessor: 'status' }
              ]}
              data={tasks}
            />
          </CardContent>
        </Card>
      )}

      {/* BUGS TAB */}
      {activeTab === 'bugs' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Bug Tracker</CardTitle></CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { header: 'Bug ID', accessor: 'bugId' },
                { header: 'Description', accessor: 'description' },
                { header: 'Severity', accessor: 'severity' },
                { header: 'Status', accessor: 'status' }
              ]}
              data={bugs}
            />
          </CardContent>
        </Card>
      )}

      {/* TIME TRACKING TAB */}
      {activeTab === 'timetracking' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Time Entries & Labor Hours</CardTitle></CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { header: 'Developer', cell: (row) => row.employeeId?.name || 'Staff' },
                { header: 'Hours Logged', cell: (row) => `${row.durationHours} hrs` },
                { header: 'Description', accessor: 'description' }
              ]}
              data={timeEntries}
            />
          </CardContent>
        </Card>
      )}

      {/* PROFITABILITY TAB */}
      {activeTab === 'profitability' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Project Profitability Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-text-muted">Total Revenue Received:</span>
              <span className="font-bold text-success">₹{profitability.revenue || 0}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-text-muted">Labor Cost ({profitability.laborHours || 0} hrs @ ₹500/hr):</span>
              <span className="font-bold text-warning">₹{profitability.laborCost || 0}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-text-muted">Direct Expenses Cost:</span>
              <span className="font-bold text-warning">₹{profitability.directExpensesCost || 0}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2 pt-2 text-sm font-extrabold">
              <span>Net Project Profit:</span>
              <span className={profitability.projectProfit >= 0 ? 'text-success' : 'text-danger'}>₹{profitability.projectProfit || 0}</span>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
