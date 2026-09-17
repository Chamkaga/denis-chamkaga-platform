import React, { useState } from 'react';
import type { ColumnDef } from '../../../components/admin/EnterpriseDataGrid';
import { EnterpriseDataGrid } from '../../../components/admin/EnterpriseDataGrid';
import { Link as LinkIcon } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { PaymentLinkModal } from '../../../components/admin/PaymentLinkModal';

interface PaymentLinkItem {
  id: string;
  code: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  status: 'active' | 'paid' | 'expired' | 'cancelled';
  paymentMethod?: string;
  expiresAt: string;
  createdAt: string;
  source: any;
}

export const PaymentLinksTab: React.FC<{ invoices?: any[] }> = ({ invoices = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const paymentLinks: PaymentLinkItem[] = invoices.map((invoice) => ({
    id: invoice.id,
    code: invoice.invoiceNumber,
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.organization?.name || invoice.clientName || 'Customer',
    amount: Number(invoice.balanceDue ?? invoice.totalAmount ?? 0),
    currency: invoice.currency || 'TZS',
    status: Number(invoice.balanceDue ?? 0) <= 0 ? 'paid' : 'active',
    expiresAt: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—',
    createdAt: invoice.createdAt,
    source: invoice,
  }));

  const openGenerateModal = (invoice: any) => {
    setSelectedDoc({
      id: invoice.id,
      number: invoice.invoiceNumber,
      clientName: invoice.organization?.name || invoice.clientName,
      clientEmail: invoice.organization?.email || invoice.clientEmail,
      clientPhone: invoice.organization?.phone || invoice.clientPhone,
      amount: Number(invoice.balanceDue ?? invoice.totalAmount ?? 0),
      currency: invoice.currency || 'TZS'
    });
    setIsModalOpen(true);
  };

  const columns: ColumnDef<PaymentLinkItem>[] = [
    {
      key: 'code',
      header: 'Link Code',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-violet/10 text-accent-violet">
            <LinkIcon size={14} />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-white font-mono">{row.code}</div>
            <div className="text-[10px] text-zinc-400">Invoice: {row.invoiceNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'clientName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-slate-800 dark:text-white font-mono">
          {row.currency} {row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Paid', value: 'paid' },
        { label: 'Expired', value: 'expired' },
      ],
      cell: (row) => {
        const badgeStyle =
          row.status === 'paid'
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            : row.status === 'active'
            ? 'bg-accent-violet/10 text-accent-violet border-accent-violet/20'
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20';

        return (
          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider ${badgeStyle}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'expiresAt',
      header: 'Expiry Date',
      sortable: true,
      cell: (row) => <span className="text-zinc-500 font-mono text-[11px]">{row.expiresAt}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      cell: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="xs" onClick={() => openGenerateModal(row.source)} disabled={row.status === 'paid'}>
            {row.status === 'paid' ? 'Paid' : 'Generate secure link'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <EnterpriseDataGrid
        title="Payment Links Directory"
        subtitle="Manage and track generated customer checkout links"
        columns={columns}
        data={paymentLinks}
        exportFilename="payment_links"
      />

      <PaymentLinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoiceOrQuote={selectedDoc}
      />
    </div>
  );
};
