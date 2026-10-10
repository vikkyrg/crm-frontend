import React, { useState } from 'react';
import { Plus, UserCheck, Building, MessageSquare, MoreHorizontal, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Leads() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNote, setNewNote] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    leadSource: 'Website',
    estimatedBudget: 100000,
    notes: ''
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await api.get('/leads');
      return res.data || [];
    }
  });

  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ['leadNotes', selectedLead?._id],
    queryFn: async () => {
      const res = await api.get(`/leads/${selectedLead._id}/notes`);
      return res.data || [];
    },
    enabled: !!selectedLead
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/leads', payload),
    onSuccess: () => {
      toast.success('Lead created successfully!');
      setShowAddModal(false);
      setFormData({ companyName: '', contactName: '', email: '', phone: '', leadSource: 'Website', estimatedBudget: 100000, notes: '' });
      queryClient.invalidateQueries(['leads']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create lead')
  });

  const convertMutation = useMutation({
    mutationFn: async (id) => api.post(`/leads/${id}/convert`),
    onSuccess: (res) => {
      toast.success('🎉 Lead converted to Client successfully!');
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['clients']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to convert lead')
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id) => api.delete(`/leads/${id}`),
    onSuccess: () => {
      toast.success('Lead deleted successfully!');
      queryClient.invalidateQueries(['leads']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete lead')
  });

  const addNoteMutation = useMutation({
    mutationFn: async (notePayload) => api.post(`/leads/${selectedLead._id}/notes`, notePayload),
    onSuccess: () => {
      toast.success('Note added successfully!');
      setNewNote('');
      queryClient.invalidateQueries(['leadNotes', selectedLead._id]);
      queryClient.invalidateQueries(['leads']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add note')
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId) => api.delete(`/leads/${selectedLead._id}/notes/${noteId}`),
    onSuccess: () => {
      toast.success('Note deleted successfully!');
      queryClient.invalidateQueries(['leadNotes', selectedLead._id]);
      queryClient.invalidateQueries(['leads']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete note')
  });

  const displayData = data?.data || data || [];

  const columns = [
    { header: 'Lead ID', accessor: 'leadId' },
    { header: 'Contact Person', accessor: 'contactName' },
    { header: 'Company Name', accessor: 'companyName' },
    { 
      header: 'Email', 
      accessor: 'email',
      cell: (row) => <div className="truncate max-w-[150px]" title={row.email}>{row.email || '-'}</div>
    },
    { 
      header: 'Phone', 
      accessor: 'phone',
      cell: (row) => <div className="whitespace-nowrap">{row.phone || '-'}</div>
    },
    { header: 'Budget', cell: (row) => `₹${(row.estimatedBudget || 0).toLocaleString()}` },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
          row.status === 'Won' ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Notes',
      cell: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setSelectedLead(row); setShowNotesModal(true); }}
          className="flex items-center text-xs font-medium text-primary hover:underline whitespace-nowrap"
        >
          <MessageSquare className="mr-1 h-3.5 w-3.5" /> 
          {row.notesCount > 0 ? `${row.notesCount} Note${row.notesCount > 1 ? 's' : ''}` : '+ Add Note'}
        </button>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          {!row.isConverted && row.status !== 'Won' && (
            <button
              onClick={(e) => { e.stopPropagation(); convertMutation.mutate(row._id); }}
              disabled={convertMutation.isPending}
              className="px-2.5 py-1 text-xs font-bold bg-success text-white rounded hover:bg-success/90 transition-colors whitespace-nowrap"
            >
              <UserCheck className="inline h-3.5 w-3.5 mr-1" /> Convert
            </button>
          )}
          <DropdownMenu>
            {/* Future View/Edit actions can go here */}
            <DropdownItem icon={Eye} onClick={() => toast.info('View Details coming soon')}>View Details</DropdownItem>
            <DropdownItem icon={Edit} onClick={() => toast.info('Edit Lead coming soon')}>Edit</DropdownItem>
            <DropdownItem 
              icon={Trash2} 
              danger 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this lead?')) {
                  deleteLeadMutation.mutate(row._id);
                }
              }}
            >
              Delete Lead
            </DropdownItem>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <Building className="mr-2 h-6 w-6 text-primary" /> Lead Management
          </h1>
          <p className="text-sm text-text-muted mt-1">Track and manage sales pipeline leads from inquiry to client conversion.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Button>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load leads" onRetry={refetch} />}
      {!isLoading && !isError && displayData.length === 0 && (
        <ErrorState title="No leads found" message="There are currently no leads in the CRM database." />
      )}
      {!isLoading && !isError && displayData.length > 0 && (
        <DataTable columns={columns} data={displayData} reportName="Leads_Export" />
      )}

      {/* CREATE LEAD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-text mb-4">Create New Sales Lead</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text block mb-1">Company Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Contact Person *</label>
                <input 
                  type="text" 
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="name@company.com"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Phone / WhatsApp</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Lead Source</label>
                  <select 
                    value={formData.leadSource}
                    onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Website">Website</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Facebook">Facebook</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Referral">Referral</option>
                    <option value="Upwork">Upwork</option>
                    <option value="Cold Call">Cold Call</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Estimated Budget (₹)</label>
                  <input 
                    type="number" 
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={createMutation.isPending}>Save Lead</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTES MODAL */}
      {showNotesModal && selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-50">
          <div className="bg-surface h-full w-full max-w-md shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-lg font-bold text-text flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" /> Lead Notes
              </h2>
              <button 
                onClick={() => { setShowNotesModal(false); setSelectedLead(null); }}
                className="text-text-muted hover:text-text rounded-md p-1 hover:bg-background"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 border-b border-border bg-surface">
              <p className="text-xs text-text-muted font-mono">{selectedLead.leadId}</p>
              <h3 className="text-base font-bold text-text">{selectedLead.contactName}</h3>
              <p className="text-sm text-primary font-medium">{selectedLead.companyName}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/20">
              {notesLoading ? (
                <div className="text-center text-sm text-text-muted py-8">Loading notes...</div>
              ) : notesData?.length > 0 ? (
                notesData.map(note => (
                  <div key={note._id} className="bg-surface border border-border rounded-lg p-3 shadow-sm relative group">
                    <p className="text-sm text-text whitespace-pre-wrap pr-6">{note.note}</p>
                    
                    <button 
                      onClick={() => {
                        if(window.confirm('Are you sure you want to delete this note?')) {
                          deleteNoteMutation.mutate(note._id);
                        }
                      }}
                      disabled={deleteNoteMutation.isPending}
                      className="absolute top-3 right-3 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      title="Delete Note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="mt-2 pt-2 border-t border-border flex justify-between items-center text-xs text-text-muted">
                      <span>{note.createdBy?.name || 'Unknown User'}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-text-muted py-8">
                  No notes yet. Add one below.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-surface">
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                if(newNote.trim()) addNoteMutation.mutate({ note: newNote }); 
              }}>
                <textarea 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write a note..."
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm text-text resize-none focus:ring-1 focus:ring-primary mb-3"
                  rows={3}
                  required
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowNotesModal(false)}>Cancel</Button>
                  <Button type="submit" size="sm" isLoading={addNoteMutation.isPending} disabled={!newNote.trim()}>Add Note</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
