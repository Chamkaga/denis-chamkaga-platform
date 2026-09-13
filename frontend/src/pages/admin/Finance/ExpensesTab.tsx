import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../services/api';
import type { ColumnDef } from '../../../components/admin/EnterpriseDataGrid';
import { EnterpriseDataGrid } from '../../../components/admin/EnterpriseDataGrid';
import { Receipt, Plus, X } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { useToast } from '../../../components/atoms/Toast';

interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  vendor: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'reimbursed';
  date?: string;
  createdAt?: string;
}

const fallbackExpenses: ExpenseItem[] = [
  { id: 'exp-1', title: 'Domain Renewals & SSL', category: 'Infrastructure', vendor: 'Namecheap', amount: 140000, currency: 'TZS', status: 'paid', date: '2026-07-20' },
  { id: 'exp-2', title: 'OpenAI API Token Top-up', category: 'AI Services', vendor: 'OpenAI Platform', amount: 250000, currency: 'TZS', status: 'paid', date: '2026-07-18' },
  { id: 'exp-3', title: 'Office Internet Fiber', category: 'Utilities', vendor: 'TTCL Fiber', amount: 180000, currency: 'TZS', status: 'paid', date: '2026-07-05' },
];

export const ExpensesTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'Operational',
    vendor: '',
    amount: 100000,
    currency: 'TZS',
  });

  const { data: realExpenses = [], isLoading } = useQuery({
    queryKey: ['admin-expenses'],
    queryFn: () => adminApi.getExpenses(),
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => adminApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-expenses'] });
      setIsAddModalOpen(false);
      toast.success('Expense recorded and posted to ledger.', 'Expense Recorded');
    },
    onError: () => toast.error('Failed to record expense.', 'Error'),
  });

  const expensesData = realExpenses.length > 0 ? realExpenses : fallbackExpenses;

  const columns: ColumnDef<ExpenseItem>[] = [
    {
      key: 'title',
      header: 'Expense Item',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Receipt size={14} />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-white">{row.title}</div>
            <div className="text-[10px] text-zinc-400">Vendor: {row.vendor || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category', sortable: true },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      cell: (row) => <span className="font-bold font-mono text-slate-800 dark:text-white">{row.currency || 'TZS'} {row.amount?.toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
          {row.status || 'PAID'}
        </span>
      ),
    },
    { key: 'date', header: 'Date', sortable: true, cell: (row) => <span className="font-mono text-zinc-500 text-[11px]">{row.date || (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—')}</span> },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createExpenseMutation.mutate(form);
  };

  return (
    <div className="space-y-4">
      <EnterpriseDataGrid
        title="Expense Tracker & Outflows"
        subtitle="Manage business expenditure, vendor bills, and operational expenses"
        columns={columns}
        data={expensesData}
        isLoading={isLoading}
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus size={14} />}>
            Record Expense
          </Button>
        }
        exportFilename="business_expenses"
      />

      {/* Record Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 text-left font-body">
            <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-slate-800 dark:text-white font-display">Record Business Expense</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Expense Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
                  placeholder="e.g. AWS Cloud Server Infrastructure"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Vendor / Payee</label>
                <input
                  type="text"
                  required
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
                  placeholder="e.g. Amazon Web Services"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="AI Services">AI Services</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Operational">Operational</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Amount (TZS)</label>
                  <input
                    type="number"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" fullWidth isLoading={createExpenseMutation.isPending} className="mt-2">
                Post to Financial Ledger
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

