import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';

// Routes
import ProtectedRoute from './ProtectedRoute';

// Pages
import Login from '../pages/auth/Login';
import ManagementDashboard from '../pages/dashboard/ManagementDashboard';
import CeoMorningDashboard from '../pages/dashboard/CeoMorningDashboard';
import Leads from '../pages/crm/Leads';
import FollowUps from '../pages/crm/FollowUps';
import Clients from '../pages/crm/Clients';
import ClientDetail from '../pages/crm/Client360';
import Quotations from '../pages/crm/Quotations';
import Projects from '../pages/operations/Projects';
import ProjectDetail from '../pages/operations/Project360';
import Websites from '../pages/assets/Websites';
import FinanceDashboard from '../pages/finance/FinanceDashboard';
import Invoices from '../pages/finance/Invoices';
import Tickets from '../pages/support/Tickets';
import Employees from '../pages/hr/Employees';
import Settings from '../pages/settings/Settings';

import Contracts from '../pages/sales/Contracts';
import AMC from '../pages/recurring/AMC';
import Documents from '../pages/documents/Documents';
import Reports from '../pages/reports/Reports';
import Workflows from '../pages/automation/Workflows';
import Approvals from '../pages/automation/Approvals';
import ActionCenter from '../pages/dashboard/ActionCenter';
import Calendar from '../pages/calendar/Calendar';

import PortalLayout from '../layouts/PortalLayout';
import ClientPortal from '../pages/portals/ClientPortal';
import EmployeePortal from '../pages/portals/EmployeePortal';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: '', element: <Navigate to="/login" replace /> }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute allowedRoles={['Admin', 'Manager', 'CEO', 'Super Admin']} />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { path: 'dashboard', element: <ManagementDashboard /> },
          { path: 'dashboard/ceo-view', element: <CeoMorningDashboard /> },
          { path: 'action-center', element: <ActionCenter /> },
          { path: 'calendar', element: <Calendar /> },
          { path: 'crm/leads', element: <Leads /> },
          { path: 'crm/follow-ups', element: <FollowUps /> },
          { path: 'clients', element: <Clients /> },
          { path: 'clients/:id', element: <ClientDetail /> },
          { path: 'sales/quotations', element: <Quotations /> },
          { path: 'sales/contracts', element: <Contracts /> },
          { path: 'projects', element: <Projects /> },
          { path: 'projects/:id', element: <ProjectDetail /> },
          { path: 'digital-assets/websites', element: <Websites /> },
          { path: 'recurring/amc', element: <AMC /> },
          { path: 'finance', element: <FinanceDashboard /> },
          { path: 'finance/invoices', element: <Invoices /> },
          { path: 'support/tickets', element: <Tickets /> },
          { path: 'hr/employees', element: <Employees /> },
          { path: 'documents', element: <Documents /> },
          { path: 'reports', element: <Reports /> },
          { path: 'automation/workflows', element: <Workflows /> },
          { path: 'automation/approvals', element: <Approvals /> },
          { path: 'settings', element: <Settings /> },
        ]
      }
    ]
  },
  {
    path: '/portal',
    element: <PortalLayout />,
    children: [
      { path: 'client', element: <ClientPortal /> },
      { path: 'employee', element: <EmployeePortal /> }
    ]
  }
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
