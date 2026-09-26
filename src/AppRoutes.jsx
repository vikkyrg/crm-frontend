import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';

import Clients from './pages/crm/Clients';
import Quotations from './pages/crm/Quotations';
import Projects from './pages/operations/Projects';
import Tasks from './pages/operations/Tasks';
import Websites from './pages/assets/Websites';
import Domains from './pages/assets/Domains';
import Tickets from './pages/support/Tickets';
import Invoices from './pages/finance/Invoices';
import Payments from './pages/finance/Payments';
import Expenses from './pages/finance/Expenses';
import Employees from './pages/hr/Employees';
import Attendance from './pages/hr/Attendance';
import Leave from './pages/hr/Leave';
import Payroll from './pages/hr/Payroll';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/quotations" element={<ProtectedRoute><Quotations /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/websites" element={<ProtectedRoute><Websites /></ProtectedRoute>} />
      <Route path="/domains" element={<ProtectedRoute><Domains /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
      <Route path="/attendances" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/leaves" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
      <Route path="/payrolls" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
    </Routes>
  );
}
