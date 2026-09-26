import React from 'react';
import { Search, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export default function DataTable({ columns, data, onRowClick }) {
  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input placeholder="Search..." className="pl-9 h-9" />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Filter</Button>
          <Button variant="outline" size="sm">Export</Button>
        </div>
      </div>

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
              <th className="px-6 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
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
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <button className="text-text-muted hover:text-text">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 flex items-center justify-between border-t border-border">
        <span className="text-sm text-text-muted">
          Showing 1 to 10 of {data.length} entries
        </span>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>
          <Button variant="outline" size="sm">
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
