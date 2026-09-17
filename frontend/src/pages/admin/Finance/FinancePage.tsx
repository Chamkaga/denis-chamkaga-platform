import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../services/api';
import { useSearchParams } from 'react-router-dom';
import {
  DollarSign, FileText, FileCheck, Receipt, ArrowLeftRight, TrendingUp, BarChart3, Link as LinkIcon, Settings
} from 'lucide-react';
import type { ColumnDef } from '../../../components/admin/EnterpriseDataGrid';
import { EnterpriseDataGrid } from '../../../components/admin/EnterpriseDataGrid';
import { PaymentLinkModal } from '../../../components/admin/PaymentLinkModal';
import { FinanceDashboardTab } from './FinanceDashboardTab';
import { PaymentLinksTab } from './PaymentLinksTab';
import { TransactionsTab } from './TransactionsTab';
import { ExpensesTab } from './ExpensesTab';
import { ReceiptsTab } from './ReceiptsTab';
import { ReportsTab } from './ReportsTab';
import { TenantConfigTab } from './TenantConfigTab';

export const FinancePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<any | null>(null);

  // Sync tab from query param if available (?sub=invoices)
  useEffect(() => {
    const sub = searchParams.get('sub');
    if (sub) {
      if (sub === 'tenant' || sub === 'settings') setActiveTab('settings');
      else if (sub === 'payment_links' || sub === 'payment-links') setActiveTab('payment-links');
      else setActiveTab(sub);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: 'finance', sub: tabKey });
  };

  // Queries
  const { data: quotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ['admin-quotes'],
    queryFn: () => adminApi.getQuotations(),
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: () => adminApi.getInvoices(),
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminApi.getPayments(),
  });

  const { data: tenant } = useQuery({
    queryKey: ['admin-tenant'],
    queryFn: () => adminApi.getTenantConfig(),
  });

  // Quotation Columns
  const quoteColumns: ColumnDef<any>[] = [
    {
      key: 'quotationNumber',
      header: 'Quote Number',
      cell: (row) => (
        <div className="font-bold text-slate-800 dark:text-white font-mono flex items-center gap-1.5">
          <FileText size={14} className="text-accent-violet" />
          {row.quotationNumber}
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Organization',
      cell: (row) => <span className="font-medium">{row.organization?.name || '—'}</span>,
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      sortable: true,
      cell: (row) => (
        <span className="font-bold font-mono text-slate-800 dark:text-white">
          {row.currency} {row.totalAmount?.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      filterable: true,
      cell: (row) => (
        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase bg-blue-500/10 text-blue-500 border-blue-500/20">
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      cell: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setPaymentModalInvoice({ id: row.id, number: row.quotationNumber, clientName: row.organization?.name, amount: row.totalAmount, currency: row.currency })}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-accent-violet/10 text-accent-violet hover:bg-accent-violet hover:text-white transition-colors flex items-center gap-1"
          >
            <LinkIcon size={12} />
            Payment Link
          </button>
        </div>
      ),
    },
  ];

  // Invoice Columns
  const invoiceColumns: ColumnDef<any>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice Number',
      cell: (row) => (
        <div className="font-bold text-slate-800 dark:text-white font-mono flex items-center gap-1.5">
          <FileCheck size={14} className="text-emerald-500" />
          {row.invoiceNumber}
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Customer',
      cell: (row) => <span className="font-medium">{row.organization?.name || '—'}</span>,
    },
    {
      key: 'total',
      header: 'Total Amount',
      sortable: true,
      cell: (row) => (
        <span className="font-bold font-mono text-slate-800 dark:text-white">
          {row.currency} {row.total?.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      filterable: true,
      cell: (row) => {
        const isPaid = row.status === 'paid';
        return (
          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase ${isPaid ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Payment Actions',
      sortable: false,
      cell: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setPaymentModalInvoice({ id: row.id, number: row.invoiceNumber, clientName: row.organization?.name, amount: row.total, currency: row.currency })}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-accent-violet/10 text-accent-violet hover:bg-accent-violet hover:text-white transition-colors flex items-center gap-1"
          >
            <LinkIcon size={12} />
            Generate Link
          </button>
        </div>
      ),
    },
  ];

  // Payment History Columns
  const paymentColumns: ColumnDef<any>[] = [
    { key: 'reference', header: 'Reference', cell: (row) => <span className="font-mono font-bold text-slate-800 dark:text-white">{row.reference || row.id}</span> },
    { key: 'method', header: 'Method', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, cell: (row) => <span className="font-bold font-mono text-emerald-500">{row.currency} {row.amount?.toLocaleString()}</span> },
    { key: 'createdAt', header: 'Date', sortable: true, cell: (row) => <span className="font-mono text-zinc-500 text-[11px]">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ];

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={15} /> },
    { key: 'quotes', label: 'Quotations', icon: <FileText size={15} /> },
    { key: 'invoices', label: 'Invoices', icon: <FileCheck size={15} /> },
    { key: 'payment-links', label: 'Payment Links', icon: <LinkIcon size={15} /> },
    { key: 'payments', label: 'Payments', icon: <DollarSign size={15} /> },
    { key: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={15} /> },
    { key: 'expenses', label: 'Expenses', icon: <Receipt size={15} /> },
    { key: 'receipts', label: 'Receipts', icon: <FileCheck size={15} /> },
    { key: 'reports', label: 'Reports', icon: <TrendingUp size={15} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={15} /> },
  ];

  return (
    <div className="space-y-6 text-left font-body">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white font-display tracking-tight flex items-center gap-2">
            <DollarSign className="text-accent-violet" size={28} />
            Finance & Accounting ERP
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Complete enterprise financial operating system • Quotations, Invoices, Payment Links & Analytics
          </p>
        </div>
      </div>

      {/* Horizontal Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-accent-violet text-white shadow-md shadow-accent-violet/20'
                : 'text-zinc-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      {activeTab === 'dashboard' && <FinanceDashboardTab invoices={invoices} quotes={quotes} payments={payments} />}

      {activeTab === 'quotes' && (
        <EnterpriseDataGrid
          title="Quotations Register"
          subtitle="Manage client proposal quotes and commercial estimates"
          columns={quoteColumns}
          data={quotes}
          isLoading={quotesLoading}
          exportFilename="quotations"
        />
      )}

      {activeTab === 'invoices' && (
        <EnterpriseDataGrid
          title="Invoices Vault"
          subtitle="Issued billing statements and payment checkout generator"
          columns={invoiceColumns}
          data={invoices}
          isLoading={invoicesLoading}
          exportFilename="invoices"
        />
      )}

      {activeTab === 'payment-links' && <PaymentLinksTab invoices={invoices} />}
      {activeTab === 'payments' && (
        <EnterpriseDataGrid
          title="Payments History"
          subtitle="Record of settled invoice payments and direct transactions"
          columns={paymentColumns}
          data={payments}
          isLoading={paymentsLoading}
          exportFilename="payments_history"
        />
      )}

      {activeTab === 'transactions' && <TransactionsTab payments={payments} />}
      {activeTab === 'expenses' && <ExpensesTab />}
      {activeTab === 'receipts' && <ReceiptsTab payments={payments} />}
      {activeTab === 'reports' && <ReportsTab />}
      {activeTab === 'settings' && <TenantConfigTab tenant={tenant} />}

      {/* Payment Link Modal */}
      <PaymentLinkModal
        isOpen={!!paymentModalInvoice}
        onClose={() => setPaymentModalInvoice(null)}
        invoiceOrQuote={paymentModalInvoice}
      />
    </div>
  );
};

export default FinancePage;
