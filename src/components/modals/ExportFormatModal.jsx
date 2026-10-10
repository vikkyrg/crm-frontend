import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '../ui/Button';

export default function ExportFormatModal({ isOpen, onClose, onExport }) {
  const [selectedFormat, setSelectedFormat] = useState('xlsx');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-text flex items-center">
            <Download className="mr-2 h-5 w-5 text-primary" /> Export Data
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text rounded-md p-1 hover:bg-background">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <p className="text-sm text-text-muted">Select export format:</p>
          
          <div className="space-y-2">
            {[
              { id: 'xlsx', label: 'Excel (.xlsx)' },
              { id: 'docx', label: 'Word (.docx)' },
              { id: 'pdf', label: 'PDF (.pdf)' },
              { id: 'csv', label: 'CSV (.csv)' },
              { id: 'txt', label: 'Text (.txt)' }
            ].map(fmt => (
              <label key={fmt.id} className="flex items-center space-x-3 p-3 rounded border border-border hover:bg-background/50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="exportFormat" 
                  value={fmt.id}
                  checked={selectedFormat === fmt.id}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="h-4 w-4 text-primary bg-background border-border"
                />
                <span className="text-sm font-medium text-text">{fmt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            onExport(selectedFormat);
            onClose();
          }}>
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
