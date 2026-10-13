import React from 'react';
import { Outlet } from 'react-router-dom';

export default function PortalLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6">
         <h1 className="text-lg sm:text-xl font-bold text-primary">Innomatrics Portal</h1>
         <div className="flex items-center space-x-4">
           <span className="text-xs sm:text-sm font-medium text-text">Welcome back</span>
         </div>
      </header>
      <main className="p-3 sm:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
