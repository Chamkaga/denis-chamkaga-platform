import React from 'react';
import type { ColumnDef } from '../../../components/admin/EnterpriseDataGrid';
import { EnterpriseDataGrid } from '../../../components/admin/EnterpriseDataGrid';
import { FileCheck, Download } from 'lucide-react';
import { useToast } from '../../../components/atoms/Toast';

interface ReceiptItem {
  id: string;
  receiptNumber: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  paidAt: string;
  paymentMethod: string;
}

const mockReceipts: ReceiptItem[] = [
  { id: 'rcpt-1', receiptNumber: 'RCPT-2026-004', invoiceNumber: 'INV-2026-015', clientName: 'Azam Media Ltd', amount: 850000, currency: 'TZS', paidAt: '2026-07-28 14:22', paymentMethod: 'M-Pesa Gateway' },
  { id: 'rcpt-2', receiptNumber: 'RCPT-2026-003', invoiceNumber: 'INV-2026-014', clientName: 'CRDB Bank Plc', amount: 500000, currency: 'TZS', paidAt: '2026-07-25 11:45', paymentMethod: 'CRDB Direct' },
  { id: 'rcpt-3', receiptNumber: 'RCPT-2026-002', invoiceNumber: 'INV-2026-011', clientName: 'Vodacom Tanzania', amount: 1200000, currency: 'TZS', paidAt: '2026-07-15 10:12', paymentMethod: 'Airtel Money' },
];

export const ReceiptsTab: React.FC = () => {
  const { toast } = useToast();

  const handleDownloadPDF = (receipt: ReceiptItem) => {
    toast.info(`Generating official PDF receipt ${receipt.receiptNumber}...`, 'PDF Download');
    // Triggers download window print or PDF download
    window.print();
  };

  const columns: ColumnDef<ReceiptItem>[] = [
    {
      key: 'receiptNumber',
      header: 'Receipt No.',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <FileCheck size={14} />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-white font-mono">{row.receiptNumber}</div>
            <div className="text-[10px] text-zinc-400">Invoice: {row.invoiceNumber}</div>
          </div>
        </div>
      ),
    },
    { key: 'clientName', header: 'Customer', sortable: true },
    {
      key: 'amount',
      header: 'Amount Paid',
      sortable: true,
      cell: (row) => <span className="font-bold font-mono text-emerald-500">{row.currency} {row.amount.toLocaleString()}</span>,
    },
    { key: 'paymentMethod', header: 'Payment Channel', sortable: true },
    { key: 'paidAt', header: 'Payment Date', sortable: true, cell: (row) => <span className="font-mono text-zinc-500 text-[11px]">{row.paidAt}</span> },
    {
      key: 'actions',
      header: 'Receipt PDF',
      sortable: false,
      cell: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleDownloadPDF(row)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-accent-violet hover:text-white transition-colors flex items-center gap-1"
          >
            <Download size={12} />
            Download PDF
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <EnterpriseDataGrid
        title="Official Payment Receipts"
        subtitle="Automated PDF receipt vault issued for settled client invoices"
        columns={columns}
        data={mockReceipts}
        exportFilename="payment_receipts"
      />
    </div>
  );
};
