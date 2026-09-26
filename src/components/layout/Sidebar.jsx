import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Globe, 
  Headset, 
  Repeat, 
  Wallet, 
  UserCircle, 
  Settings,
  Target,
  FileText,
  FolderKanban,
  CheckSquare,
  ShieldCheck,
  Server,
  Cloud,
  FileArchive,
  Wrench,
  DollarSign,
  TrendingUp,
  Receipt,
  Users2,
  CalendarDays,
  Bot,
  Bell,
  Lock,
  PieChart
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navSections = [
  {
    title: 'MANAGEMENT',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
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
    ],
  },
  {
    title: 'DIGITAL ASSETS',
    items: [
      { name: 'Websites', path: '/digital-assets/websites', icon: Globe },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      { name: 'Tickets', path: '/support/tickets', icon: Headset },
    ],
  },
  {
    title: 'RECURRING BUSINESS',
    items: [
      { name: 'AMC / Renewals', path: '/recurring/amc', icon: Wrench },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { name: 'Finance Hub', path: '/finance', icon: TrendingUp },
      { name: 'Invoices', path: '/finance/invoices', icon: Receipt },
    ],
  },
  {
    title: 'PEOPLE & COMPANY',
    items: [
      { name: 'Employees', path: '/hr/employees', icon: Users2 },
      { name: 'Documents', path: '/documents', icon: FileArchive },
    ],
  },
  {
    title: 'AUTOMATION',
    items: [
      { name: 'Workflows', path: '/automation/workflows', icon: Bot },
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
          <span className="block text-xs font-normal text-text-muted">TECHNOLOGIES</span>
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
                      ? "bg-primary/10 text-primary" 
                      : "text-text-muted hover:bg-surface hover:text-text"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
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
          <UserCircle className="mr-3 h-8 w-8 text-text-muted" />
          <div className="flex flex-col">
            <span>Admin User</span>
            <span className="text-xs text-text-muted">admin@innomatrics.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
