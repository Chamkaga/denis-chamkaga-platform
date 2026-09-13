import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Download, ChevronLeft, ChevronRight,
  ArrowUpDown, Eye, EyeOff, CheckSquare, Square
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessorKey?: keyof T | ((row: T) => any);
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date';
  filterOptions?: { label: string; value: string }[];
  hidden?: boolean;
}

export interface BulkAction {
  label: string;
  action: string;
  icon?: React.ReactNode;
  variant?: 'danger' | 'primary' | 'secondary';
}

export interface EnterpriseDataGridProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  totalRecords?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  bulkActions?: BulkAction[];
  onBulkAction?: (actionKey: string, selectedRows: T[]) => void;
  onRowClick?: (row: T) => void;
  keyExtractor?: (row: T, index?: number) => string;
  exportFilename?: string;
}

export function EnterpriseDataGrid<T extends Record<string, any>>({
  columns: initialColumns,
  data = [],
  totalRecords,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  title,
  subtitle,
  actions,
  bulkActions = [],
  onBulkAction,
  onRowClick,
  keyExtractor = (row: T, index?: number) => (row && row.id ? String(row.id) : String(index ?? 0)),
  exportFilename = 'export_data',
}: EnterpriseDataGridProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialColumns.forEach((col) => {
      map[col.key] = col.hidden !== true;
    });
    return map;
  });

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const toggleColumnVisibility = (key: string) => {
    setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else setSortColumn(null);
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  // Filter & Search Logic (client-side fallback if not server handled)
  const filteredData = useMemo(() => {
    let result = [...data];

    // Global search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some(
          (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
    }

    // Column filters
    Object.entries(columnFilters).forEach(([colKey, filterVal]) => {
      if (!filterVal) return;
      const col = initialColumns.find((c) => c.key === colKey);
      if (!col) return;

      result = result.filter((row) => {
        const val = col.accessorKey
          ? typeof col.accessorKey === 'function'
            ? col.accessorKey(row)
            : row[col.accessorKey]
          : row[colKey];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(filterVal.toLowerCase());
      });
    });

    // Sorting
    if (sortColumn) {
      const col = initialColumns.find((c) => c.key === sortColumn);
      if (col) {
        result.sort((a, b) => {
          const valA = col.accessorKey
            ? typeof col.accessorKey === 'function'
              ? col.accessorKey(a)
              : a[col.accessorKey]
            : a[sortColumn];
          const valB = col.accessorKey
            ? typeof col.accessorKey === 'function'
              ? col.accessorKey(b)
              : b[col.accessorKey]
            : b[sortColumn];

          if (valA === valB) return 0;
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;

          const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
          return sortDirection === 'asc' ? comp : -comp;
        });
      }
    }

    return result;
  }, [data, searchQuery, columnFilters, sortColumn, sortDirection, initialColumns]);

  const totalItems = totalRecords !== undefined ? totalRecords : filteredData.length;
  const isServerPaginated = !!onPageChange;

  const paginatedData = useMemo(() => {
    if (isServerPaginated) return filteredData;
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, isServerPaginated, page, pageSize]);

  const visibleColumns = useMemo(
    () => initialColumns.filter((col) => columnVisibility[col.key] !== false),
    [initialColumns, columnVisibility]
  );

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectedRowIds.size === paginatedData.length) {
      setSelectedRowIds(new Set());
    } else {
      const allIds = new Set(paginatedData.map((row, i) => keyExtractor(row, i)));
      setSelectedRowIds(allIds);
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedRowIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRowIds(next);
  };

  // Export functions
  const handleExportCSV = () => {
    const exportRows = filteredData.map((row) => {
      const obj: Record<string, any> = {};
      visibleColumns.forEach((col) => {
        const val = col.accessorKey
          ? typeof col.accessorKey === 'function'
            ? col.accessorKey(row)
            : row[col.accessorKey]
          : row[col.key];
        obj[col.header] = val;
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${exportFilename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="space-y-4 font-body">
      {/* Header Bar */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-xl font-bold dark:text-white text-slate-800 tracking-tight font-display">{title}</h2>}
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Grid Controls Toolbar */}
      <div className="p-3 rounded-2xl border dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Bulk Actions Dropdown */}
          {bulkActions.length > 0 && selectedRowIds.size > 0 && (
            <div className="flex items-center gap-1.5 bg-accent-violet/10 px-3 py-1.5 rounded-xl border border-accent-violet/20">
              <span className="text-xs font-bold text-accent-violet">{selectedRowIds.size} selected</span>
              {bulkActions.map((act) => (
                <button
                  key={act.action}
                  onClick={() => {
                    const selectedRows = paginatedData.filter((r, i) => selectedRowIds.has(keyExtractor(r, i)));
                    onBulkAction?.(act.action, selectedRows);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-accent-violet text-white hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  {act.icon}
                  {act.label}
                </button>
              ))}
            </div>
          )}

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
              showFilterDrawer
                ? 'border-accent-violet text-accent-violet bg-accent-violet/10'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Filter size={14} />
            Filters
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Column Filter Panel */}
      {showFilterDrawer && (
        <div className="p-4 rounded-2xl border dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Column Filters & Visibility</h4>
            <button
              onClick={() => setColumnFilters({})}
              className="text-xs font-semibold text-accent-violet hover:underline"
            >
              Reset Filters
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {initialColumns.map((col) => (
              <div key={col.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  <span>{col.header}</span>
                  <button
                    onClick={() => toggleColumnVisibility(col.key)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    title={columnVisibility[col.key] !== false ? 'Hide column' : 'Show column'}
                  >
                    {columnVisibility[col.key] !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </div>
                {col.filterable !== false && (
                  col.filterType === 'select' && col.filterOptions ? (
                    <select
                      value={columnFilters[col.key] || ''}
                      onChange={(e) => setColumnFilters({ ...columnFilters, [col.key]: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white"
                    >
                      <option value="">All</option>
                      {col.filterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={`Filter ${col.header}...`}
                      value={columnFilters[col.key] || ''}
                      onChange={(e) => setColumnFilters({ ...columnFilters, [col.key]: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white"
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table View */}
      <div className="overflow-x-auto rounded-2xl border dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 dark:bg-zinc-950/80 uppercase text-[10px] tracking-wider text-zinc-500 font-bold border-b dark:border-zinc-800">
            <tr>
              {bulkActions.length > 0 && (
                <th className="px-4 py-3 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-zinc-400 hover:text-white">
                    {selectedRowIds.size === paginatedData.length && paginatedData.length > 0 ? (
                      <CheckSquare size={14} className="text-accent-violet" />
                    ) : (
                      <Square size={14} />
                    )}
                  </button>
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold ${col.sortable !== false ? 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-white' : ''}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <ArrowUpDown size={12} className={sortColumn === col.key ? 'text-accent-violet' : 'text-zinc-500'} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {bulkActions.length > 0 && <td className="px-4 py-3.5"><div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800 mx-auto" /></td>}
                  {visibleColumns.map((c) => (
                    <td key={c.key} className="px-4 py-3.5"><div className="h-4 rounded bg-zinc-200 dark:bg-zinc-800 w-3/4" /></td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (bulkActions.length > 0 ? 1 : 0)} className="py-12 text-center text-zinc-400 font-medium">
                  No records found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowId = keyExtractor(row, index);
                const isSelected = selectedRowIds.has(rowId);
                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/40 ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${isSelected ? 'bg-accent-violet/5' : ''}`}
                  >
                    {bulkActions.length > 0 && (
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => handleSelectRow(rowId, e)} className="text-zinc-400 hover:text-white">
                          {isSelected ? <CheckSquare size={14} className="text-accent-violet" /> : <Square size={14} />}
                        </button>
                      </td>
                    )}
                    {visibleColumns.map((col) => {
                      const val = col.cell
                        ? col.cell(row, index)
                        : col.accessorKey
                        ? typeof col.accessorKey === 'function'
                          ? col.accessorKey(row)
                          : row[col.accessorKey]
                        : row[col.key];

                      return (
                        <td key={col.key} className="px-4 py-3 font-medium">
                          {val !== undefined && val !== null ? val : '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 px-2 py-1">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white font-semibold"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>
            Showing {totalItems === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalItems)} of {totalItems} entries
          </span>
        </div>

        {/* Page Nav Controls */}
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-3 font-bold text-slate-800 dark:text-white">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
