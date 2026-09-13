import React from 'react';
import type { ColumnDef } from '../../../components/admin/EnterpriseDataGrid';
import { EnterpriseDataGrid } from '../../../components/admin/EnterpriseDataGrid';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionItem {
  id: string;
  txId: string;
  reference: string;
  type: 'inflow' | 'outflow';
  category: string;
  amount: number;
  currency: string;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

const mockTransactions: TransactionItem[] = [
  { id: 'tx-1', txId: 'TXN-998231', reference: 'INV-2026-015 Payment', type: 'inflow', category: 'Client Invoice', amount: 850000, currency: 'TZS', method: 'M-Pesa Gateway', status: 'completed', date: '2026-07-28 14:22' },
  { id: 'tx-2', txId: 'TXN-998230', reference: 'AWS Cloud Hosting', type: 'outflow', category: 'Infrastructure', amount: 320000, currency: 'TZS', method: 'Visa Card', status: 'completed', date: '2026-07-27 09:10' },
  { id: 'tx-3', txId: 'TXN-998229', reference: 'INV-2026-014 Payment', type: 'inflow', category: 'Consultation Fee', amount: 500000, currency: 'TZS', method: 'CRDB Direct', status: 'completed', date: '2026-07-25 11:45' },
  { id: 'tx-4', txId: 'TXN-998228', reference: 'Software Subscriptions', type: 'outflow', category: 'SaaS Software', amount: 150000, currency: 'TZS', method: 'MasterCard', status: 'completed', date: '2026-07-24 16:30' },
];

export const TransactionsTab: React.FC = () => {
  const columns: ColumnDef<TransactionItem>[] = [
    {
      key: 'txId',
      header: 'Transaction ID',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${row.type === 'inflow' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
            {row.type === 'inflow' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-white font-mono">{row.txId}</div>
            <div className="text-[10px] text-zinc-400">{row.reference}</div>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'method', header: 'Method', sortable: true },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      cell: (row) => (
        <span className={`font-bold font-mono ${row.type === 'inflow' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
          {row.type === 'inflow' ? '+' : '-'} {row.currency} {row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
          {row.status}
        </span>
      ),
    },
    { key: 'date', header: 'Date & Time', sortable: true, cell: (row) => <span className="font-mono text-zinc-500 text-[11px]">{row.date}</span> },
  ];

  return (
    <div className="space-y-4">
      <EnterpriseDataGrid
        title="Financial Transactions Ledger"
        subtitle="Complete immutable log of all incoming and outgoing financial transactions"
        columns={columns}
        data={mockTransactions}
        exportFilename="transactions_ledger"
      />
    </div>
  );
};
