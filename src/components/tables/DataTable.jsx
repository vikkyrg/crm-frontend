import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import ExportFormatModal from '../modals/ExportFormatModal';
import { exportData } from '../../utils/exportUtils';

export default function DataTable({ columns, data, onRowClick, reportName = "Export_Data" }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const rowsPerPage = 10;

  const filteredData = useMemo(() => {
    let result = data || [];
    
    // Quick Search Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(row => {
        return columns.some(col => {
          const val = row[col.accessor];
          return val && String(val).toLowerCase().includes(lowerSearch);
        });
      });
    }

    // Status Filter
    if (statusFilter && statusFilter !== 'All') {
      result = result.filter(row => {
        const val = row.status || row.state;
        return val && String(val).toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Date Range Filter
    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter(row => {
        const dateVal = row.createdAt || row.followUpDate || row.date || row.startDate || row.expiryDate;
        if (!dateVal) return true;
        return new Date(dateVal).getTime() >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000;
      result = result.filter(row => {
        const dateVal = row.createdAt || row.followUpDate || row.date || row.startDate || row.expiryDate;
        if (!dateVal) return true;
        return new Date(dateVal).getTime() <= end;
      });
    }
    
    return result;
  }, [data, columns, searchTerm, statusFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleExportSelection = async (format) => {
    if (!filteredData.length) {
      toast.error('No data to export');
      return;
    }
    try {
      await exportData(filteredData, columns, format, reportName);
      toast.success(`Successfully exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export data');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'All' || startDate || endDate;

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input 
            placeholder="Search..." 
            className="pl-9 h-9 w-full" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex space-x-2">
          <Button variant={showFilter ? "primary" : "outline"} size="sm" onClick={() => setShowFilter(!showFilter)}>
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>
            Export
          </Button>
        </div>
      </div>
      
      {/* Real Filter Panel */}
      {showFilter && (
        <div className="p-4 border-b border-border bg-background/50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">Date Range</label>
              <div className="flex items-center space-x-2">
                <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="h-9 text-xs" />
                <span className="text-text-muted">-</span>
                <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="h-9 text-xs" />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <Button size="sm" variant="outline" className="w-full" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="px-4 py-2 border-b border-border bg-surface flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted font-medium mr-2">Active Filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded bg-background border border-border text-xs font-medium text-text">
              Search: {searchTerm}
              <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-danger"><X className="h-3 w-3" /></button>
            </span>
          )}
          {statusFilter !== 'All' && (
            <span className="inline-flex items-center px-2 py-1 rounded bg-background border border-border text-xs font-medium text-text">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('All')} className="ml-1 hover:text-danger"><X className="h-3 w-3" /></button>
            </span>
          )}
          {startDate && (
            <span className="inline-flex items-center px-2 py-1 rounded bg-background border border-border text-xs font-medium text-text">
              From: {startDate}
              <button onClick={() => setStartDate('')} className="ml-1 hover:text-danger"><X className="h-3 w-3" /></button>
            </span>
          )}
          {endDate && (
            <span className="inline-flex items-center px-2 py-1 rounded bg-background border border-border text-xs font-medium text-text">
              To: {endDate}
              <button onClick={() => setEndDate('')} className="ml-1 hover:text-danger"><X className="h-3 w-3" /></button>
            </span>
          )}
          <button onClick={handleResetFilters} className="text-xs text-primary hover:underline ml-auto">
            Clear All
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-background text-text-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium">
                <input type="checkbox" className="rounded border-border" />
              </th>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 font-medium whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="border-b border-border hover:bg-background/50 transition-colors cursor-pointer"
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-border" />
                  </td>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-text-muted">
                  No data available for current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border bg-background/30 text-xs">
        <span className="text-text-muted text-center sm:text-left">
          Showing {filteredData.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length} entries
        </span>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === totalPages || filteredData.length === 0}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <ExportFormatModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)}
        onExport={handleExportSelection}
      />
    </div>
  );
}
