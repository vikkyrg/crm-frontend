import React, { useState } from 'react';
import { 
  Plus, 
  Receipt, 
  DollarSign, 
  Search, 
  Calendar, 
  FolderKanban, 
  X,
  Building,
  Tag
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Expenses() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [expenseForm, setExpenseForm] = useState({
    category: 'Software & Tools',
    amount: '',
    projectId: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    approvalStatus: 'Finance Approved'
  });

  // Queries
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects?limit=200');
      return res.data || [];
    }
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await api.get('/expenses?limit=100');
      return res.data || [];
    }
  });

  const projects = projectsData?.data || projectsData || [];
  const displayData = data?.data || data || [];

  // Create Mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (payload) => api.post('/expenses', payload),
    onSuccess: () => {
      toast.success('Expense recorded successfully!');
      setShowAddModal(false);
      setExpenseForm({
        category: 'Software & Tools',
        amount: '',
        projectId: '',
        expenseDate: new Date().toISOString().split('T')[0],
        description: '',
        approvalStatus: 'Finance Approved'
      });
      queryClient.invalidateQueries(['expenses']);
      queryClient.invalidateQueries(['managementMetrics']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to record expense');
    }
  });

  // Filtered List
  const filteredExpenses = displayData.filter(exp => {
    const matchSearch = 
      !search ||
      (exp.expenseId && exp.expenseId.toLowerCase().includes(search.toLowerCase())) ||
      (exp.category && exp.category.toLowerCase().includes(search.toLowerCase())) ||
      (exp.description && exp.description.toLowerCase().includes(search.toLowerCase())) ||
      (exp.projectId?.projectName && exp.projectId.projectName.toLowerCase().includes(search.toLowerCase()));

    const matchCat = categoryFilter === 'All' || exp.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const columns = [
    { 
      header: 'Expense ID', 
      accessor: 'expenseId',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.expenseId || row._id?.slice(-6)}
        </span>
      )
    },
    { 
      header: 'Category', 
      cell: (row) => (
        <span className="font-semibold text-text flex items-center">
          <Tag className="h-3 w-3 mr-1 text-primary" /> {row.category}
        </span>
      )
    },
    { header: 'Description', accessor: 'description' },
    { 
      header: 'Linked Project', 
      cell: (row) => (
        <span className="text-xs text-text-muted">
          {row.projectId?.projectName || 'Company Overhead'}
        </span>
      )
    },
    { 
      header: 'Amount', 
      cell: (row) => (
        <span className="font-mono font-bold text-danger text-sm">
          ₹{(row.amount || 0).toLocaleString()}
        </span>
      ) 
    },
    { 
      header: 'Date', 
      cell: (row) => new Date(row.expenseDate || row.createdAt).toLocaleDateString() 
    },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className="px-2.5 py-0.5 text-[11px] font-bold bg-success/20 text-success rounded-full">
          {row.approvalStatus || 'Approved'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <Receipt className="mr-2 h-6 w-6 text-primary" /> Operating Expenses & Costs
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track business operating expenses, software licenses, project direct costs, and overhead.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search expenses, description, project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-xs text-text-muted font-medium">Category:</span>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-text focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Software & Tools">Software & Tools</option>
            <option value="Server & Infrastructure">Server & Infrastructure</option>
            <option value="Freelancers & Contractors">Freelancers & Contractors</option>
            <option value="Office & Supplies">Office & Supplies</option>
            <option value="Travel & Meals">Travel & Meals</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load expenses" onRetry={refetch} />}
      {!isLoading && !isError && filteredExpenses.length === 0 && (
        <ErrorState title="No expenses recorded" message="Log business expenses to maintain accurate net profit margins." />
      )}
      {!isLoading && !isError && filteredExpenses.length > 0 && (
        <DataTable columns={columns} data={filteredExpenses} />
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl my-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text flex items-center">
                <Receipt className="mr-1.5 h-5 w-5 text-primary" /> Add Operating Expense
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
                  toast.error('Expense amount must be greater than zero');
                  return;
                }
                createExpenseMutation.mutate({
                  ...expenseForm,
                  amount: Number(expenseForm.amount),
                  projectId: expenseForm.projectId || undefined
                });
              }} 
              className="space-y-4 text-xs mt-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Expense Category *</label>
                  <select 
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                  >
                    <option value="Software & Tools">Software & Tools</option>
                    <option value="Server & Infrastructure">Server & Infrastructure</option>
                    <option value="Freelancers & Contractors">Freelancers & Contractors</option>
                    <option value="Office & Supplies">Office & Supplies</option>
                    <option value="Travel & Meals">Travel & Meals</option>
                    <option value="Marketing & Ads">Marketing & Ads</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Amount (₹) *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text font-mono font-bold"
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Linked Project (Optional)</label>
                  <select 
                    value={expenseForm.projectId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, projectId: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="">-- General Overhead --</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>{p.projectName} ({p.projectId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Expense Date *</label>
                  <input 
                    type="date" 
                    required
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Expense Description *</label>
                <input 
                  type="text" 
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text"
                  placeholder="e.g. Annual AWS EC2 server renewal, Figma licenses"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={createExpenseMutation.isPending}>Save Expense</Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
