import React, { useState } from 'react';
import { 
  Plus, 
  CheckSquare, 
  Search, 
  Clock, 
  FolderKanban, 
  User, 
  X, 
  Trash2, 
  Edit,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Tasks() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [taskForm, setTaskForm] = useState({
    taskName: '',
    projectId: '',
    assignedEmployee: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: 8,
    description: ''
  });

  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    taskName: '',
    projectId: '',
    assignedEmployee: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '',
    estimatedHours: 8,
    description: ''
  });

  // Queries
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects?limit=200');
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
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get('/tasks?limit=100');
      return res.data || [];
    }
  });

  const projects = projectsData?.data || projectsData || [];
  const users = usersData || [];
  const displayData = data?.data || data || [];

  // Create Mutation
  const createTaskMutation = useMutation({
    mutationFn: async (payload) => api.post('/tasks', payload),
    onSuccess: () => {
      toast.success('Task created successfully!');
      setShowAddModal(false);
      setTaskForm({
        taskName: '',
        projectId: '',
        assignedEmployee: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedHours: 8,
        description: ''
      });
      queryClient.invalidateQueries(['tasks']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  });

  // Status Change Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => api.put(`/tasks/${id}`, { status }),
    onSuccess: () => {
      toast.success('Task status updated!');
      queryClient.invalidateQueries(['tasks']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update task status');
    }
  });

  // Edit Task Mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, payload }) => api.put(`/tasks/${id}`, payload),
    onSuccess: () => {
      toast.success('Task updated successfully!');
      setEditingTask(null);
      queryClient.invalidateQueries(['tasks']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  });

  // Delete Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      toast.success('Task deleted successfully!');
      queryClient.invalidateQueries(['tasks']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete task')
  });

  // Filtered List
  const filteredTasks = displayData.filter((t) => {
    const matchSearch = 
      !search ||
      (t.taskName && t.taskName.toLowerCase().includes(search.toLowerCase())) ||
      (t.taskId && t.taskId.toLowerCase().includes(search.toLowerCase())) ||
      (t.projectId?.projectName && t.projectId.projectName.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const columns = [
    { 
      header: 'Task ID', 
      accessor: 'taskId',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.taskId || row._id?.slice(-6)}
        </span>
      )
    },
    { 
      header: 'Task Name', 
      cell: (row) => (
        <div>
          <span className="font-bold text-text block">{row.taskName}</span>
          {row.description && <span className="text-[11px] text-text-muted truncate max-w-xs block">{row.description}</span>}
        </div>
      )
    },
    { 
      header: 'Project', 
      cell: (row) => (
        <span className="text-xs font-medium text-text flex items-center">
          <FolderKanban className="h-3 w-3 mr-1 text-primary" /> {row.projectId?.projectName || 'General'}
        </span>
      )
    },
    { 
      header: 'Assignee', 
      cell: (row) => (
        <span className="text-xs text-text flex items-center">
          <User className="h-3 w-3 mr-1 text-text-muted" /> {row.assignedEmployee?.name || 'Unassigned'}
        </span>
      ) 
    },
    { 
      header: 'Priority', 
      cell: (row) => {
        const pr = row.priority || 'Medium';
        const color = pr === 'Urgent' ? 'bg-danger/20 text-danger' : pr === 'High' ? 'bg-warning/20 text-warning' : 'bg-primary/10 text-primary';
        return <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${color}`}>{pr}</span>;
      }
    },
    { 
      header: 'Due Date', 
      cell: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'No date' 
    },
    { 
      header: 'Status', 
      cell: (row) => (
        <select 
          value={row.status || 'To Do'}
          onChange={(e) => updateStatusMutation.mutate({ id: row._id, status: e.target.value })}
          className="bg-background border border-border rounded px-2 py-1 text-xs text-text font-semibold focus:outline-none"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Review">Review</option>
          <option value="QA">QA</option>
          <option value="Completed">Completed</option>
        </select>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => {
              setEditingTask(row);
              setEditForm({
                taskName: row.taskName || '',
                projectId: row.projectId?._id || row.projectId || '',
                assignedEmployee: row.assignedEmployee?._id || row.assignedEmployee || '',
                priority: row.priority || 'Medium',
                status: row.status || 'To Do',
                dueDate: row.dueDate ? new Date(row.dueDate).toISOString().split('T')[0] : '',
                estimatedHours: row.estimatedHours || 8,
                description: row.description || ''
              });
            }}
            className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
            title="Edit task"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Delete this task?')) {
                deleteTaskMutation.mutate(row._id);
              }
            }}
            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
            title="Delete task"
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
            <CheckSquare className="mr-2 h-6 w-6 text-primary" /> Task Board & Work Allocations
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Assign tasks to employees, monitor milestone deliverables, and update completion states.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search tasks, project..."
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
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
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

      {/* Table Content */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load tasks" onRetry={refetch} />}
      {!isLoading && !isError && filteredTasks.length === 0 && (
        <ErrorState title="No tasks found" message="Create your first task to start assigning work to your team." />
      )}
      {!isLoading && !isError && filteredTasks.length > 0 && (
        <DataTable columns={columns} data={filteredTasks} />
      )}

      {/* CREATE TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl my-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text flex items-center">
                <CheckSquare className="mr-1.5 h-5 w-5 text-primary" /> Create New Work Task
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if (!taskForm.taskName.trim()) {
                  toast.error('Task Name is required');
                  return;
                }
                if (!taskForm.projectId) {
                  toast.error('Please assign this task to a Project');
                  return;
                }
                createTaskMutation.mutate(taskForm); 
              }} 
              className="space-y-4 text-xs mt-4"
            >
              <div>
                <label className="font-semibold text-text block mb-1">Task Title *</label>
                <input 
                  type="text" 
                  required
                  value={taskForm.taskName}
                  onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                  placeholder="e.g. Implement Payment Gateway Integration"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Project *</label>
                  <select 
                    required
                    value={taskForm.projectId}
                    onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>{p.projectName} ({p.projectId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Assigned Employee</label>
                  <select 
                    value={taskForm.assignedEmployee}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedEmployee: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="">-- Unassigned --</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Priority</label>
                  <select 
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Est. Hours</label>
                  <input 
                    type="number" 
                    min="1"
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Task Description</label>
                <textarea 
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text resize-none"
                  placeholder="Specific technical criteria or acceptance guidelines..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={createTaskMutation.isPending}>Save Task</Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl my-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text flex items-center">
                <Edit className="mr-1.5 h-5 w-5 text-primary" /> Edit Task: {editingTask.taskId || editingTask.taskName}
              </h2>
              <button onClick={() => setEditingTask(null)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                updateTaskMutation.mutate({
                  id: editingTask._id,
                  payload: {
                    ...editForm,
                    projectId: editForm.projectId || undefined,
                    assignedEmployee: editForm.assignedEmployee || undefined,
                    estimatedHours: Number(editForm.estimatedHours) || 8
                  }
                });
              }} 
              className="space-y-4 text-xs mt-4"
            >
              <div>
                <label className="font-semibold text-text block mb-1">Task Title / Deliverable *</label>
                <input 
                  type="text" 
                  required
                  value={editForm.taskName}
                  onChange={(e) => setEditForm({ ...editForm, taskName: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Linked Project</label>
                  <select 
                    value={editForm.projectId}
                    onChange={(e) => setEditForm({ ...editForm, projectId: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                  >
                    <option value="">General (No Project)</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>{p.projectName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Assigned Employee</label>
                  <select 
                    value={editForm.assignedEmployee}
                    onChange={(e) => setEditForm({ ...editForm, assignedEmployee: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text font-medium"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-text block mb-1">Priority</label>
                  <select 
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text block mb-1">Est. Hours</label>
                  <input 
                    type="number" 
                    min="1"
                    value={editForm.estimatedHours}
                    onChange={(e) => setEditForm({ ...editForm, estimatedHours: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded p-2 text-text"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Status</label>
                <select 
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text font-semibold"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="QA">QA</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Task Description</label>
                <textarea 
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-background border border-border rounded p-2 text-text resize-none"
                  placeholder="Specific technical criteria or acceptance guidelines..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
                <Button type="submit" isLoading={updateTaskMutation.isPending}>Update Task</Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
