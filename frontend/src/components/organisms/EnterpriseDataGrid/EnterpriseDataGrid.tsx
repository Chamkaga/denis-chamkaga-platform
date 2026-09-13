import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  Download,
  Printer,
  Copy,
  Trash2,
  Archive,
  RefreshCw,
  Columns,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  FileSpreadsheet,
  FileCode,
  ShieldAlert,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '../../../lib/cn';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  defaultVisible?: boolean;
  pinned?: 'left' | 'right' | null;
  width?: string;
}

export interface EnterpriseDataGridProps<T> {
  title?: string;
  subtitle?: string;
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  
  // Pagination (Server-side compatible)
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isOwner?: boolean;

  // Search & Filter
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (columnKey: string, order: 'asc' | 'desc') => void;

  // Bulk Actions
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkArchive?: (ids: string[]) => void;
  onBulkExport?: (ids: string[]) => void;

  // Extra Actions & Customization
  customHeaderActions?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onRowClick?: (item: T) => void;
}

export function EnterpriseDataGrid<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  columns,
  keyExtractor,
  totalItems = data.length,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  isOwner = true,
  searchQuery = '',
  onSearchChange,
  sortBy,
  sortOrder = 'desc',
  onSortChange,
  selectedIds = [],
  onSelectionChange,
  onBulkDelete,
  onBulkArchive,
  customHeaderActions,
  isLoading = false,
  error = null,
  onRetry,
  emptyStateTitle = 'No records found',
  emptyStateDescription = 'Try adjusting your search query or filters to find what you are looking for.',
  onRowClick
}: EnterpriseDataGridProps<T>) {
  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach(col => {
      initial[col.key] = col.defaultVisible !== false;
    });
    return initial;
  });

  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

  // Local selection fallback
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);
  const activeSelectedIds = onSelectionChange ? selectedIds : localSelectedIds;

  const handleSelectAll = () => {
    if (activeSelectedIds.length === data.length) {
      if (onSelectionChange) onSelectionChange([]);
      else setLocalSelectedIds([]);
    } else {
      const allIds = data.map(keyExtractor);
      if (onSelectionChange) onSelectionChange(allIds);
      else setLocalSelectedIds(allIds);
    }
  };

  const handleSelectRow = (id: string) => {
    let next: string[];
    if (activeSelectedIds.includes(id)) {
      next = activeSelectedIds.filter(i => i !== id);
    } else {
      next = [...activeSelectedIds, id];
    }
    if (onSelectionChange) onSelectionChange(next);
    else setLocalSelectedIds(next);
  };

  // Sort Trigger
  const handleHeaderSort = (colKey: string) => {
    if (!onSortChange) return;
    if (sortBy === colKey) {
      onSortChange(colKey, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(colKey, 'asc');
    }
  };

  // Export Data Handlers
  const handleExportCSV = () => {
    const activeCols = columns.filter(c => visibleColumns[c.key]);
    const headers = activeCols.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const rows = data.map(item =>
      activeCols
        .map(c => {
          const val = item[c.key] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyFormatted = () => {
    const activeCols = columns.filter(c => visibleColumns[c.key]);
    const rows = data.map(item =>
      activeCols.map(c => String(item[c.key] ?? '')).join('\t')
    );
    navigator.clipboard.writeText([activeCols.map(c => c.header).join('\t'), ...rows].join('\n'));
    alert('Formatted grid records copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / (pageSize === 0 ? 1 : pageSize)));

  return (
    <div className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
      
      {/* Grid Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div>
          {title && <h2 className="text-base font-bold dark:text-white text-zinc-900 tracking-tight">{title}</h2>}
          {subtitle && <p className="text-xs text-zinc-500 font-mono mt-0.5">{subtitle}</p>}
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search by anything..."
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Column Picker Trigger */}
          <button
            onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
            title="Configure Visible Columns"
            className={cn(
              "p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
              isColumnPickerOpen
                ? "bg-accent-violet/10 border-accent-violet/30 text-accent-violet"
                : "border-zinc-200 dark:border-zinc-800 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850"
            )}
          >
            <Columns size={14} />
            <span className="hidden sm:inline">Columns</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              title="Export Grid Dataset"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold dark:text-zinc-300 flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer transition-all"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown size={12} />
            </button>
            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 hidden group-hover:block z-30">
              <button
                onClick={handleExportCSV}
                className="w-full px-3 py-2 text-left text-xs font-medium dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
              >
                <FileSpreadsheet size={14} className="text-emerald-500" />
                <span>CSV Export</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full px-3 py-2 text-left text-xs font-medium dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
              >
                <FileCode size={14} className="text-blue-500" />
                <span>Excel (TSV) Export</span>
              </button>
              <button
                onClick={handleCopyFormatted}
                className="w-full px-3 py-2 text-left text-xs font-medium dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
              >
                <Copy size={14} className="text-amber-500" />
                <span>Copy to Clipboard</span>
              </button>
              <button
                onClick={handlePrint}
                className="w-full px-3 py-2 text-left text-xs font-medium dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
              >
                <Printer size={14} className="text-purple-500" />
                <span>Print View</span>
              </button>
            </div>
          </div>

          {customHeaderActions}
        </div>
      </div>

      {/* Column Picker Modal / Popover */}
      {isColumnPickerOpen && (
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60 flex flex-wrap items-center gap-3 animate-fade-in">
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
            Visible Columns:
          </span>
          {columns.map(col => (
            <label
              key={col.key}
              className="flex items-center gap-1.5 text-xs cursor-pointer dark:text-zinc-300 select-none bg-white dark:bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800"
            >
              <input
                type="checkbox"
                checked={visibleColumns[col.key] !== false}
                onChange={(e) =>
                  setVisibleColumns(prev => ({ ...prev, [col.key]: e.target.checked }))
                }
                className="rounded border-zinc-300 text-accent-violet focus:ring-accent-violet"
              />
              <span>{col.header}</span>
            </label>
          ))}
          <button
            onClick={() => {
              const reset: Record<string, boolean> = {};
              columns.forEach(c => (reset[c.key] = true));
              setVisibleColumns(reset);
            }}
            className="text-[10px] text-accent-violet font-semibold hover:underline ml-auto"
          >
            Show All
          </button>
        </div>
      )}

      {/* Bulk Action Banner */}
      {activeSelectedIds.length > 0 && (
        <div className="px-4 py-2 bg-accent-violet/10 border-b border-accent-violet/20 flex items-center justify-between text-xs dark:text-white font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold text-accent-violet">{activeSelectedIds.length}</span>
            <span>records selected</span>
          </div>
          <div className="flex items-center gap-2">
            {onBulkArchive && (
              <button
                onClick={() => onBulkArchive(activeSelectedIds)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-all"
              >
                <Archive size={12} />
                <span>Archive Selected</span>
              </button>
            )}
            {onBulkDelete && (
              <button
                onClick={() => onBulkDelete(activeSelectedIds)}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-all"
              >
                <Trash2 size={12} />
                <span>Delete Selected</span>
              </button>
            )}
            <button
              onClick={() => (onSelectionChange ? onSelectionChange([]) : setLocalSelectedIds([]))}
              className="text-zinc-500 hover:text-zinc-300 ml-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-x-auto min-h-[300px] flex-1">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-zinc-200 dark:bg-zinc-850/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <ShieldAlert size={36} className="text-red-500 animate-bounce" />
            <h3 className="text-sm font-bold dark:text-white text-zinc-800">Failed to load grid data</h3>
            <p className="text-xs text-zinc-500 max-w-sm">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 px-4 py-2 rounded-xl bg-accent-violet text-white text-xs font-semibold flex items-center gap-2 hover:bg-accent-violet/90 transition-all cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Retry Query</span>
              </button>
            )}
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Filter size={32} className="text-zinc-400 opacity-60 mb-2" />
            <h3 className="text-sm font-bold dark:text-white text-zinc-800">{emptyStateTitle}</h3>
            <p className="text-xs text-zinc-500 max-w-md">{emptyStateDescription}</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider select-none">
                <th className="p-3 w-10 text-center">
                  <button onClick={handleSelectAll} className="cursor-pointer">
                    {activeSelectedIds.length === data.length && data.length > 0 ? (
                      <CheckSquare size={14} className="text-accent-violet" />
                    ) : (
                      <Square size={14} className="text-zinc-400" />
                    )}
                  </button>
                </th>
                {columns
                  .filter(col => visibleColumns[col.key] !== false)
                  .map(col => {
                    const isSorted = sortBy === col.key;
                    return (
                      <th
                        key={col.key}
                        style={{ width: col.width }}
                        className={cn(
                          "p-3 font-semibold",
                          col.sortable !== false ? "cursor-pointer hover:text-zinc-900 dark:hover:text-white" : ""
                        )}
                        onClick={() => col.sortable !== false && handleHeaderSort(col.key)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.header}</span>
                          {col.sortable !== false && (
                            <span className="text-zinc-400">
                              {isSorted ? (
                                sortOrder === 'asc' ? <ArrowUp size={12} className="text-accent-violet" /> : <ArrowDown size={12} className="text-accent-violet" />
                              ) : (
                                <ArrowUpDown size={11} className="opacity-40" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850/60 dark:text-zinc-300 text-zinc-800">
              {data.map((item, idx) => {
                const id = keyExtractor(item);
                const isSelected = activeSelectedIds.includes(id);

                return (
                  <tr
                    key={id || idx}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={cn(
                      "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                      onRowClick ? "cursor-pointer" : "",
                      isSelected ? "bg-accent-violet/5 dark:bg-accent-violet/10" : ""
                    )}
                  >
                    <td className="p-3 text-center">
                      <button onClick={() => handleSelectRow(id)} className="cursor-pointer">
                        {isSelected ? (
                          <CheckSquare size={14} className="text-accent-violet" />
                        ) : (
                          <Square size={14} className="text-zinc-400" />
                        )}
                      </button>
                    </td>
                    {columns
                      .filter(col => visibleColumns[col.key] !== false)
                      .map(col => (
                        <td key={col.key} className="p-3 font-medium">
                          {col.render ? col.render(item, idx) : item[col.key] ?? '—'}
                        </td>
                      ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Grid Footer Pagination */}
      <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs text-zinc-500">
        
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none cursor-pointer font-semibold"
          >
            {[10, 20, 30, 50, 100, 250, 500, 1000].map(sz => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
            {isOwner && <option value={0}>All (Owner Only)</option>}
          </select>
          <span className="hidden sm:inline text-[11px] text-zinc-400 ml-2">
            Showing {data.length > 0 ? (currentPage - 1) * (pageSize || data.length) + 1 : 0}–
            {Math.min(currentPage * (pageSize || data.length), totalItems)} of {totalItems} items
          </span>
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 font-semibold dark:text-zinc-300 text-xs">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>

      </div>

    </div>
  );
}
