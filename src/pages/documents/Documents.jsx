import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/tables/DataTable';

const mockDocuments = [
  { id: 'DOC-001', name: 'Project_Requirements_v2.pdf', type: 'PDF', owner: 'Admin', date: '2023-10-15', size: '2.4 MB' },
  { id: 'DOC-002', name: 'Signed_NDA_Stark.pdf', type: 'PDF', owner: 'Sales', date: '2023-10-10', size: '1.1 MB' },
];

const columns = [
  { header: 'File Name', accessor: 'name' },
  { header: 'Type', accessor: 'type' },
  { header: 'Uploaded By', accessor: 'owner' },
  { header: 'Date', accessor: 'date' },
  { header: 'Size', accessor: 'size' },
];

export default function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Document Management</h1>
          <p className="text-sm text-text-muted mt-1">Centralized file storage for clients and projects.</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      <DataTable columns={columns} data={mockDocuments} />
    </div>
  );
}
