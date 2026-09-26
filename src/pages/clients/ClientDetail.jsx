import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Phone, Mail, Globe, MapPin, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function ClientDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="text-sm text-text-muted">
        <Link to="/clients" className="hover:text-primary transition-colors">Clients</Link>
        <span className="mx-2">/</span>
        <span className="text-text font-medium">{id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-text">Stark Industries</h1>
              <span className="px-2.5 py-1 text-xs font-medium bg-success/10 text-success rounded-full">Active</span>
            </div>
            <p className="text-sm text-text-muted mt-1">Client ID: {id} • Technology Industry</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Project</Button>
          <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Invoice</Button>
          <Button variant="primary">Edit Client</Button>
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="flex space-x-6 border-b border-border text-sm font-medium text-text-muted overflow-x-auto">
        <button className="text-primary border-b-2 border-primary pb-3 px-1">Overview</button>
        <button className="hover:text-text pb-3 px-1">Contacts</button>
        <button className="hover:text-text pb-3 px-1">Projects</button>
        <button className="hover:text-text pb-3 px-1">Invoices</button>
        <button className="hover:text-text pb-3 px-1">Support</button>
        <button className="hover:text-text pb-3 px-1">Timeline</button>
      </div>

      {/* Overview Content */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Client Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 text-sm text-text-muted">
              <Phone className="h-4 w-4 mt-0.5 text-text" />
              <span>+1 (555) 123-4567<br/>Primary</span>
            </div>
            <div className="flex items-start space-x-3 text-sm text-text-muted">
              <Mail className="h-4 w-4 mt-0.5 text-text" />
              <span>tony@stark.com<br/>Billing</span>
            </div>
            <div className="flex items-start space-x-3 text-sm text-text-muted">
              <Globe className="h-4 w-4 mt-0.5 text-text" />
              <a href="#" className="text-primary hover:underline">starkindustries.com</a>
            </div>
            <div className="flex items-start space-x-3 text-sm text-text-muted">
              <MapPin className="h-4 w-4 mt-0.5 text-text" />
              <span>10880 Malibu Point<br/>Malibu, CA 90265</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4 border-l-2 border-border pl-4 pb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-text">Invoice #INV-0012 Paid</p>
                <p className="text-xs text-text-muted mt-1">Today at 10:23 AM</p>
              </div>
            </div>
            <div className="flex space-x-4 border-l-2 border-border pl-4 pb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-text">Project "Arc Reactor UI" completed</p>
                <p className="text-xs text-text-muted mt-1">Yesterday at 4:15 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
