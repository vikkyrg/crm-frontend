import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Globe, 
  Headset, 
  Repeat, 
  Settings,
  Target,
  FileText,
  FolderKanban,
  ShieldCheck,
  Wrench,
  TrendingUp,
  Receipt,
  Users2,
  CalendarDays,
  Bot,
  PieChart,
  UserCircle,
  Eye,
  CheckSquare,
  DollarSign
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navSections = [
  {
    title: 'MANAGEMENT',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'CEO Morning View', path: '/dashboard/ceo-view', icon: Eye },
      { name: 'Action Center', path: '/action-center', icon: Target },
      { name: 'Reports', path: '/reports', icon: PieChart },
      { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    ],
  },
  {
    title: 'CRM',
    items: [
      { name: 'Leads', path: '/crm/leads', icon: Users },
      { name: 'Follow-ups', path: '/crm/follow-ups', icon: Repeat },
      { name: 'Clients', path: '/clients', icon: Briefcase },
      { name: 'Quotations', path: '/sales/quotations', icon: FileText },
      { name: 'Agreements', path: '/sales/contracts', icon: ShieldCheck },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Projects', path: '/projects', icon: FolderKanban },
      { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    ],
  },
  {
    title: 'DIGITAL ASSETS',
    items: [
      { name: 'Websites & Apps', path: '/digital-assets/websites', icon: Globe },
      { name: 'Domains & SSL', path: '/domains', icon: Globe },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      { name: 'Support Tickets', path: '/support/tickets', icon: Headset },
    ],
  },
  {
    title: 'RECURRING BUSINESS',
    items: [
      { name: 'AMC & Renewals', path: '/recurring/amc', icon: Wrench },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { name: 'Finance Hub', path: '/finance', icon: TrendingUp },
      { name: 'Invoices', path: '/finance/invoices', icon: Receipt },
      { name: 'Payments', path: '/finance/payments', icon: DollarSign },
      { name: 'Expenses', path: '/finance/expenses', icon: Receipt },
    ],
  },
  {
    title: 'PEOPLE & COMPANY',
    items: [
      { name: 'Employees', path: '/hr/employees', icon: Users2 },
      { name: 'Attendance', path: '/hr/attendance', icon: CalendarDays },
      { name: 'Leave', path: '/hr/leave', icon: FileText },
    ],
  },
  {
    title: 'AUTOMATION',
    items: [
      { name: 'Workflows', path: '/automation/workflows', icon: Bot },
      { name: 'Approvals', path: '/automation/approvals', icon: CheckSquare },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  }
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-primary">
          INNOMATRICS
          <span className="block text-xs font-normal text-text-muted">CRM / ERP PLATFORM</span>
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {navSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="px-6 text-xs font-semibold text-text-muted tracking-wider mb-2">
              {section.title}
            </h2>
            <nav className="space-y-1 px-3">
              {section.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-text-muted hover:bg-surface hover:text-text"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>
      
      {/* User Info / Bottom */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center text-sm font-medium text-text">
          <UserCircle className="mr-3 h-8 w-8 text-primary" />
          <div className="flex flex-col overflow-hidden">
            <span className="truncate">Super Admin</span>
            <span className="text-xs text-text-muted truncate">admin@innomatrics.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
