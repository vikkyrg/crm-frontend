import React from 'react';
import { AlertCircle, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';

export default function ActionCenter() {
  const { data: actions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['actionCenterItems'],
    queryFn: async () => {
      const res = await api.get('/dashboard/action-center');
      return res.data || [];
    }
  });

  if (isLoading) return <div className="p-6"><TableSkeleton /></div>;
  if (isError) return <div className="p-6"><ErrorState title="Failed to load Action Center" onRetry={refetch} /></div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
          <AlertCircle className="mr-3 h-7 w-7 text-primary" /> Company Action Center
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Centralized company-wide hub for all pending follow-ups, payment collections, approvals, and deadline actions.
        </p>
      </div>

      <div className="space-y-3">
        {actions.length === 0 && (
          <div className="p-8 text-center bg-surface border border-border rounded-xl">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
            <h3 className="text-base font-bold text-text">All Clear!</h3>
            <p className="text-xs text-text-muted mt-1">There are no pending action items in the company queue today.</p>
          </div>
        )}

        {actions.map((item, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg shadow-sm hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${item.priority === 'Urgent' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                {item.priority === 'Urgent' ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-bold text-text">{item.title}</p>
                <div className="flex items-center space-x-3 text-xs text-text-muted mt-1">
                  <span className="font-semibold text-primary">{item.type}</span>
                  <span>•</span>
                  <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
              item.priority === 'Urgent' ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'
            }`}>
              {item.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
