import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopNav from '../components/layout/TopNav';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-text">
      {/* Sidebar with Mobile Drawer capability */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* Page Content: Mobile-optimized padding */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-background/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
