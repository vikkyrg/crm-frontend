import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Search, 
  Plus, 
  X, 
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DataTable from '../../components/tables/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { toast } from 'sonner';

export default function Documents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const initialForm = {
    title: '',
    category: 'General',
    fileUrl: '',
    fileName: '',
    fileType: 'application/pdf',
    fileSizeBytes: 1048576,
    fileData: null,
    uploadType: 'file', // 'file' or 'url'
    version: 1
  };

  const [formData, setFormData] = useState(initialForm);

  // Queries
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['documents', search, categoryFilter],
    queryFn: async () => {
      let url = '/documents';
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (categoryFilter !== 'All') params.push(`category=${encodeURIComponent(categoryFilter)}`);
      if (params.length) url += `?${params.join('&')}`;
      const res = await api.get(url);
      return res.data || [];
    }
  });

  const documents = data?.data || data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload) => api.post('/documents', payload),
    onSuccess: () => {
      toast.success('Document uploaded & recorded successfully!');
      setShowAddModal(false);
      setFormData(initialForm);
      queryClient.invalidateQueries(['documents']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/documents/${id}`),
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries(['documents']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete document');
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size cannot exceed 10MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileType: file.type || 'application/pdf',
        fileSizeBytes: file.size,
        fileData: reader.result,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      toast.error('Document title is required');
      return;
    }

    if (formData.uploadType === 'url') {
      if (!formData.fileUrl || !formData.fileUrl.trim()) {
        toast.error('File URL is required');
        return;
      }
    } else {
      if (!formData.fileData && !formData.fileUrl) {
        toast.error('Please select a file to upload');
        return;
      }
    }

    createMutation.mutate({
      ...formData,
      fileName: formData.fileName || formData.title
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columns = [
    { 
      header: 'Document Title', 
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <div>
            <span className="font-semibold text-text block">{row.title}</span>
            <span className="text-[11px] text-text-muted">{row.fileName}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Category', 
      accessor: 'category',
      cell: (row) => (
        <span className="px-2 py-0.5 text-xs bg-background rounded border border-border">
          {row.category}
        </span>
      )
    },
    { 
      header: 'Uploaded By', 
      cell: (row) => row.createdBy?.name || 'Staff' 
    },
    { 
      header: 'Date', 
      cell: (row) => new Date(row.createdAt).toLocaleDateString() 
    },
    { 
      header: 'Size', 
      cell: (row) => formatFileSize(row.fileSizeBytes) 
    },
    {
      header: 'Actions',
      cell: (row) => {
        const downloadUrl = row.localFilePath 
          ? `http://localhost:5000/api/v1/documents/${row._id}/download` 
          : row.fileUrl;

        return (
          <div className="flex items-center space-x-2">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={row.fileName}
              className="p-1 text-text-muted hover:text-primary transition-colors rounded"
              title="Download Document"
            >
              <Download className="h-4 w-4" />
            </a>
            <a
              href={row.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-text-muted hover:text-primary transition-colors rounded"
              title="Open Link"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={() => {
                if (window.confirm(`Delete document "${row.title}"?`)) {
                  deleteMutation.mutate(row._id);
                }
              }}
              className="p-1 text-text-muted hover:text-danger transition-colors rounded"
              title="Delete Document"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center">
            <FolderOpen className="mr-2.5 h-6 w-6 text-primary" /> Document Management
          </h1>
          <p className="text-xs text-text-muted mt-1">Centralized cloud file storage for clients, proposals, and projects.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Upload className="mr-1.5 h-4 w-4" /> Upload Document
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input 
            placeholder="Search documents by name, title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-text-muted">Category:</span>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface border border-border text-xs rounded-lg px-3 py-2 text-text"
          >
            <option value="All">All Categories</option>
            <option value="Client">Client</option>
            <option value="Project">Project</option>
            <option value="Contract">Contract</option>
            <option value="Invoice">Invoice</option>
            <option value="Domain">Domain</option>
            <option value="Website">Website</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      {isLoading && <TableSkeleton />}
      {isError && <ErrorState title="Failed to load documents" onRetry={refetch} />}
      {!isLoading && !isError && documents.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-12 text-center space-y-4 shadow-xs">
          <FileText className="h-12 w-12 text-primary mx-auto opacity-70" />
          <div>
            <h3 className="text-lg font-bold text-text">No Documents Found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto mt-1">
              Store agreements, deliverables, NDAs, and project scope files in one repository.
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Upload className="mr-1.5 h-4 w-4" /> Upload First Document
          </Button>
        </div>
      )}
      {!isLoading && !isError && documents.length > 0 && (
        <DataTable columns={columns} data={documents} reportName="Documents_Repository_Export" />
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-base font-bold text-text flex items-center">
                <Upload className="mr-2 h-4 w-4 text-primary" /> Upload / Register Document
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-text-muted hover:text-text p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text block mb-1">
                  Document Title <span className="text-danger">*</span>
                </label>
                <Input 
                  placeholder="e.g. Master Services Agreement 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-text block mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-surface text-text text-xs focus:ring-2 focus:ring-primary outline-hidden"
                  >
                    <option value="General">General</option>
                    <option value="Client">Client</option>
                    <option value="Project">Project</option>
                    <option value="Contract">Contract</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Domain">Domain</option>
                    <option value="Website">Website</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-text block mb-1">File Name</label>
                  <Input 
                    placeholder="e.g. MSA_Signed_v1.pdf"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  />
                </div>
              </div>

              {/* Upload Type Toggle */}
              <div className="flex gap-4 border-b border-border pb-3">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input 
                    type="radio" 
                    name="uploadType" 
                    value="file" 
                    checked={formData.uploadType === 'file'}
                    onChange={() => setFormData({ ...formData, uploadType: 'file' })}
                  />
                  <span>Upload Local File</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input 
                    type="radio" 
                    name="uploadType" 
                    value="url" 
                    checked={formData.uploadType === 'url'}
                    onChange={() => setFormData({ ...formData, uploadType: 'url' })}
                  />
                  <span>External Cloud URL</span>
                </label>
              </div>

              {formData.uploadType === 'file' ? (
                <div>
                  <label className="font-semibold text-text block mb-1">
                    Select File (PDF, DOCX, PNG, JPG, ZIP - max 10MB) <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="w-full text-xs text-text file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                    accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.txt,.zip"
                  />
                  {formData.fileName && (
                    <p className="text-[11px] text-text-muted mt-1">
                      Selected: <strong>{formData.fileName}</strong> ({formatFileSize(formData.fileSizeBytes)})
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-text block mb-1">
                    Document Cloud / Storage URL <span className="text-danger">*</span>
                  </label>
                  <Input 
                    placeholder="e.g. https://storage.innomatrics.com/docs/file.pdf"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Document'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
