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

export const TransactionsTab: React.FC<{ payments?: any[] }> = ({ payments = [] }) => {
  const transactions: TransactionItem[] = payments.map((payment) => ({
    id: payment.id,
    txId: payment.gatewayReference || payment.paymentNumber,
    reference: payment.invoice?.invoiceNumber ? `${payment.invoice.invoiceNumber} Payment` : payment.paymentNumber,
    type: 'inflow',
    category: payment.paymentType === 'support' ? 'Support Contribution' : 'Client Invoice',
    amount: Number(payment.amount),
    currency: payment.currency || 'TZS',
    method: payment.paymentMethod || payment.gatewayName || 'DPO',
    status: payment.status === 'successful' ? 'completed' : payment.status === 'failed' ? 'failed' : 'pending',
    date: new Date(payment.paymentDate || payment.createdAt).toLocaleString(),
  }));
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
        data={transactions}
        exportFilename="transactions_ledger"
      />
    </div>
  );
};
