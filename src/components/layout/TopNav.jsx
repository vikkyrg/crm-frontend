import React from 'react';
import { Search, Bell, Plus, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/Button';

export default function TopNav() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface flex-shrink-0">
      
      {/* Breadcrumbs Placeholder */}
      <div className="flex items-center text-sm text-text-muted">
        <span>Management</span>
        <span className="mx-2">/</span>
        <span className="text-text font-medium">Dashboard</span>
      </div>

      {/* Center - Global Search */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <div className="w-full bg-background border border-border rounded-md py-2 pl-10 pr-4 text-sm text-text-muted flex items-center justify-between cursor-pointer group-hover:border-primary/50 transition-colors">
            <span>Search anything...</span>
            <kbd className="hidden sm:inline-block bg-surface px-1.5 py-0.5 rounded border border-border text-[10px] font-medium">Ctrl K</kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <Button variant="primary" size="sm" className="hidden sm:flex">
          <Plus className="mr-2 h-4 w-4" />
          Quick Create
        </Button>
        
        <button onClick={toggleTheme} className="text-text-muted hover:text-text transition-colors">
          <Moon className="h-5 w-5 hidden dark:block" />
          <Sun className="h-5 w-5 block dark:hidden" />
        </button>

        <button className="relative text-text-muted hover:text-text transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[9px] text-white">
            3
          </span>
        </button>
      </div>
      
    </header>
  );
}
