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

export const ReceiptsTab: React.FC<{ payments?: any[] }> = ({ payments = [] }) => {
  const { toast } = useToast();
  const receipts: ReceiptItem[] = payments
    .filter((payment) => payment.status === 'successful')
    .map((payment) => ({
      id: payment.id,
      receiptNumber: payment.receipt?.receiptNumber || payment.paymentNumber,
      invoiceNumber: payment.invoice?.invoiceNumber || '—',
      clientName: payment.invoice?.organization?.name || payment.payerName || 'Customer',
      amount: Number(payment.amount),
      currency: payment.currency || 'TZS',
      paidAt: new Date(payment.paymentDate || payment.createdAt).toLocaleString(),
      paymentMethod: payment.paymentMethod || payment.gatewayName || 'DPO',
    }));

  const handleDownloadPDF = (receipt: ReceiptItem) => {
    toast.info(`Downloading official PDF receipt ${receipt.receiptNumber}...`, 'PDF Download');
    window.open(`/api/admin/finance/receipts/${encodeURIComponent(receipt.receiptNumber)}/pdf`, '_blank', 'noopener,noreferrer');
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
        data={receipts}
        exportFilename="payment_receipts"
      />
    </div>
  );
};
