import React, { useState } from 'react';
import { 
  Plus, 
  Headset, 
  Search, 
  Clock, 
  User, 
  Building, 
  X, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Tickets() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    clientId: '',
    category: 'Technical Support',
    priority: 'Medium',
    description: '',
    assignedEmployee: ''
  });

  // Queries
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients?limit=200');
      return res.data || [];
    }
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const res = await api.get('/users');
        return res.data || [];
      } catch (e) {
        return [];
      }
    }
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const res = await api.get('/tickets?limit=100');
      return res.data || [];
    }
  });

  const clients = clientsData?.data || clientsData || [];
  const users = usersData || [];
  const displayData = data?.data || data || [];

  // Mutations
  const createTicketMutation = useMutation({
    mutationFn: async (payload) => api.post('/tickets', payload),
    onSuccess: () => {
      toast.success('Support ticket created successfully!');
      setShowAddModal(false);
      setTicketForm({
        subject: '',
        clientId: '',
        category: 'Technical Support',
        priority: 'Medium',
        description: '',
        assignedEmployee: ''
      });
      queryClient.invalidateQueries(['tickets']);
      queryClient.invalidateQueries(['managementMetrics']);
      queryClient.invalidateQueries(['ceoView']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.put(`/tickets/${id}`, payload),
    onSuccess: (res) => {
      toast.success('Ticket updated!');
      if (selectedTicket) {
        setSelectedTicket(res.data || res);
      }
      setReplyText('');
      queryClient.invalidateQueries(['tickets']);
      queryClient.invalidateQueries(['ceoView']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update ticket')
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id) => api.delete(`/tickets/${id}`),
    onSuccess: () => {
      toast.success('Ticket deleted successfully!');
      queryClient.invalidateQueries(['tickets']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete ticket')
  });

  // Filtered List
  const filteredTickets = displayData.filter((tk) => {
    const matchSearch = 
      !search ||
      (tk.subject && tk.subject.toLowerCase().includes(search.toLowerCase())) ||
      (tk.ticketId && tk.ticketId.toLowerCase().includes(search.toLowerCase())) ||
      (tk.clientId?.companyName && tk.clientId.companyName.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'All' || tk.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || tk.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const columns = [
    { 
      header: 'Ticket ID', 
      accessor: 'ticketId',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.ticketId || row._id?.slice(-6)}
        </span>
      )
    },
    { 
      header: 'Subject & Description', 
      cell: (row) => (
        <div>
          <span className="font-bold text-text block">{row.subject}</span>
          <span className="text-[11px] text-text-muted truncate max-w-xs block">{row.description}</span>
        </div>
      )
    },
    { 
      header: 'Client', 
      cell: (row) => <span className="font-semibold text-text">{row.clientId?.companyName || 'Client'}</span> 
    },
    { 
      header: 'Priority', 
      cell: (row) => {
        const pr = row.priority || 'Medium';
        const color = pr === 'Urgent' ? 'bg-danger/20 text-danger font-bold' : pr === 'High' ? 'bg-warning/20 text-warning' : 'bg-primary/10 text-primary';
        return <span className={`px-2.5 py-0.5 text-[10px] rounded-full ${color}`}>{pr}</span>;
      }
    },
    { 
      header: 'Category', 
      cell: (row) => <span className="text-xs text-text-muted">{row.category || 'Support'}</span> 
    },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
          row.status === 'Resolved' || row.status === 'Closed' ? 'bg-success/20 text-success' :
          row.status === 'In Progress' ? 'bg-primary/20 text-primary' :
          'bg-warning/20 text-warning'
        }`}>
          {row.status || 'Open'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setSelectedTicket(row)}
          >
            <Eye className="mr-1 h-3.5 w-3.5" /> View
          </Button>
          <button 
            onClick={() => {
              if (window.confirm('Delete this ticket?')) {
                deleteTicketMutation.mutate(row._id);
              }
            }}
            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <Headset className="mr-2 h-6 w-6 text-primary" /> Support Help Desk & SLA Management
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Resolve customer support queries, respond to bug tickets, and monitor SLA response times.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Open Support Ticket
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search tickets, subject, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-muted font-medium">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-muted font-medium">Priority:</span>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load support tickets" onRetry={refetch} />}
      {!isLoading && !isError && filteredTickets.length === 0 && (
        <ErrorState title="No support tickets" message="All client queries are resolved! You're caught up." />
      )}
      {!isLoading && !isError && filteredTickets.length > 0 && (
        <DataTable columns={columns} data={filteredTickets} />
      )}

      {/* CREATE TICKET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl my-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text flex items-center">
                <Headset className="mr-1.5 h-5 w-5 text-primary" /> Create Support Ticket
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if (!ticketForm.subject.trim()) {
                  toast.error('Subject is required');
                  return;
                }
                if (!ticketForm.clientId) {
                  toast.error('Please select a Client');
                  return;
                }
                createTicketMutation.mutate(ticketForm); 
              }} 
              className="space-y-4 text-xs mt-4"
            >
              <div>
                <label className="font-semibold text-text block mb-1">Ticket Subject *</label>
                <input 
                  type="text" 
                  required
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                  placeholder="e.g. Website checkout page showing 500 error"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Client *</label>
                  <select 
                    required
                    value={ticketForm.clientId}
                    onChange={(e) => setTicketForm({ ...ticketForm, clientId: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>{c.companyName} ({c.clientId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Category</label>
                  <select 
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Billing / Invoice">Billing / Invoice</option>
                    <option value="Server / Hosting">Server / Hosting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Priority</label>
                  <select 
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Assigned Support Agent</label>
                  <select 
                    value={ticketForm.assignedEmployee}
                    onChange={(e) => setTicketForm({ ...ticketForm, assignedEmployee: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="">-- Unassigned --</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Issue Description *</label>
                <textarea 
                  rows={3}
                  required
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text resize-none"
                  placeholder="Detailed description of the customer problem or reproduction steps..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={createTicketMutation.isPending}>Submit Ticket</Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW TICKET & REPLY THREAD MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl w-full max-w-2xl shadow-2xl my-6 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {selectedTicket.ticketId || 'Ticket'}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    selectedTicket.priority === 'Urgent' ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'
                  }`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <h2 className="text-base font-bold text-text mt-1">{selectedTicket.subject}</h2>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-text max-h-[70vh] overflow-y-auto">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-background rounded-lg border border-border">
                <div>
                  <span className="text-text-muted block text-[11px]">CLIENT:</span>
                  <p className="font-semibold text-text mt-0.5">{selectedTicket.clientId?.companyName || 'Client'}</p>
                  <p className="text-text-muted">{selectedTicket.clientId?.email}</p>
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">STATUS UPDATER:</span>
                  <select 
                    value={selectedTicket.status || 'Open'}
                    onChange={(e) => updateTicketMutation.mutate({ id: selectedTicket._id, payload: { status: e.target.value } })}
                    className="mt-1 bg-surface border border-border rounded px-2.5 py-1 text-xs text-text font-bold"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Client">Waiting for Client</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Initial description */}
              <div className="p-3.5 bg-background rounded-lg border border-border">
                <span className="text-[11px] font-bold text-text-muted block mb-1">ORIGINAL INQUIRY:</span>
                <p className="text-text leading-relaxed whitespace-pre-line">{selectedTicket.description}</p>
              </div>

              {/* Thread replies */}
              <div className="space-y-3 pt-2">
                <span className="font-bold text-text block text-xs uppercase tracking-wider">
                  Conversation & Responses ({selectedTicket.messages?.length || 0})
                </span>

                {selectedTicket.messages?.length === 0 && (
                  <p className="text-xs text-text-muted py-2">No replies yet. Send the first response below.</p>
                )}

                {selectedTicket.messages?.map((msg, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border text-xs ${
                    msg.senderType === 'Staff' ? 'bg-primary/5 border-primary/20 ml-4' : 'bg-background border-border mr-4'
                  }`}>
                    <div className="flex justify-between items-center mb-1 text-[11px]">
                      <span className="font-bold text-primary">{msg.senderType === 'Staff' ? 'Support Agent' : 'Client Representative'}</span>
                      <span className="text-text-muted">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-text">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="pt-3 border-t border-border">
                <label className="font-semibold text-text block mb-1">Send Reply to Customer</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type reply message..."
                    className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs text-text"
                  />
                  <Button 
                    onClick={() => {
                      if (!replyText.trim()) return;
                      updateTicketMutation.mutate({
                        id: selectedTicket._id,
                        payload: { newMessage: replyText }
                      });
                    }}
                    isLoading={updateTicketMutation.isPending}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" /> Reply
                  </Button>
                </div>
              </div>

            </div>

            <div className="p-3 border-t border-border bg-background/50 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
