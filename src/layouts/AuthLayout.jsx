import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            INNOMATRICS
          </h1>
          <p className="text-sm text-text-muted mt-2">
            Enterprise Business Management Platform
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
