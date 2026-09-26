import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/Button';

export default function ErrorState({ title = "Something went wrong", message = "Unable to load data.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-border rounded-lg bg-surface/50 h-64">
      <AlertCircle className="h-10 w-10 text-danger mb-4" />
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="text-sm text-text-muted mt-2 mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" /> Retry
        </Button>
      )}
    </div>
  );
}
