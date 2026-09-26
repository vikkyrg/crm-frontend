import React from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({ className }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-border/50", className)}
    />
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="h-12 bg-surface/50 border-b border-border" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border-b border-border">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-8 ml-auto rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
