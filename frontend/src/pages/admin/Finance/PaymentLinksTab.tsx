import React, { useState } from 'react';
import type { ColumnDef } from '../../../components/admin/EnterpriseDataGrid';
import { EnterpriseDataGrid } from '../../../components/admin/EnterpriseDataGrid';
import { Link as LinkIcon, Copy, ExternalLink, Plus } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { useToast } from '../../../components/atoms/Toast';
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
  url: string;
}

const mockPaymentLinks: PaymentLinkItem[] = [
  {
    id: 'link-1',
    code: '8X4K-21KD',
    invoiceNumber: 'INV-2026-015',
    clientName: 'Azam Media Ltd',
    amount: 850000,
    currency: 'TZS',
    status: 'paid',
    paymentMethod: 'M-Pesa',
    expiresAt: '2026-08-15',
    createdAt: '2026-07-28',
    url: 'http://localhost:5173/pay/INV-2026-015',
  },
  {
    id: 'link-2',
    code: 'INV-2026-016',
    invoiceNumber: 'INV-2026-016',
    clientName: 'CRDB Bank Plc',
    amount: 3500000,
    currency: 'TZS',
    status: 'active',
    expiresAt: '2026-08-07',
    createdAt: '2026-07-30',
    url: 'http://localhost:5173/pay/INV-2026-016',
  },
  {
    id: 'link-3',
    code: 'PL-9921',
    invoiceNumber: 'INV-2026-012',
    clientName: 'Vodacom Tanzania',
    amount: 1200000,
    currency: 'TZS',
    status: 'active',
    expiresAt: '2026-08-05',
    createdAt: '2026-07-25',
    url: 'http://localhost:5173/pay/PL-9921',
  },
];

export const PaymentLinksTab: React.FC = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Payment Link copied to clipboard!', 'Copied');
  };

  const openGenerateModal = () => {
    setSelectedDoc({
      id: 'inv-new',
      number: 'INV-2026-020',
      clientName: 'Azam Media Ltd',
      amount: 1500000,
      currency: 'TZS'
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
          <button
            onClick={() => handleCopy(row.url)}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-accent-violet hover:border-accent-violet transition-colors"
            title="Copy Link"
          >
            <Copy size={13} />
          </button>
          <a
            href={row.url}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-500 transition-colors"
            title="Preview Link"
          >
            <ExternalLink size={13} />
          </a>
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
        data={mockPaymentLinks}
        actions={
          <Button variant="primary" size="sm" onClick={openGenerateModal} leftIcon={<Plus size={14} />}>
            Generate Payment Link
          </Button>
        }
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

