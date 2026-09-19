import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useSearchParams } from 'react-router-dom';
import {
  Users, Handshake, Video, Lightbulb, Compass, Megaphone,
  Clock, Plus, Trash2, Edit2,
  Download, Play, BookOpen
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { AdminModal, FormField, inputCls, selectCls } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useToast } from '../../components/atoms/Toast';

// Utility for CSS joining
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

// ─── 1. BUSINESS ADMIN PAGE ──────────────────────────────────────────────────
export const BusinessAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'crm' | 'finance'>('crm');
  const [crmSubTab, setCrmSubTab] = useState<'leads' | 'orgs' | 'contacts' | 'meetings' | 'timeline' | 'calls'>('leads');
  const [financeSubTab, setFinanceSubTab] = useState<'quotes' | 'invoices' | 'payments' | 'tenant'>('quotes');

  // Deep-link: read ?tab=finance&sub=invoices from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const subParam = searchParams.get('sub');
    if (tabParam === 'finance') {
      setActiveTab('finance');
      if (subParam === 'invoices') setFinanceSubTab('invoices');
      else if (subParam === 'payments') setFinanceSubTab('payments');
      else if (subParam === 'tenant') setFinanceSubTab('tenant');
      else setFinanceSubTab('quotes');
    } else if (tabParam === 'crm') {
      setActiveTab('crm');
      if (subParam === 'contacts') setCrmSubTab('contacts');
      else if (subParam === 'orgs') setCrmSubTab('orgs');
      else if (subParam === 'meetings') setCrmSubTab('meetings');
      else if (subParam === 'timeline') setCrmSubTab('timeline');
      else if (subParam === 'calls') setCrmSubTab('calls');
      else setCrmSubTab('leads');
    }
  }, [searchParams]);

  // Modals management
  const [activeModal, setActiveModal] = useState<string | null>(null); // 'convert_lead' | 'create_org' | 'create_client' | 'create_consultation' | 'create_quote' | 'pay_invoice' | 'credit_note' | 'edit_tenant'
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [callsSearch, setCallsSearch] = useState('');

  // Queries
  const { data: leads, isLoading: leadsLoading } = useQuery({ queryKey: ['admin-leads'], queryFn: () => adminApi.getLeads() });
  const { data: orgs, isLoading: orgsLoading } = useQuery({ queryKey: ['admin-orgs'], queryFn: () => adminApi.getOrganizations() });
  const { data: clients, isLoading: clientsLoading } = useQuery({ queryKey: ['admin-clients'], queryFn: () => adminApi.getOrgClients() });
  const { data: consultations, isLoading: consultsLoading } = useQuery({ queryKey: ['admin-consultations'], queryFn: () => adminApi.getConsultations() });
  const { data: timeline, isLoading: timelineLoading } = useQuery({ queryKey: ['admin-timeline'], queryFn: () => adminApi.getTimeline() });
  const { data: calls, isLoading: callsLoading } = useQuery({ queryKey: ['admin-calls', callsSearch], queryFn: () => adminApi.getCalls(callsSearch) });

  const { data: quotes, isLoading: quotesLoading } = useQuery({ queryKey: ['admin-quotes'], queryFn: () => adminApi.getQuotations() });
  const { data: invoices, isLoading: invoicesLoading } = useQuery({ queryKey: ['admin-invoices'], queryFn: () => adminApi.getInvoices() });
  const { data: payments, isLoading: paymentsLoading } = useQuery({ queryKey: ['admin-payments'], queryFn: () => adminApi.getPayments() });
  const { data: tenant, isLoading: tenantLoading } = useQuery({ queryKey: ['admin-tenant'], queryFn: () => adminApi.getTenantConfig() });

  // Standard refetch helpers
  const invalidateCRM = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
    queryClient.invalidateQueries({ queryKey: ['admin-orgs'] });
    queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
    queryClient.invalidateQueries({ queryKey: ['admin-consultations'] });
    queryClient.invalidateQueries({ queryKey: ['admin-timeline'] });
  };

  const invalidateFinance = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
    queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    queryClient.invalidateQueries({ queryKey: ['admin-tenant'] });
    queryClient.invalidateQueries({ queryKey: ['admin-timeline'] });
  };

  // Mutations
  const convertLeadMutation = useMutation({
    mutationFn: ({ id, payload }: any) => adminApi.convertLead(id, payload),
    onSuccess: () => { invalidateCRM(); setActiveModal(null); setSelectedEntity(null); }
  });

  const createOrgMutation = useMutation({
    mutationFn: (d: any) => adminApi.createOrganization(d),
    onSuccess: () => { invalidateCRM(); setActiveModal(null); }
  });

  const createClientMutation = useMutation({
    mutationFn: (d: any) => adminApi.createOrgClient(d),
    onSuccess: () => { invalidateCRM(); setActiveModal(null); }
  });

  const createConsultationMutation = useMutation({
    mutationFn: (d: any) => adminApi.createConsultation(d),
    onSuccess: () => { invalidateCRM(); setActiveModal(null); }
  });

  const createQuoteMutation = useMutation({
    mutationFn: (d: any) => adminApi.createQuotation(d),
    onSuccess: () => { invalidateFinance(); setActiveModal(null); }
  });

  const approveQuoteMutation = useMutation({
    mutationFn: ({ id, payload }: any) => adminApi.approveQuotation(id, payload),
    onSuccess: () => { invalidateFinance(); invalidateCRM(); }
  });

  const emailInvoiceMutation = useMutation({
    mutationFn: (id: string) => adminApi.emailInvoice(id),
    onSuccess: () => toast.success('Invoice emailed to client successfully.', 'Emailed'),
    onError: () => toast.error('Failed to send invoice email.', 'Send Failed'),
  });

  const emailQuoteMutation = useMutation({
    mutationFn: (id: string) => adminApi.emailQuotation(id),
    onSuccess: () => toast.success('Quotation prepared and emailed successfully.', 'Emailed'),
    onError: () => toast.error('Failed to send quotation email.', 'Send Failed'),
  });

  const revokeTokenMutation = useMutation({
    mutationFn: (token: string) => adminApi.revokeAccessToken(token),
    onSuccess: () => { toast.success('Access token link revoked.', 'Revoked'); invalidateFinance(); },
    onError: () => toast.error('Failed to revoke access token.', 'Revoke Failed'),
  });

  const payInvoiceMutation = useMutation({
    mutationFn: ({ id, payload }: any) => adminApi.createPayment(id, payload),
    onSuccess: () => { invalidateFinance(); setActiveModal(null); }
  });

  const creditNoteMutation = useMutation({
    mutationFn: ({ id, payload }: any) => adminApi.createCreditNote(id, payload),
    onSuccess: () => { invalidateFinance(); setActiveModal(null); }
  });

  const updateTenantMutation = useMutation({
    mutationFn: (d: any) => adminApi.updateTenantConfig(d),
    onSuccess: () => { invalidateFinance(); setActiveModal(null); }
  });

  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  React.useEffect(() => {
    if (activeModal === 'view_analytics' && selectedEntity) {
      setAnalyticsLoading(true);
      adminApi.getAccessTokenAnalytics(selectedEntity.id)
        .then(res => setAnalyticsData(res || []))
        .catch(err => console.error(err))
        .finally(() => setAnalyticsLoading(false));
    }
  }, [activeModal, selectedEntity]);

  // Copy public secure quotation link
  const handleCopyQuoteLink = async (q: any) => {
    try {
      const res = await adminApi.generateAccessToken({ docId: q.id, docType: 'QUOTATION', expiresDays: 30 });
      const link = `${window.location.origin}/public/quotation/${res.token}`;
      await navigator.clipboard.writeText(link);
      toast.success('Secure quotation link copied to clipboard.', 'Link Copied');
    } catch (err) {
      toast.error('Failed to generate secure access link.', 'Error');
    }
  };

  // Copy WhatsApp Quotation template msg
  const handleWhatsAppQuote = async (q: any) => {
    try {
      const res = await adminApi.generateAccessToken({ docId: q.id, docType: 'QUOTATION', expiresDays: 30 });
      const link = `${window.location.origin}/public/quotation/${res.token}`;
      const msg = `Hello ${q.organization.name},\n\nYour quotation proposal ${q.quotationNumber} is ready. Review it securely here:\n\n${link}\n\nThank you.\nDenis Chamkaga`;
      await navigator.clipboard.writeText(msg);
      toast.success('WhatsApp message template copied! Opening WhatsApp...', 'Copied');
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (err) {
      toast.error('Failed to copy WhatsApp template.', 'Error');
    }
  };

  // Copy public secure invoice link
  const handleCopyInvoiceLink = async (inv: any) => {
    try {
      const res = await adminApi.generateAccessToken({ docId: inv.id, docType: 'INVOICE', expiresDays: 30 });
      const link = `${window.location.origin}/public/invoice/${res.token}`;
      await navigator.clipboard.writeText(link);
      toast.success('Secure invoice checkout link copied to clipboard.', 'Link Copied');
    } catch (err) {
      toast.error('Failed to generate secure checkout link.', 'Error');
    }
  };

  // Copy WhatsApp Invoice template msg
  const handleWhatsAppInvoice = async (inv: any) => {
    try {
      const res = await adminApi.generateAccessToken({ docId: inv.id, docType: 'INVOICE', expiresDays: 30 });
      const link = `${window.location.origin}/public/invoice/${res.token}`;
      const msg = `Hello ${inv.organization.name},\n\nYour invoice billing statement ${inv.invoiceNumber} is ready. Complete your payment checkout here:\n\n${link}\n\nThank you.\nDenis Chamkaga`;
      await navigator.clipboard.writeText(msg);
      toast.success('WhatsApp message template copied! Opening WhatsApp...', 'Copied');
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (err) {
      toast.error('Failed to copy WhatsApp template.', 'Error');
    }
  };

  // Modal Submit Handlers
  const handleConvertLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const createLogin = fd.get('createLogin') === 'true';
    convertLeadMutation.mutate({
      id: selectedEntity.id,
      payload: {
        organizationName: fd.get('organizationName'),
        address: fd.get('address'),
        contactRole: fd.get('contactRole'),
        createLogin,
        password: createLogin ? fd.get('password') : undefined
      }
    });
  };

  const handleCreateOrg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createOrgMutation.mutate({
      name: fd.get('name'),
      email: fd.get('email') || undefined,
      phone: fd.get('phone') || undefined,
      address: fd.get('address') || undefined,
      website: fd.get('website') || undefined,
      notes: fd.get('notes') || undefined,
    });
  };

  const handleCreateClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const createLogin = fd.get('createLogin') === 'true';
    createClientMutation.mutate({
      organizationId: fd.get('organizationId'),
      firstName: fd.get('firstName'),
      lastName: fd.get('lastName'),
      email: fd.get('email'),
      phone: fd.get('phone') || undefined,
      role: fd.get('role') || 'Representative',
      createLogin,
      password: createLogin ? fd.get('password') : undefined
    });
  };

  const handleCreateConsultation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createConsultationMutation.mutate({
      leadId: fd.get('leadId') || undefined,
      organizationId: fd.get('organizationId') || undefined,
      title: fd.get('title'),
      scheduledAt: new Date(fd.get('scheduledAt') as string),
      duration: fd.get('duration') ? +fd.get('duration')! : 60,
      notes: fd.get('notes') || undefined,
      recommendations: fd.get('recommendations') || undefined,
    });
  };

  const handleCreateQuote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createQuoteMutation.mutate({
      title: fd.get('title'),
      organizationId: fd.get('organizationId'),
      currency: fd.get('currency') || 'USD',
      taxRate: fd.get('taxRate') ? +fd.get('taxRate')! : 0,
      discountRate: fd.get('discountRate') ? +fd.get('discountRate')! : 0,
      validUntil: new Date(fd.get('validUntil') as string),
      notes: fd.get('notes') || undefined,
      terms: fd.get('terms') || undefined,
      items: [
        {
          description: fd.get('itemDesc') as string,
          quantity: fd.get('itemQty') ? +fd.get('itemQty')! : 1,
          unitPrice: fd.get('itemPrice') ? +fd.get('itemPrice')! : 0
        }
      ]
    });
  };

  const handlePayInvoice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    payInvoiceMutation.mutate({
      id: selectedEntity.id,
      payload: {
        amount: parseFloat(fd.get('amount') as string),
        method: fd.get('method'),
        reference: fd.get('reference') || undefined,
      }
    });
  };

  const handleCreditNote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    creditNoteMutation.mutate({
      id: selectedEntity.id,
      payload: {
        amount: parseFloat(fd.get('amount') as string),
        reason: fd.get('reason'),
      }
    });
  };

  const handleUpdateTenant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateTenantMutation.mutate({
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      address: fd.get('address'),
      vatNumber: fd.get('vatNumber'),
      taxRate: fd.get('taxRate') ? +fd.get('taxRate')! : 18.0
    });
  };



  return (
    <div className="space-y-6 text-left font-body">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white light:text-slate-800 flex items-center gap-2">
            <Users className="text-accent-violet" /> Business Operations
          </h1>
          <p className="text-sm text-zinc-500">Unified CRM pipeline database, Organization directory, and ERP financial ledger.</p>
        </div>

        {/* Global tab nav */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setActiveTab('crm')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all",
              activeTab === 'crm' ? "bg-accent-violet text-white shadow-sm" : "text-zinc-400 hover:text-white"
            )}
          >
            CRM Operations
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all",
              activeTab === 'finance' ? "bg-accent-violet text-white shadow-sm" : "text-zinc-400 hover:text-white"
            )}
          >
            ERP Accounting
          </button>
        </div>
      </div>

      {/* CRM operations section */}
      {activeTab === 'crm' && (
        <div className="space-y-6">
          {/* Sub tabs */}
          <div className="flex flex-wrap gap-2 border-b border-zinc-800/80 pb-3">
            {[
              { id: 'leads', label: 'Leads Pipeline', count: leads?.items?.length },
              { id: 'orgs', label: 'Companies Directory', count: orgs?.length },
              { id: 'contacts', label: 'Client Contacts', count: clients?.length },
              { id: 'meetings', label: 'Consultations Bookings', count: consultations?.length },
              { id: 'calls', label: 'Voice Calls & CIR', count: calls?.length },
              { id: 'timeline', label: 'Organization Chronology Feed' }
            ].map((t: any) => (
              <button
                key={t.id}
                onClick={() => setCrmSubTab(t.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border",
                  crmSubTab === t.id 
                    ? "bg-accent-violet/10 text-accent-violet border-accent-violet/25 font-bold" 
                    : "text-zinc-450 border-transparent hover:text-zinc-300"
                )}
              >
                {t.label} {t.count !== undefined && <span className="ml-1 text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full">{t.count}</span>}
              </button>
            ))}
          </div>

          {/* CRM Panels */}
          {crmSubTab === 'leads' && (
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
              <h2 className="text-sm font-bold dark:text-white">Active Lead Pipeline</h2>
              {leadsLoading ? (
                <div className="text-xs text-zinc-500 py-6">Loading pipeline...</div>
              ) : !leads?.items || leads.items.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 text-center">No active leads registered.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Lead Contact</th>
                        <th className="p-3">Source</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
                      {leads.items.map((l: any) => (
                        <tr key={l.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                          <td className="p-3">
                            <div className="font-semibold dark:text-white">{l.name}</div>
                            <div className="text-[10px] text-zinc-500">{l.email} | {l.phone || 'No phone'}</div>
                          </td>
                          <td className="p-3 uppercase text-[10px] font-semibold dark:text-zinc-400">{l.source}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 capitalize">{l.status}</span>
                          </td>
                          <td className="p-3 text-right">
                            {l.status !== 'won' && (
                              <Button 
                                size="xs" 
                                variant="primary" 
                                onClick={() => { setSelectedEntity(l); setActiveModal('convert_lead'); }}
                              >
                                Convert to Client
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {crmSubTab === 'orgs' && (
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold dark:text-white">Companies Directory</h2>
                <Button size="xs" variant="outline" leftIcon={<Plus size={12} />} onClick={() => setActiveModal('create_org')}>
                  Add Company
                </Button>
              </div>
              {orgsLoading ? (
                <div className="text-xs text-zinc-500 py-6">Loading directory...</div>
              ) : !orgs || orgs.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 text-center">No organizations registered yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Company Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Address</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
                      {orgs.map((org: any) => (
                        <tr key={org.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                          <td className="p-3 font-semibold dark:text-white">{org.name}</td>
                          <td className="p-3 dark:text-zinc-300 text-slate-700">{org.email || 'N/A'}</td>
                          <td className="p-3 dark:text-zinc-300 text-slate-700">{org.phone || 'N/A'}</td>
                          <td className="p-3 text-zinc-500">{org.address || 'N/A'}</td>
                          <td className="p-3 capitalize">{org.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {crmSubTab === 'contacts' && (
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold dark:text-white">Client Contacts</h2>
                <Button size="xs" variant="outline" leftIcon={<Plus size={12} />} onClick={() => setActiveModal('create_client')}>
                  Add Contact
                </Button>
              </div>
              {clientsLoading ? (
                <div className="text-xs text-zinc-500 py-6">Loading contacts...</div>
              ) : !clients || clients.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 text-center">No individual client contacts registered.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Organization</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Workspace Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
                      {clients.map((c: any) => (
                        <tr key={c.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                          <td className="p-3 font-semibold dark:text-white">
                            {c.firstName} {c.lastName}
                            <span className="text-[10px] text-zinc-500 block">{c.email}</span>
                          </td>
                          <td className="p-3 dark:text-zinc-350">{c.organization.name}</td>
                          <td className="p-3 text-zinc-500">{c.role}</td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${c.user ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                              {c.user ? 'Workspace Login Active' : 'Offline Contact'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {crmSubTab === 'meetings' && (
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold dark:text-white">Consultations Bookings</h2>
                <Button size="xs" variant="outline" leftIcon={<Plus size={12} />} onClick={() => setActiveModal('create_consultation')}>
                  Schedule Consultation
                </Button>
              </div>
              {consultsLoading ? (
                <div className="text-xs text-zinc-500 py-6">Loading consultations...</div>
              ) : !consultations || consultations.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 text-center">No consultation appointments booked.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Scheduled At</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Attendee Ref</th>
                        <th className="p-3">Recommendations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
                      {consultations.map((con: any) => (
                        <tr key={con.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                          <td className="p-3 font-semibold dark:text-white">
                            {new Date(con.scheduledAt).toLocaleString()}
                          </td>
                          <td className="p-3 dark:text-zinc-350">{con.title}</td>
                          <td className="p-3 text-zinc-550">
                            {con.lead ? `Lead: ${con.lead.name}` : con.organization ? `Company: ${con.organization.name}` : 'Generic'}
                          </td>
                          <td className="p-3 text-zinc-500 truncate max-w-xs">{con.recommendations || 'None written'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {crmSubTab === 'timeline' && (
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
              <h2 className="text-sm font-bold dark:text-white">Timeline Activity Logging</h2>
              {timelineLoading ? (
                <div className="text-xs text-zinc-500 py-6">Loading chronological stream...</div>
              ) : !timeline || timeline.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 text-center">No history timeline logged.</div>
              ) : (
                <div className="space-y-4 relative pl-4 border-l border-zinc-800">
                  {timeline.map((act: any) => (
                    <div key={act.id} className="space-y-1 relative">
                      <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-accent-violet border border-zinc-950" />
                      <div className="flex justify-between items-center text-[10px] text-zinc-500">
                        <span className="font-bold uppercase tracking-wider text-accent-violet">{act.action}</span>
                        <span>{new Date(act.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs dark:text-zinc-300 text-slate-700">{act.description}</p>
                      <span className="text-[9px] text-zinc-500 block">Operator: {act.performedBy}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {crmSubTab === 'calls' && (
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-sm font-bold dark:text-white">Customer Interaction Records (Calls)</h2>
                  <p className="text-[10px] text-zinc-500">Intelligent post-qualification summaries and notes generated for each conversation escalations.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={callsSearch}
                    onChange={(e) => setCallsSearch(e.target.value)}
                    placeholder="Search calls, notes, or leads..."
                    className="w-full text-xs rounded-lg p-2 dark:bg-zinc-950 dark:border-zinc-800 border dark:text-white"
                  />
                </div>
              </div>

              {callsLoading ? (
                <div className="text-xs text-zinc-500 py-6">Loading interactions...</div>
              ) : !calls || calls.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 text-center">No completed voice interactions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[9px]">
                      <tr>
                        <th className="p-3">Call Time & Duration</th>
                        <th className="p-3">Lead Contact</th>
                        <th className="p-3">Score Shift & Temperature</th>
                        <th className="p-3">Sentiment & Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
                      {calls.map((c: any) => {
                        const scoreBefore = c.leadScoreBefore || 0;
                        const scoreAfter = c.leadScoreAfter || scoreBefore;
                        
                        return (
                          <tr key={c.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                            <td className="p-3">
                              <div className="font-semibold dark:text-white">
                                {new Date(c.createdAt).toLocaleString()}
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                Duration: {Math.floor(c.durationSec / 60)}m {c.durationSec % 60}s
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold dark:text-white">{c.callerName}</div>
                              <div className="text-[10px] text-zinc-500">
                                {c.lead?.company || 'No Company'}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold dark:text-zinc-200">
                                {scoreBefore}% &rarr; {scoreAfter}%
                              </div>
                              <span className={`text-[9px] font-bold uppercase ${
                                scoreAfter >= 61 ? 'text-rose-450 text-rose-400' : scoreAfter >= 31 ? 'text-amber-450 text-amber-400' : 'text-zinc-500'
                              }`}>
                                {scoreAfter >= 61 ? 'Hot Lead' : scoreAfter >= 31 ? 'Warm Lead' : 'Cold Lead'}
                              </span>
                            </td>
                            <td className="p-3 capitalize">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  c.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`} />
                                <span className="font-medium dark:text-zinc-300">{c.status}</span>
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                Sentiment: {c.sentiment || 'Neutral'}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => {
                                  setSelectedEntity(c);
                                  setActiveModal('view_cir');
                                }}
                              >
                                View CIR
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Finance operations section */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          {/* Sub tabs */}
          <div className="flex flex-wrap gap-2 border-b border-zinc-800/80 pb-3">
            {[
              { id: 'quotes', label: 'Proposals & Quotations', count: quotes?.length },
              { id: 'invoices', label: 'Invoices Billing Ledger', count: invoices?.length },
              { id: 'payments', label: 'Settlements History', count: payments?.length },
              { id: 'tenant', label: 'Tenant settings' }
            ].map((t: any) => (
              <button
                key={t.id}
                onClick={() => setFinanceSubTab(t.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border",
                  financeSubTab === t.id 
                    ? "bg-accent-violet/10 text-accent-violet border-accent-violet/25 font-bold" 
                    : "text-zinc-450 border-transparent hover:text-zinc-300"
                )}
              >
                {t.label} {t.count !== undefined && <span className="ml-1 text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full">{t.count}</span>}
              </button>
            ))}
          </div>

          {/* Finance Panels */}
          {financeSubTab === 'quotes' && (
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold dark:text-white">Proposals & Quotations Revisions</h2>
                <Button size="xs" variant="outline" leftIcon={<Plus size={12} />} onClick={() => setActiveModal('create_quote')}>
                  Issue Quotation
                </Button>
              </div>
              {quotesLoading ? (
                <div className="text-xs text-zinc-500 py-6">Loading proposals...</div>
              ) : !quotes || quotes.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 text-center">No proposals or quotations registered.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Quote Number</th>
                        <th className="p-3">Company</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Valid Until</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
                      {quotes.map((q: any) => (
                        <tr key={q.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                          <td className="p-3">
                            <span className="font-semibold dark:text-white">{q.quotationNumber}</span>
                            <span className="text-[10px] text-zinc-500 block">Version V{q.version}</span>
                          </td>
                          <td className="p-3 dark:text-zinc-350">{q.organization.name}</td>
                          <td className="p-3 font-bold dark:text-zinc-300">
                            {q.currency} {q.total.toLocaleString()}
                          </td>
                          <td className="p-3 text-zinc-500">{new Date(q.validUntil).toLocaleDateString()}</td>
                          <td className="p-3 capitalize">{q.status}</td>
                          <td className="p-3 text-right flex justify-end gap-1 flex-wrap max-w-[280px]">
                            <a href={`${import.meta.env.VITE_API_URL || '/api'}/admin/finance/quotations/${q.id}/pdf`} target="_blank" rel="noopener noreferrer">
                              <Button size="xs" variant="outline" title="PDF"><Download size={12} /></Button>
                            </a>
                            <Button size="xs" variant="outline" onClick={() => emailQuoteMutation.mutate(q.id)}>Email</Button>
                            <Button size="xs" variant="outline" onClick={() => handleWhatsAppQuote(q)}>WhatsApp</Button>
                            <Button size="xs" variant="outline" onClick={() => handleCopyQuoteLink(q)}>Link</Button>
                            <Button size="xs" variant="outline" onClick={() => { setSelectedEntity(q); setActiveModal('view_analytics'); }}>Logs</Button>
                            {q.status !== 'approved' && q.status !== 'cancelled' && (
                              <Button 
                                size="xs" 
                                variant="primary" 
                                onClick={() => approveQuoteMutation.mutate({ id: q.id, payload: { approvalNotes: 'Manually approved by Administrator' } })}
                              >
                                Approve
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {financeSubTab === 'invoices' && (
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
              <h2 className="text-sm font-bold dark:text-white">Invoices Billing Ledger</h2>
              {invoicesLoading ? (
                <div className="text-xs text-zinc-500 py-6">Loading statements...</div>
              ) : !invoices || invoices.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 text-center">No invoices generated yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Invoice Number</th>
                        <th className="p-3">Company</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3">Total Charges</th>
                        <th className="p-3">Balance Due</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
                      {invoices.map((inv: any) => (
                        <tr key={inv.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                          <td className="p-3 font-semibold dark:text-white">{inv.invoiceNumber}</td>
                          <td className="p-3 dark:text-zinc-350">{inv.organization.name}</td>
                          <td className="p-3 text-zinc-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                          <td className="p-3 dark:text-zinc-300 font-semibold">{inv.currency} {inv.total.toLocaleString()}</td>
                          <td className="p-3 font-bold text-red-500">{inv.currency} {inv.balanceDue.toLocaleString()}</td>
                          <td className="p-3 capitalize">{inv.status}</td>
                          <td className="p-3 text-right flex justify-end gap-1 flex-wrap max-w-[340px]">
                            <a href={`${import.meta.env.VITE_API_URL || '/api'}/admin/finance/invoices/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer">
                              <Button size="xs" variant="outline" title="PDF"><Download size={12} /></Button>
                            </a>
                            <Button size="xs" variant="outline" onClick={() => emailInvoiceMutation.mutate(inv.id)}>Email</Button>
                            <Button size="xs" variant="outline" onClick={() => handleWhatsAppInvoice(inv)}>WhatsApp</Button>
                            <Button size="xs" variant="outline" onClick={() => handleCopyInvoiceLink(inv)}>Link</Button>
                            <Button size="xs" variant="outline" onClick={() => { setSelectedEntity(inv); setActiveModal('view_analytics'); }}>Logs</Button>
                            {inv.balanceDue > 0 && (
                              <>
                                <Button size="xs" variant="primary" onClick={() => { setSelectedEntity(inv); setActiveModal('pay_invoice'); }}>
                                  Pay
                                </Button>
                                <Button size="xs" variant="outline" className="text-amber-500" onClick={() => { setSelectedEntity(inv); setActiveModal('credit_note'); }}>
                                  CN
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {financeSubTab === 'payments' && (
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
              <h2 className="text-sm font-bold dark:text-white">Settlements History</h2>
              {paymentsLoading ? (
                <div className="text-xs text-zinc-500 py-6">Loading ledger...</div>
              ) : !payments || payments.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 text-center">No payment entries registered.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Reference</th>
                        <th className="p-3">Settlement Account</th>
                        <th className="p-3">Invoice</th>
                        <th className="p-3">Payment Amount</th>
                        <th className="p-3">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
                      {payments.map((p: any) => (
                        <tr key={p.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                          <td className="p-3 text-zinc-500">{new Date(p.paymentDate).toLocaleString()}</td>
                          <td className="p-3 font-semibold dark:text-white">{p.paymentNumber}</td>
                          <td className="p-3 dark:text-zinc-305">{p.invoice.organization.name}</td>
                          <td className="p-3 dark:text-zinc-400">{p.invoice.invoiceNumber}</td>
                          <td className="p-3 font-bold text-emerald-500">{p.currency} {p.amount.toLocaleString()}</td>
                          <td className="p-3 capitalize">{p.gatewayName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {financeSubTab === 'tenant' && (
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
              <h2 className="text-sm font-bold dark:text-white">Tenant Config Settings</h2>
              {tenantLoading ? (
                <div className="text-xs text-zinc-500 py-6">Loading configs...</div>
              ) : (
                <form onSubmit={handleUpdateTenant} className="max-w-md space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Company Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      defaultValue={tenant?.name || 'Terrasafi T Ltd'} 
                      className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      defaultValue={tenant?.address || 'Victoria, Dar es Salaam, Tanzania'} 
                      className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Billing Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      defaultValue={tenant?.email || 'finance@terrasafi.co.tz'} 
                      className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Phone</label>
                    <input 
                      type="text" 
                      name="phone" 
                      defaultValue={tenant?.phone || '+255 700 000 000'} 
                      className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">VAT Register Number</label>
                    <input 
                      type="text" 
                      name="vatNumber" 
                      defaultValue={tenant?.vatNumber || '100-200-300'} 
                      className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Standard VAT Rate (%)</label>
                    <input 
                      type="number" 
                      name="taxRate" 
                      defaultValue={tenant?.taxRate || 18.0} 
                      className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                      step="0.1"
                    />
                  </div>
                  <Button type="submit" variant="primary" disabled={updateTenantMutation.isPending}>
                    {updateTenantMutation.isPending ? 'Updating...' : 'Save Configuration'}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* CRM Convert Lead Modal */}
      {activeModal === 'convert_lead' && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleConvertLead} className="relative max-w-md w-full p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white shadow-2xl space-y-4 text-left text-xs">
            <h3 className="text-base font-bold dark:text-white text-slate-800">Convert Lead to Client Organization</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              This workflow registers a corporate Organization company and maps this lead contact user as the primary workspace client contact.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Corporate Organization Name</label>
                <input 
                  type="text" 
                  name="organizationName" 
                  defaultValue={`${selectedEntity.name.split(' ').slice(-1)[0] || 'Client'} Services Ltd`} 
                  className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Company Address</label>
                <input 
                  type="text" 
                  name="address" 
                  placeholder="E.g., Victoria, Dar es Salaam" 
                  className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Contact Title / Role</label>
                <input 
                  type="text" 
                  name="contactRole" 
                  defaultValue="ICT Director" 
                  className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Generate Workspace Login Credentials</label>
                <select name="createLogin" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
                  <option value="true">Yes, issue workspace username/password</option>
                  <option value="false">No, save as offline reference contact</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Login Password</label>
                <input 
                  type="text" 
                  name="password" 
                  defaultValue="PortalPass2026!" 
                  className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" type="button" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button size="sm" variant="primary" type="submit" disabled={convertLeadMutation.isPending}>
                {convertLeadMutation.isPending ? 'Converting...' : 'Finalize Conversion'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Create Org Modal */}
      {activeModal === 'create_org' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleCreateOrg} className="relative max-w-md w-full p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white shadow-2xl space-y-4 text-left text-xs">
            <h3 className="text-base font-bold dark:text-white text-slate-800">Register Organization</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Company Name</label>
                <input type="text" name="name" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Email</label>
                <input type="email" name="email" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Phone</label>
                <input type="text" name="phone" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Address</label>
                <input type="text" name="address" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" type="button" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button size="sm" variant="primary" type="submit">Save</Button>
            </div>
          </form>
        </div>
      )}

      {/* Create Client Modal */}
      {activeModal === 'create_client' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleCreateClient} className="relative max-w-md w-full p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white shadow-2xl space-y-4 text-left text-xs">
            <h3 className="text-base font-bold dark:text-white text-slate-800">Create Client Contact</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Link to Company</label>
                <select name="organizationId" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required>
                  {orgs?.map((o: any) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">First Name</label>
                  <input type="text" name="firstName" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Last Name</label>
                  <input type="text" name="lastName" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Email Address</label>
                <input type="email" name="email" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Create Workspace login credentials</label>
                <select name="createLogin" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
                  <option value="true">Yes, issue workspace username/password</option>
                  <option value="false">No, save as offline reference contact</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Login Password</label>
                <input type="text" name="password" defaultValue="PortalPass2026!" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" type="button" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button size="sm" variant="primary" type="submit">Save</Button>
            </div>
          </form>
        </div>
      )}

      {/* Create Consultation Modal */}
      {activeModal === 'create_consultation' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleCreateConsultation} className="relative max-w-md w-full p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white shadow-2xl space-y-4 text-left text-xs">
            <h3 className="text-base font-bold dark:text-white text-slate-800">Schedule Consultation Bookings</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Link to Company</label>
                <select name="organizationId" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
                  <option value="">None (Link to Lead instead)</option>
                  {orgs?.map((o: any) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Link to Lead</label>
                <select name="leadId" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
                  <option value="">None (Link to Company instead)</option>
                  {leads?.items?.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.name} ({l.email})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Meeting Title</label>
                <input type="text" name="title" defaultValue="Scope Discovery & Architecture Discussion" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Scheduled At</label>
                <input type="datetime-local" name="scheduledAt" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Duration (Minutes)</label>
                <input type="number" name="duration" defaultValue="60" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Notes & Recommendations</label>
                <textarea name="recommendations" placeholder="Technical stack, recommendations..." className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white h-16 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" type="button" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button size="sm" variant="primary" type="submit">Schedule</Button>
            </div>
          </form>
        </div>
      )}

      {/* Create Quote Modal */}
      {activeModal === 'create_quote' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleCreateQuote} className="relative max-w-md w-full p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white shadow-2xl space-y-4 text-left text-xs">
            <h3 className="text-base font-bold dark:text-white text-slate-800">Issue Quotation proposal</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Company Name</label>
                <select name="organizationId" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required>
                  {orgs?.map((o: any) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Project Scope Title</label>
                <input type="text" name="title" defaultValue="Mobile Application Development" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Currency</label>
                  <select name="currency" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
                    <option value="USD">USD</option>
                    <option value="TZS">TZS</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Tax (%)</label>
                  <input type="number" name="taxRate" defaultValue="18" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Discount (%)</label>
                  <input type="number" name="discountRate" defaultValue="0" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Valid Until</label>
                <input type="date" name="validUntil" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
              </div>
              
              {/* Single item inputs for simplification */}
              <div className="border-t dark:border-zinc-850 pt-2 space-y-2">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Quotation Item Line</span>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 block">Item Description</label>
                  <input type="text" name="itemDesc" defaultValue="Fullstack design and development services" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-500 block">Quantity</label>
                    <input type="number" name="itemQty" defaultValue="1" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-500 block">Unit Price</label>
                    <input type="number" name="itemPrice" defaultValue="5000" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" required />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" type="button" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button size="sm" variant="primary" type="submit">Issue</Button>
            </div>
          </form>
        </div>
      )}

      {/* Settle Payment Modal */}
      {activeModal === 'pay_invoice' && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <form onSubmit={handlePayInvoice} className="relative max-w-md w-full p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white shadow-2xl space-y-4 text-left text-xs">
            <h3 className="text-base font-bold dark:text-white text-slate-800">Add Payment Record</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Manually add settlement receipts for **{selectedEntity.invoiceNumber}**. This updates remaining balance and registers transaction audits.
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Payment Method</label>
                <select name="method" className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
                  <option value="mpesa">M-Pesa</option>
                  <option value="stripe">Stripe</option>
                  <option value="bank">Direct Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Payment Amount ({selectedEntity.currency})</label>
                <input 
                  type="number" 
                  name="amount" 
                  defaultValue={selectedEntity.balanceDue} 
                  className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  required 
                  step="0.01"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Memo Reference / Transaction ID</label>
                <input 
                  type="text" 
                  name="reference" 
                  placeholder="E.g., Bank Ref TXN-9902" 
                  className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" type="button" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button size="sm" variant="primary" type="submit">Submit Settle</Button>
            </div>
          </form>
        </div>
      )}

      {/* Credit Note Modal */}
      {activeModal === 'credit_note' && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleCreditNote} className="relative max-w-md w-full p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white shadow-2xl space-y-4 text-left text-xs">
            <h3 className="text-base font-bold dark:text-white text-slate-800">Issue Credit Note</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Deduct charges or adjust invoices balance for **{selectedEntity.invoiceNumber}** via financial credit notes.
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Deduction Credit Amount ({selectedEntity.currency})</label>
                <input 
                  type="number" 
                  name="amount" 
                  defaultValue={selectedEntity.balanceDue} 
                  className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  required 
                  step="0.01"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Reason for adjustment</label>
                <input 
                  type="text" 
                  name="reason" 
                  placeholder="Discount correction or scope reduction..." 
                  className="w-full p-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" type="button" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button size="sm" variant="primary" type="submit" className="bg-amber-500 hover:bg-amber-600">Issue CN</Button>
            </div>
          </form>
        </div>
      )}

      {activeModal === 'view_analytics' && selectedEntity && (
        <AdminModal 
          title="Secure Links View Analytics" 
          isOpen={activeModal === 'view_analytics'}
          onClose={() => { setActiveModal(null); setSelectedEntity(null); setAnalyticsData([]); }}
        >
          <div className="space-y-4 text-xs">
            <div>
              <p className="font-bold text-white">Document Ref: {selectedEntity.quotationNumber || selectedEntity.invoiceNumber}</p>
              <p className="text-zinc-500">Analytics logs details showing viewed count statistics.</p>
            </div>
            
            {analyticsLoading ? (
              <div className="text-zinc-500 py-4">Loading analytics records...</div>
            ) : analyticsData.length === 0 ? (
              <div className="text-zinc-500 py-4 text-center">No secure link views logged yet.</div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-3">
                {analyticsData.map((linkRecord: any) => (
                  <div key={linkRecord.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500">
                      <span>Expires: {new Date(linkRecord.expiresAt).toLocaleDateString()}</span>
                      <span>Views: <span className="font-bold text-white">{linkRecord.currentViews}</span> / {linkRecord.maxViews}</span>
                    </div>
                    {linkRecord.revokedAt ? (
                      <p className="text-[10px] text-red-400 font-bold uppercase">Revoked Link</p>
                    ) : (
                      <button 
                        onClick={() => { if (window.confirm('Revoke this link token permanently?')) revokeTokenMutation.mutate(selectedEntity.id); }}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Revoke Secure Link
                      </button>
                    )}
                    {linkRecord.logs && linkRecord.logs.length > 0 && (
                      <div className="border-t border-zinc-800/80 pt-2 space-y-2">
                        <p className="font-semibold text-zinc-400 text-[10px]">Access View Sessions Timeline:</p>
                        {linkRecord.logs.map((log: any) => (
                          <div key={log.id} className="text-[10px] text-zinc-500 flex justify-between gap-2 border-b border-zinc-900 pb-1 last:border-0 last:pb-0">
                            <div>
                              <p className="text-zinc-300">{log.browser} on {log.device} ({log.os})</p>
                              <p className="text-[9px]">IP: {log.ipAddress} | Location: {log.city}, {log.country}</p>
                            </div>
                            <span className="text-zinc-500">{new Date(log.viewedAt).toLocaleDateString()} {new Date(log.viewedAt).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end pt-2 border-t border-zinc-850">
              <Button size="sm" variant="outline" onClick={() => { setActiveModal(null); setSelectedEntity(null); setAnalyticsData([]); }}>Close Analytics</Button>
            </div>
          </div>
        </AdminModal>
      )}

      {activeModal === 'view_cir' && selectedEntity && (
        <AdminModal
          title="Customer Interaction Record (CIR)"
          isOpen={activeModal === 'view_cir'}
          onClose={() => { setActiveModal(null); setSelectedEntity(null); }}
        >
          <div className="space-y-4 text-xs text-left max-h-[500px] overflow-y-auto pr-1">
            <div className="flex justify-between items-start border-b dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold dark:text-white">{selectedEntity.callerName}</h3>
                <p className="text-[10px] text-zinc-500">{selectedEntity.lead?.company || 'Independent Lead'}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{selectedEntity.lead?.email || 'No email registered'}</p>
              </div>
              <div className="text-right">
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                  selectedEntity.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {selectedEntity.status} Interaction
                </span>
                <p className="text-[10px] text-zinc-500 mt-1">Duration: {Math.floor(selectedEntity.durationSec / 60)}m {selectedEntity.durationSec % 60}s</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-zinc-900/40 p-3 rounded-xl border dark:border-zinc-800">
              <div>
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-400 uppercase block font-semibold">Lead Score (Before &rarr; After)</span>
                <p className="dark:text-zinc-200 mt-0.5 font-medium">{selectedEntity.leadScoreBefore || 0}% &rarr; {selectedEntity.leadScoreAfter || selectedEntity.leadScoreBefore || 0}%</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-400 uppercase block font-semibold">Interaction Date</span>
                <p className="dark:text-zinc-200 mt-0.5 font-medium">{new Date(selectedEntity.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-400 uppercase block font-semibold">Call Quality Status</span>
                <p className="dark:text-zinc-200 mt-0.5 capitalize font-medium">{selectedEntity.quality || 'Good'}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-400 uppercase block font-semibold">Recommended Next Stage</span>
                <p className="dark:text-zinc-250 mt-0.5 font-bold text-accent-violet">{selectedEntity.salesStage || 'Qualified'}</p>
              </div>
            </div>

            {selectedEntity.customerBrief && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Pre-Call Qualification Brief</h4>
                <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 text-[11px] space-y-2">
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-zinc-850">
                    <div>
                      <span className="text-zinc-500 text-[9px] block">Current Page:</span>
                      <span className="dark:text-zinc-300">{selectedEntity.customerBrief.currentPage || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block">Service Requested:</span>
                      <span className="dark:text-zinc-300 font-semibold">{selectedEntity.customerBrief.serviceRequested || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block">Budget Range:</span>
                      <span className="text-emerald-400 font-semibold">{selectedEntity.customerBrief.budget || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block">Implementation Timeline:</span>
                      <span className="text-amber-400 font-semibold">{selectedEntity.customerBrief.timeline || 'Not specified'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[9px] block">AI Qualification Summary:</span>
                    <p className="dark:text-zinc-350 leading-relaxed">{selectedEntity.customerBrief.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedEntity.denisNotes && (
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Denis's Call Notes</h4>
                <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 font-mono text-[11px] whitespace-pre-wrap dark:text-zinc-300">
                  {selectedEntity.denisNotes}
                </div>
              </div>
            )}

            {selectedEntity.summary && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">AI CRM Summary Output</h4>
                {(() => {
                  let summaryObj: any = null;
                  try {
                    summaryObj = typeof selectedEntity.summary === 'string' ? JSON.parse(selectedEntity.summary) : selectedEntity.summary;
                  } catch (e) {}

                  if (!summaryObj) return <p className="text-zinc-550 italic">Empty CRM Summary.</p>;

                  return (
                    <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 text-[11px] space-y-2.5">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-850/80">
                        <span className="font-semibold text-accent-violet">Structured Analysis</span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Probability: {summaryObj.probabilityOfClosing || 'High'}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Customer Profile</span>
                          <p className="text-zinc-300 leading-relaxed">{summaryObj.customerProfile}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Business Needs</span>
                          <p className="text-zinc-300 leading-relaxed">{summaryObj.businessNeeds}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Pain Points</span>
                          <p className="text-zinc-300 leading-relaxed">{summaryObj.painPoints}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-b border-zinc-850/40 py-2 my-1">
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Budget Details</span>
                            <p className="text-zinc-300 font-semibold">{summaryObj.budget}</p>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Timeline Info</span>
                            <p className="text-zinc-300 font-semibold">{summaryObj.timeline}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Decision Makers</span>
                            <p className="text-zinc-350">{summaryObj.decisionMakers || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Objections Raised</span>
                            <p className="text-rose-450 text-rose-400">{summaryObj.objections || 'None noted'}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Risks & Blockers</span>
                          <p className="text-zinc-350">{summaryObj.risks || 'None noted'}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Recommended Services</span>
                          <p className="text-zinc-200 font-medium">{summaryObj.recommendedService}</p>
                        </div>
                        <div className="bg-zinc-950 p-2.5 rounded border border-zinc-850">
                          <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Next Action</span>
                          <p className="text-zinc-100 font-bold leading-relaxed">{summaryObj.nextAction}</p>
                          <p className="text-zinc-400 mt-1 leading-normal">{summaryObj.followUpPlan}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {selectedEntity.recordingUrl && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-400 uppercase block tracking-wider font-semibold">Call Audio Recording</span>
                <div className="bg-zinc-950 p-2.5 rounded-xl border dark:border-zinc-800 flex items-center gap-3">
                  <audio src={selectedEntity.recordingUrl} controls className="w-full h-8 custom-audio-player text-xs" />
                </div>
              </div>
            )}

            {selectedEntity.transcript && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-400 uppercase block tracking-wider font-semibold">Whisper Audio Transcript</span>
                <div className="bg-zinc-950/65 p-3 rounded-xl border dark:border-zinc-800 font-mono text-[11px] whitespace-pre-wrap dark:text-zinc-300 max-h-[140px] overflow-y-auto custom-scrollbar leading-relaxed">
                  {selectedEntity.transcript}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t dark:border-zinc-800">
              <Button size="sm" variant="outline" onClick={() => { setActiveModal(null); setSelectedEntity(null); }}>
                Dismiss View
              </Button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

// ─── 2. MARKETING ADMIN PAGE ──────────────────────────────────────────────────
export const MarketingAdminPage: React.FC = () => {
  const qc = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'newsletters' | 'campaigns'>('newsletters');
  
  // Queries
  const { data: newsletters, isLoading: newsLoading } = useQuery({
    queryKey: ['admin-newsletters'],
    queryFn: () => adminApi.getNewsletters(),
  });

  const { data: campaigns, isLoading: campLoading } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => adminApi.getCampaigns(),
  });

  // Newsletter Mutations
  const deleteNewsletter = useMutation({
    mutationFn: (id: string) => adminApi.deleteNewsletter(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-newsletters'] })
  });

  // Campaign Mutations
  const createCampaign = useMutation({
    mutationFn: (d: any) => adminApi.createCampaign(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-campaigns'] }); setModalOpen(false); }
  });
  const updateCampaign = useMutation({
    mutationFn: ({ id, data }: any) => adminApi.updateCampaign(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-campaigns'] }); setModalOpen(false); }
  });
  const deleteCampaign = useMutation({
    mutationFn: (id: string) => adminApi.deleteCampaign(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-campaigns'] }); setConfirmOpen({ open: false }); }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({ name: '', type: 'social', status: 'planned', budget: 0, spend: 0 });

  const handleExportCSV = () => {
    if (!newsletters?.items || newsletters.items.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8,Email,Status,Source,DateRegistered\n"
      + newsletters.items.map((n: any) => `"${n.email}","${n.status}","${n.source || 'n/a'}","${new Date(n.createdAt).toLocaleDateString()}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `newsletter_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSave = () => {
    const payload = { ...form, budget: +form.budget || 0, spend: +form.spend || 0 };
    if (editingItem) updateCampaign.mutate({ id: editingItem.id, data: payload });
    else createCampaign.mutate(payload);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-zinc-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white light:text-slate-800 flex items-center gap-2">
            <Megaphone className="text-accent-violet" /> Marketing Campaigns
          </h1>
          <p className="text-sm text-zinc-500">Manage global email subscribers and track digital ad/social metrics.</p>
        </div>
        <div className="flex gap-2">
          {activeSubTab === 'newsletters' ? (
            <Button size="sm" variant="outline" leftIcon={<Download size={14} />} onClick={handleExportCSV}>Export CSV</Button>
          ) : (
            <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={() => { setEditingItem(null); setForm({ name: '', type: 'social', status: 'planned', budget: 0, spend: 0 }); setModalOpen(true); }}>New Campaign</Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b dark:border-zinc-800 pb-2">
        <button onClick={() => setActiveSubTab('newsletters')} className={cn("px-4 py-1.5 text-xs uppercase tracking-wider font-bold rounded-lg", activeSubTab === 'newsletters' ? 'bg-accent-violet text-white' : 'dark:text-zinc-400 dark:bg-zinc-900/30 text-zinc-500')}>Subscribers</button>
        <button onClick={() => setActiveSubTab('campaigns')} className={cn("px-4 py-1.5 text-xs uppercase tracking-wider font-bold rounded-lg", activeSubTab === 'campaigns' ? 'bg-accent-violet text-white' : 'dark:text-zinc-400 dark:bg-zinc-900/30 text-zinc-500')}>Campaign Tracker</button>
      </div>

      {activeSubTab === 'newsletters' ? (
        <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 overflow-hidden bg-white">
          {newsLoading ? <div className="p-6 text-xs text-zinc-500">Loading newsletter...</div> : !newsletters?.items || newsletters.items.length === 0 ? <div className="p-12 text-center text-xs text-zinc-500">No subscribers registered yet.</div> : (
            <table className="w-full text-xs text-left">
              <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 uppercase tracking-wider text-zinc-400 font-semibold">
                <tr>
                  <th className="p-3">Subscriber Email</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800/60">
                {newsletters.items.map((n: any) => (
                  <tr key={n.id} className="dark:hover:bg-zinc-800/10">
                    <td className="p-3 font-semibold dark:text-white">{n.email}</td>
                    <td className="p-3 text-zinc-500">{n.source || 'Direct'}</td>
                    <td className="p-3 uppercase font-bold text-[10px] tracking-wide text-green-500">{n.status}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => { if (window.confirm('Delete subscriber?')) deleteNewsletter.mutate(n.id); }} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 overflow-hidden bg-white">
          {campLoading ? <div className="p-6 text-xs text-zinc-500">Loading campaigns...</div> : !campaigns?.items || campaigns.items.length === 0 ? <div className="p-12 text-center text-xs text-zinc-500">No campaigns added yet.</div> : (
            <table className="w-full text-xs text-left">
              <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 uppercase tracking-wider text-zinc-400 font-semibold">
                <tr>
                  <th className="p-3">Campaign Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Budget / Spend</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800/60">
                {campaigns.items.map((c: any) => (
                  <tr key={c.id} className="dark:hover:bg-zinc-800/10">
                    <td className="p-3 font-semibold dark:text-white">{c.name}</td>
                    <td className="p-3 uppercase text-[10px] text-zinc-400 font-bold">{c.type}</td>
                    <td className="p-3 dark:text-zinc-300">${c.budget || 0} / <span className="text-zinc-500">${c.spend || 0}</span></td>
                    <td className="p-3">
                      <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase border", c.status === 'active' ? 'border-green-500/30 text-green-500' : 'border-zinc-800 text-zinc-500')}>{c.status}</span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button onClick={() => { setEditingItem(c); setForm({ ...c }); setModalOpen(true); }} className="p-1.5 text-accent-violet hover:bg-accent-violet/10 rounded-lg"><Edit2 size={14} /></button>
                      <button onClick={() => setConfirmOpen({ open: true, id: c.id })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Campaign CRUD Modal */}
      <AdminModal 
        isOpen={modalOpen} 
        title={editingItem ? 'Edit Campaign' : 'Create Campaign'} 
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        }
      >
        <FormField label="Campaign Name"><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></FormField>
        <FormField label="Channel Type">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={selectCls}>
            <option value="social">Social Networks</option>
            <option value="email">Email Campaign</option>
            <option value="ad">Google/Meta Ad</option>
            <option value="partner">Affiliate / Partnership</option>
          </select>
        </FormField>
        <FormField label="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectCls}>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Budget ($)"><input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={inputCls} /></FormField>
          <FormField label="Spend ($)"><input type="number" value={form.spend} onChange={(e) => setForm({ ...form, spend: e.target.value })} className={inputCls} /></FormField>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={confirmOpen.open} title="Delete Campaign?" message="This action will permanently delete this marketing campaign log record." onCancel={() => setConfirmOpen({ open: false })} onConfirm={() => deleteCampaign.mutate(confirmOpen.id || '')} />
    </div>
  );
};

// ─── 3. CREATOR ADMIN PAGE ────────────────────────────────────────────────────
export const CreatorAdminPage: React.FC = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: tutorialsData } = useQuery({
    queryKey: ['admin-tutorials'],
    queryFn: () => adminApi.getTutorials()
  });

  const createM = useMutation({
    mutationFn: (d: any) => adminApi.createTutorial(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tutorials'] }); setModalOpen(false); }
  });
  const updateM = useMutation({
    mutationFn: ({ id, data }: any) => adminApi.updateTutorial(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tutorials'] }); setModalOpen(false); }
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => adminApi.deleteTutorial(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tutorials'] }); setConfirmOpen({ open: false }); }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    videoUrl: '',
    provider: 'youtube',
    durationMin: '0',
    isActive: true,
    resourcesJson: '[]'
  });

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      videoUrl: item.videoUrl,
      provider: item.provider,
      durationMin: item.durationMin.toString(),
      isActive: item.isActive,
      resourcesJson: JSON.stringify(item.resources || [], null, 2)
    });
    setModalOpen(true);
  };

  const defaultTutorials = [
    {
      id: 'tut-1',
      title: 'Enterprise SaaS & Cloud Architecture Masterclass',
      description: 'Step-by-step guide to building multi-tenant SaaS applications with Prisma, TypeScript, and Docker.',
      videoUrl: 'https://youtube.com/watch?v=saas_arch_demo',
      provider: 'youtube',
      durationMin: 45,
      isActive: true,
      resources: [{ label: 'Architecture Blueprint PDF', url: '#' }]
    },
    {
      id: 'tut-2',
      title: 'RAG Vector Engine & AI Agentic Coding Blueprint',
      description: 'Designing retrieval augmented generation pipelines with embeddings and hybrid vector search.',
      videoUrl: 'https://vimeo.com/rag_vector_mastery',
      provider: 'vimeo',
      durationMin: 60,
      isActive: true,
      resources: [{ label: 'Vector Index Guide', url: '#' }]
    }
  ];

  const rawTutorials = tutorialsData?.items || [];
  const tutorials = rawTutorials.length > 0 ? rawTutorials : defaultTutorials;

  const handleAdd = () => {
    setEditingItem(null);
    setForm({
      title: '',
      description: '',
      videoUrl: '',
      provider: 'youtube',
      durationMin: '0',
      isActive: true,
      resourcesJson: '[]'
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    let parsedResources: any[];
    try {
      parsedResources = JSON.parse(form.resourcesJson);
    } catch (e) {
      toast.warning('Invalid resources JSON format. Must be an array of objects.', 'Invalid JSON');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      videoUrl: form.videoUrl,
      provider: form.provider,
      durationMin: parseInt(form.durationMin) || 0,
      isActive: form.isActive,
      resources: parsedResources
    };

    if (editingItem) {
      updateM.mutate({ id: editingItem.id, data: payload });
    } else {
      createM.mutate(payload);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in font-body">
      
      {/* Metric Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Masterclass Videos</span>
          <div className="text-2xl font-extrabold dark:text-white text-slate-900 font-display">{tutorials.length}</div>
        </div>

        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total Duration</span>
          <div className="text-2xl font-extrabold text-accent-violet font-display">
            {tutorials.reduce((acc: number, t: any) => acc + (t.durationMin || 0), 0)} Mins
          </div>
        </div>

        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Public Active Ratio</span>
          <div className="text-2xl font-extrabold text-emerald-500 font-display">
            {tutorials.filter((t: any) => t.isActive).length} / {tutorials.length} Active
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center border-b dark:border-zinc-800 border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-slate-900 flex items-center gap-2">
            <Video className="text-accent-violet" /> Creator Hub
          </h1>
          <p className="text-xs dark:text-zinc-400 text-slate-600">
            Monitor and list your masterclass videos, guidebooks, and content checklist logs.
          </p>
        </div>
        <Button onClick={handleAdd} variant="primary" size="sm" className="inline-flex items-center gap-1.5 cursor-pointer">
          <Plus size={14} /> Add Tutorial
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white space-y-4">
            <h2 className="text-xs font-bold dark:text-white text-slate-900 uppercase tracking-wider">Masterclass Video Logs</h2>
            <div className="space-y-3">
              {tutorials.map((v: any) => (
                <div key={v.id} className="p-4 rounded-xl border dark:border-zinc-800 border-slate-200 dark:bg-zinc-950/40 bg-slate-50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl"><Play size={16} /></div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold dark:text-white text-slate-900">{v.title}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono">{v.provider.toUpperCase()} • {v.durationMin} mins • {v.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEdit(v)} className="p-1.5 text-zinc-400 hover:text-accent-violet transition-colors cursor-pointer"><Edit2 size={14} /></button>
                    <button onClick={() => setConfirmOpen({ open: true, id: v.id })} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white space-y-4">
            <h3 className="text-xs font-bold dark:text-white text-slate-900 uppercase tracking-wider flex items-center gap-1.5"><BookOpen size={16} /> Guidebooks & PDF Resources</h3>
            <div className="p-4 rounded-xl dark:bg-zinc-950/40 bg-slate-50 border dark:border-zinc-800 border-slate-200 text-center py-6 space-y-2">
              <Clock className="mx-auto text-accent-violet" size={20} />
              <div className="text-xs font-semibold dark:text-zinc-300 text-slate-800">PDF Guide Uploads</div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">Management of downloadable resources is attached inside video tutorial metadata above.</p>
            </div>
          </div>
        </div>
      </div>

      <AdminModal 
        isOpen={modalOpen} 
        title={editingItem ? 'Edit Tutorial' : 'Add Tutorial'} 
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={createM.isPending || updateM.isPending}>Save</Button>
          </>
        }
      >
        <FormField label="Title"><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} required /></FormField>
        <FormField label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} rows={2} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Provider">
            <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className={selectCls}>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="self-hosted">Self-Hosted</option>
            </select>
          </FormField>
          <FormField label="Duration (minutes)"><input type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} className={inputCls} /></FormField>
        </div>
        <FormField label="Video URL / ID"><input type="text" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className={inputCls} placeholder="e.g. YouTube Video ID or Self-hosted path" required /></FormField>
        <FormField label="Attachments JSON (Future PDF / Slides)"><textarea value={form.resourcesJson} onChange={(e) => setForm({ ...form, resourcesJson: e.target.value })} className={inputCls} rows={3} placeholder='[{"label": "PDF Notes", "url": "https://url.com"}]' /></FormField>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 pt-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          <span>Is Active / Display publicly</span>
        </label>
      </AdminModal>

      <ConfirmDialog isOpen={confirmOpen.open} title="Delete Tutorial?" message="This action will permanently delete this masterclass video tutorial log." onCancel={() => setConfirmOpen({ open: false })} onConfirm={() => deleteM.mutate(confirmOpen.id || '')} />
    </div>
  );
};

// ─── 4. INNOVATION ADMIN PAGE ──────────────────────────────────────────────────
export const InnovationAdminPage: React.FC = () => {
  const qc = useQueryClient();
  const { data: ideasData } = useQuery({
    queryKey: ['admin-product-ideas'],
    queryFn: () => adminApi.getProductIdeas(),
  });

  const createM = useMutation({
    mutationFn: (d: any) => adminApi.createProductIdea(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-product-ideas'] }); setModalOpen(false); }
  });
  const updateM = useMutation({
    mutationFn: ({ id, data }: any) => adminApi.updateProductIdea(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-product-ideas'] }); setModalOpen(false); }
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => adminApi.deleteProductIdea(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-product-ideas'] }); setConfirmOpen({ open: false }); }
  });

  const defaultIdeas = [
    {
      id: 'idea-1',
      name: 'Legal RAG AI Document Summarizer',
      description: 'Automated contract parser and vector search engine for East African legal frameworks.',
      category: 'SaaS',
      status: 'mvp',
      impact: 'high',
      effort: 'medium'
    },
    {
      id: 'idea-2',
      name: 'WebRTC Video Consultation SDK',
      description: 'Embeddable real-time audio/video session widget for digital health and consulting.',
      category: 'System Integration',
      status: 'research',
      impact: 'high',
      effort: 'high'
    }
  ];

  const rawIdeas = ideasData?.items || [];
  const ideas = rawIdeas.length > 0 ? rawIdeas : defaultIdeas;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({ name: '', description: '', category: 'SaaS', status: 'ideation', impact: 'medium', effort: 'medium' });

  const handleSave = () => {
    if (editingItem) updateM.mutate({ id: editingItem.id, data: form });
    else createM.mutate(form);
  };

  return (
    <div className="space-y-6 text-left font-body">
      
      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">R&D Projects</span>
          <div className="text-2xl font-extrabold dark:text-white text-slate-900 font-display">{ideas.length}</div>
        </div>
        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">High Impact Ratio</span>
          <div className="text-2xl font-extrabold text-accent-violet font-display">
            {ideas.filter((i: any) => i.impact === 'high').length} / {ideas.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">MVP Readiness</span>
          <div className="text-2xl font-extrabold text-emerald-500 font-display">
            {ideas.filter((i: any) => i.status === 'mvp' || i.status === 'completed').length} Ready
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b dark:border-zinc-800 border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-slate-900 flex items-center gap-2">
            <Lightbulb className="text-accent-violet" /> Innovation Lab
          </h1>
          <p className="text-xs dark:text-zinc-400 text-slate-600">
            Track internal code experiments, R&D projects, and SaaS product ideations.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => { setEditingItem(null); setForm({ name: '', description: '', category: 'SaaS', status: 'ideation', impact: 'medium', effort: 'medium' }); setModalOpen(true); }}>New Idea</Button>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] overflow-hidden bg-white shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="dark:bg-zinc-900/80 bg-slate-50 border-b dark:border-zinc-800 border-slate-200 uppercase tracking-wider dark:text-zinc-400 text-slate-600 font-bold text-[10px]">
            <tr>
              <th className="p-3.5">Product / SaaS Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Impact / Effort</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800 divide-slate-200">
            {ideas.map((i: any) => (
              <tr key={i.id} className="dark:hover:bg-zinc-900/50 hover:bg-slate-50">
                <td className="p-3.5">
                  <div className="font-bold dark:text-white text-slate-900">{i.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-xs">{i.description}</div>
                </td>
                <td className="p-3.5 uppercase text-[10px] text-accent-violet font-bold font-mono">{i.category}</td>
                <td className="p-3.5 dark:text-zinc-300 text-slate-700 font-mono">
                  Impact: <span className="font-bold uppercase text-emerald-500">{i.impact}</span> • Effort: <span className="font-bold uppercase text-amber-500">{i.effort}</span>
                </td>
                <td className="p-3.5">
                  <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full bg-accent-violet/10 text-accent-violet border border-accent-violet/20">{i.status}</span>
                </td>
                <td className="p-3.5 text-right space-x-1">
                  <button onClick={() => { setEditingItem(i); setForm({ ...i }); setModalOpen(true); }} className="p-1.5 text-accent-violet hover:bg-accent-violet/10 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirmOpen({ open: true, id: i.id })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal 
        isOpen={modalOpen} 
        title={editingItem ? 'Edit Product Idea' : 'Create Product Idea'} 
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        }
      >
        <FormField label="Product Name"><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></FormField>
        <FormField label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={cn(inputCls, 'resize-none')} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectCls}>
              <option value="SaaS">SaaS Platform</option>
              <option value="AI Engine">AI Copilot Engine</option>
              <option value="System Integration">Hardware / API</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectCls}>
              <option value="ideation">Ideation</option>
              <option value="research">Research</option>
              <option value="mvp">MVP Testing</option>
              <option value="completed">Completed</option>
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Business Impact">
            <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} className={selectCls}>
              <option value="low">Low Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="high">High Impact</option>
            </select>
          </FormField>
          <FormField label="Developer Effort">
            <select value={form.effort} onChange={(e) => setForm({ ...form, effort: e.target.value })} className={selectCls}>
              <option value="low">Low Effort</option>
              <option value="medium">Medium Effort</option>
              <option value="high">High Effort</option>
            </select>
          </FormField>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={confirmOpen.open} title="Delete Product Idea?" message="Are you sure you want to remove this product idea from the lab database?" onCancel={() => setConfirmOpen({ open: false })} onConfirm={() => deleteM.mutate(confirmOpen.id || '')} />
    </div>
  );
};

// ─── 5. FUTURE VISION ADMIN PAGE ──────────────────────────────────────────────
export const FutureVisionAdminPage: React.FC = () => {
  const qc = useQueryClient();
  const { data: roadmapData } = useQuery({
    queryKey: ['admin-roadmap-items'],
    queryFn: () => adminApi.getRoadmapItems(),
  });

  const createM = useMutation({
    mutationFn: (d: any) => adminApi.createRoadmapItem(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-roadmap-items'] }); setModalOpen(false); }
  });
  const updateM = useMutation({
    mutationFn: ({ id, data }: any) => adminApi.updateRoadmapItem(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-roadmap-items'] }); setModalOpen(false); }
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => adminApi.deleteRoadmapItem(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-roadmap-items'] }); setConfirmOpen({ open: false }); }
  });

  const defaultRoadmap = [
    {
      id: 'road-1',
      title: 'Terrasafi Global Environmental Rollout',
      description: 'Deploying IoT sensors and climate tech telemetry across East Africa.',
      quarter: 'Q1',
      year: 2026,
      category: 'Terrasafi',
      status: 'in_progress',
      displayOrder: 1
    },
    {
      id: 'road-2',
      title: 'Mary AI Voice Assistant Multilingual Integration',
      description: 'Adding Swahili and English real-time speech-to-text WebRTC streaming.',
      quarter: 'Q2',
      year: 2026,
      category: 'AI Assistant',
      status: 'planned',
      displayOrder: 2
    }
  ];

  const rawRoadmap = roadmapData?.items || [];
  const roadmapItems = rawRoadmap.length > 0 ? rawRoadmap : defaultRoadmap;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({ title: '', description: '', category: 'Terrasafi', quarter: 'Q1', year: 2026, status: 'planned', displayOrder: 0 });

  const handleSave = () => {
    const payload = { ...form, year: +form.year || 2026, displayOrder: +form.displayOrder || 0 };
    if (editingItem) updateM.mutate({ id: editingItem.id, data: payload });
    else createM.mutate(payload);
  };

  return (
    <div className="space-y-6 text-left font-body">
      
      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Roadmap Milestones</span>
          <div className="text-2xl font-extrabold dark:text-white text-slate-900 font-display">{roadmapItems.length}</div>
        </div>
        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Active Quarter Focus</span>
          <div className="text-2xl font-extrabold text-accent-violet font-display">Q1 2026</div>
        </div>
        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">In-Progress Milestones</span>
          <div className="text-2xl font-extrabold text-emerald-500 font-display">
            {roadmapItems.filter((r: any) => r.status === 'in_progress').length} In Progress
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b dark:border-zinc-800 border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-slate-900 flex items-center gap-2">
            <Compass className="text-accent-violet" /> Future Vision (Terrasafi)
          </h1>
          <p className="text-xs dark:text-zinc-400 text-slate-600">Edit roadmap quarters and long-term project vision timelines.</p>
        </div>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => { setEditingItem(null); setForm({ title: '', description: '', category: 'Terrasafi', quarter: 'Q1', year: 2026, status: 'planned', displayOrder: 0 }); setModalOpen(true); }}>Add Milestone</Button>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] overflow-hidden bg-white shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="dark:bg-zinc-900/80 bg-slate-50 border-b dark:border-zinc-800 border-slate-200 uppercase tracking-wider dark:text-zinc-400 text-slate-600 font-bold text-[10px]">
            <tr>
              <th className="p-3.5">Timeline Event</th>
              <th className="p-3.5">Quarter / Year</th>
              <th className="p-3.5">Focus Area</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800 divide-slate-200">
            {roadmapItems.map((r: any) => (
              <tr key={r.id} className="dark:hover:bg-zinc-900/50 hover:bg-slate-50">
                <td className="p-3.5">
                  <div className="font-bold dark:text-white text-slate-900">{r.title}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-xs">{r.description}</div>
                </td>
                <td className="p-3.5 font-bold font-mono dark:text-zinc-300 text-slate-800">{r.quarter} {r.year}</td>
                <td className="p-3.5 uppercase text-[10px] font-bold text-accent-violet font-mono">{r.category}</td>
                <td className="p-3.5">
                  <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase", r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500')}>{r.status}</span>
                </td>
                <td className="p-3.5 text-right space-x-1">
                  <button onClick={() => { setEditingItem(r); setForm({ ...r }); setModalOpen(true); }} className="p-1.5 text-accent-violet hover:bg-accent-violet/10 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirmOpen({ open: true, id: r.id })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal 
        isOpen={modalOpen} 
        title={editingItem ? 'Edit Roadmap Milestone' : 'Add Roadmap Milestone'} 
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        }
      >
        <FormField label="Milestone Title"><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} /></FormField>
        <FormField label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={cn(inputCls, 'resize-none')} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Quarter">
            <select value={form.quarter} onChange={(e) => setForm({ ...form, quarter: e.target.value })} className={selectCls}>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </FormField>
          <FormField label="Year"><input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputCls} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectCls}>
              <option value="Terrasafi">Terrasafi Journey</option>
              <option value="Personal">Personal Branding</option>
              <option value="AI Assistant">AI Assistant Engine</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectCls}>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </FormField>
        </div>
        <FormField label="Display Order"><input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} className={inputCls} /></FormField>
      </AdminModal>

      <ConfirmDialog isOpen={confirmOpen.open} title="Delete Milestone?" message="This action will permanently delete this roadmap milestone timeline card." onCancel={() => setConfirmOpen({ open: false })} onConfirm={() => deleteM.mutate(confirmOpen.id || '')} />
    </div>
  );
};

// ─── 6. PARTNERSHIPS ADMIN PAGE ────────────────────────────────────────────────
export const PartnershipsAdminPage: React.FC = () => {
  const qc = useQueryClient();
  const { data: partnershipsData } = useQuery({
    queryKey: ['admin-partnerships'],
    queryFn: () => adminApi.getPartnershipRequests(),
  });

  const updateRequest = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updatePartnershipRequest(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-partnerships'] })
  });

  const deleteRequest = useMutation({
    mutationFn: (id: string) => adminApi.deletePartnershipRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-partnerships'] })
  });

  const defaultPartnerships = [
    {
      id: 'part-1',
      organizationName: 'University of Dar es Salaam Innovation Lab',
      contactName: 'Prof. Godfrey Mvuma',
      contactEmail: 'g.mvuma@udsm.ac.tz',
      collaborationArea: 'AI & Data Science Research',
      message: 'Seeking a strategic partnership to mentor computer science students and collaborate on RAG vector benchmark datasets.',
      status: 'under_review',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'part-2',
      organizationName: 'Terrasafi Foundation',
      contactName: 'Dr. Jane Swai',
      contactEmail: 'jane.swai@terrasafi.org',
      collaborationArea: 'Climate Tech Grant',
      message: 'Proposal for joint environmental telemetry data pipelines.',
      status: 'accepted',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
    }
  ];

  const rawPartnerships = partnershipsData?.items || [];
  const partnerships = rawPartnerships.length > 0 ? rawPartnerships : defaultPartnerships;

  const handleStatusChange = (id: string, status: string) => {
    updateRequest.mutate({ id, status });
  };

  return (
    <div className="space-y-6 text-left font-body">
      
      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Partnership Applications</span>
          <div className="text-2xl font-extrabold dark:text-white text-slate-900 font-display">{partnerships.length}</div>
        </div>
        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Accepted Partners</span>
          <div className="text-2xl font-extrabold text-emerald-500 font-display">
            {partnerships.filter((p: any) => p.status === 'accepted').length} Approved
          </div>
        </div>
        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Under Review</span>
          <div className="text-2xl font-extrabold text-amber-500 font-display">
            {partnerships.filter((p: any) => p.status === 'under_review').length} Reviewing
          </div>
        </div>
      </div>

      <div className="border-b dark:border-zinc-800 border-slate-200 pb-4">
        <h1 className="text-2xl font-bold dark:text-white text-slate-900 flex items-center gap-2">
          <Handshake className="text-accent-violet" /> Partnerships Board
        </h1>
        <p className="text-xs dark:text-zinc-400 text-slate-600">
          Review incoming strategic applications from NGOs, university institutes, and sponsors.
        </p>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] overflow-hidden bg-white shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="dark:bg-zinc-900/80 bg-slate-50 border-b dark:border-zinc-800 border-slate-200 uppercase tracking-wider dark:text-zinc-400 text-slate-600 font-bold text-[10px]">
            <tr>
              <th className="p-3.5">Contact Organization</th>
              <th className="p-3.5">Collaboration Area</th>
              <th className="p-3.5">Message Details</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800 divide-slate-200">
            {partnerships.map((p: any) => (
              <tr key={p.id} className="dark:hover:bg-zinc-900/50 hover:bg-slate-50">
                <td className="p-3.5">
                  <div className="font-bold dark:text-white text-slate-900">{p.organizationName}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{p.contactName} ({p.contactEmail})</div>
                </td>
                <td className="p-3.5 uppercase text-[10px] font-bold text-accent-violet font-mono">{p.collaborationArea}</td>
                <td className="p-3.5 dark:text-zinc-300 text-slate-700 max-w-xs truncate">{p.message}</td>
                <td className="p-3.5">
                  <select
                    value={p.status}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    className="text-[10px] font-bold dark:bg-zinc-900 bg-slate-100 border dark:border-zinc-800 border-slate-300 rounded-lg p-1.5 dark:text-white text-slate-900 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="p-3.5 text-right">
                  <button onClick={() => deleteRequest.mutate(p.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── 7. COMMUNICATION CENTER PAGE ──────────────────────────────────────────────
export const CommunicationCenterPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'inbox' | 'chats' | 'calls' | 'leads' | 'appointments'>('inbox');

  const { data: messagesData } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => adminApi.getMessages()
  });

  const { data: chatsData } = useQuery({
    queryKey: ['admin-chat-sessions-comm'],
    queryFn: () => adminApi.getChatSessions()
  });

  const { data: callsData } = useQuery({
    queryKey: ['admin-calls-comm'],
    queryFn: () => adminApi.getCalls()
  });

  const { data: leadsData } = useQuery({
    queryKey: ['admin-leads-comm'],
    queryFn: () => adminApi.getLeads()
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: () => adminApi.getAppointments()
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => adminApi.markMessageRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] })
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateLead(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-leads-comm'] })
  });

  const messages = messagesData?.items || [];
  const chats = chatsData?.items || (Array.isArray(chatsData) ? chatsData : []);
  const calls = callsData || [];
  const leads = leadsData?.items || [];
  const appointments = appointmentsData?.items || [];

  return (
    <div className="space-y-6 text-left font-body">
      
      {/* Overview Metric Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl border-l-4 border-l-violet-500 dark:border-zinc-800 border-y border-r border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1.5">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">✉ Contact Inquiries</span>
          <div className="text-2xl font-extrabold dark:text-white text-slate-900 font-display flex items-center justify-between">
            <span>{messages.length}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet font-mono">{messages.filter((m: any) => !m.isRead).length} New</span>
          </div>
          <p className="text-[10px] text-zinc-500">Messages waiting for operator review</p>
        </div>

        <div className="p-4 rounded-2xl border-l-4 border-l-emerald-500 dark:border-zinc-800 border-y border-r border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1.5">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">💬 Live Mary Chats</span>
          <div className="text-2xl font-extrabold dark:text-white text-slate-900 font-display flex items-center justify-between">
            <span>{chats.length}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono">Active</span>
          </div>
          <p className="text-[10px] text-zinc-500">Active visitor conversations with Mary</p>
        </div>

        <div className="p-4 rounded-2xl border-l-4 border-l-blue-500 dark:border-zinc-800 border-y border-r border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1.5">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">☎ Customer Calls</span>
          <div className="text-2xl font-extrabold dark:text-white text-slate-900 font-display flex items-center justify-between">
            <span>{calls.length}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-mono">Logged</span>
          </div>
          <p className="text-[10px] text-zinc-500">Mary-authorized calls and call history</p>
        </div>

        <div className="p-4 rounded-2xl border-l-4 border-l-rose-500 dark:border-zinc-800 border-y border-r border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1.5">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">🔥 Lead Queue</span>
          <div className="text-2xl font-extrabold dark:text-white text-slate-900 font-display flex items-center justify-between">
            <span>{leads.length}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-mono">High Priority</span>
          </div>
          <p className="text-[10px] text-zinc-500">Inbound prospects requiring follow-up</p>
        </div>

        <div className="p-4 rounded-2xl border-l-4 border-l-amber-500 dark:border-zinc-800 border-y border-r border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1.5">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">📅 Appointments</span>
          <div className="text-2xl font-extrabold dark:text-white text-slate-900 font-display flex items-center justify-between">
            <span>{appointments.length}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-mono">Booked</span>
          </div>
          <p className="text-[10px] text-zinc-500">Scheduled consultations and meetings</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-zinc-800 border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-slate-900 tracking-tight font-display flex items-center gap-2">
            <Megaphone size={22} className="text-accent-violet" />
            Communication Operations Center
          </h1>
          <p className="text-xs dark:text-zinc-400 text-slate-600">
            Real-time hub for public contact inquiries, live AI conversations, WebRTC calls, lead queue, and appointments.
          </p>
        </div>

        {/* 5 Operational Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl dark:bg-zinc-900 bg-slate-100 border dark:border-zinc-800 border-slate-200">
          <button
            onClick={() => setActiveTab('inbox')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              activeTab === 'inbox'
                ? "bg-accent-violet text-white font-bold shadow-xs"
                : "dark:text-zinc-400 dark:hover:text-white text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800"
            )}
          >
            Contact Forms ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              activeTab === 'chats'
                ? "bg-accent-violet text-white font-bold shadow-xs"
                : "dark:text-zinc-400 dark:hover:text-white text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800"
            )}
          >
            Live AI Chats ({chats.length})
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              activeTab === 'calls'
                ? "bg-accent-violet text-white font-bold shadow-xs"
                : "dark:text-zinc-400 dark:hover:text-white text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800"
            )}
          >
            Calls & Sessions ({calls.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              activeTab === 'leads'
                ? "bg-accent-violet text-white font-bold shadow-xs"
                : "dark:text-zinc-400 dark:hover:text-white text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800"
            )}
          >
            Lead Queue ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              activeTab === 'appointments'
                ? "bg-accent-violet text-white font-bold shadow-xs"
                : "dark:text-zinc-400 dark:hover:text-white text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800"
            )}
          >
            Appointments ({appointments.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Contact Requests & Inbox */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {messages.map((m: any) => (
              <div key={m.id} className="p-5 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold dark:text-white text-slate-900 text-sm">{m.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono">{m.email} • {m.phone || 'No phone'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      m.isRead ? "bg-zinc-500/10 text-zinc-400" : "bg-accent-violet/10 text-accent-violet border border-accent-violet/30"
                    )}>
                      {m.isRead ? 'Read' : 'New Inbound'}
                    </span>
                    {!m.isRead && (
                      <Button size="xs" variant="outline" onClick={() => markReadMutation.mutate(m.id)}>
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-xs font-semibold dark:text-zinc-300 text-slate-800">Subject: {m.subject || 'General Inquiry'}</div>
                <p className="text-xs dark:text-zinc-300 text-slate-700 dark:bg-zinc-950/50 bg-slate-50 p-3.5 rounded-xl border dark:border-zinc-800 border-slate-200 font-body">
                  "{m.content}"
                </p>
                <div className="text-[10px] text-zinc-400 font-mono">Received: {new Date(m.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Live AI Chats & Visitor Sessions */}
      {activeTab === 'chats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {chats.map((s: any) => (
              <div key={s.id} className="p-5 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold dark:text-white text-slate-900 text-sm">Session #{s.id}</h3>
                    <p className="text-xs text-zinc-500 font-mono">Visitor: {s.visitorId || 'Anonymous'} • Messages: {s.messageCount || 8}</p>
                  </div>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    s.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {s.status || 'Active'}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  Created: {new Date(s.createdAt).toLocaleString()} • Last Active: {new Date(s.updatedAt || s.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Calls & Voice Sessions */}
      {activeTab === 'calls' && (
        <div className="rounded-2xl border dark:border-zinc-800 border-slate-200 overflow-hidden bg-white dark:bg-[#09090b]">
          <table className="w-full text-xs text-left">
            <thead className="dark:bg-zinc-900/80 bg-slate-50 dark:text-zinc-400 text-slate-600 border-b dark:border-zinc-800 border-slate-200 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Caller Name</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Started At</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800 divide-slate-200">
              {calls.map((c: any) => (
                <tr key={c.id} className="dark:hover:bg-zinc-900/50 hover:bg-slate-50">
                  <td className="p-3.5 font-bold dark:text-white text-slate-900">{c.callerName || 'Visitor'}</td>
                  <td className="p-3.5">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      c.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono dark:text-zinc-400 text-slate-600">{c.durationSec ? `${c.durationSec} sec` : '—'}</td>
                  <td className="p-3.5 font-mono dark:text-zinc-400 text-slate-600">{new Date(c.startedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Lead Notifications Queue */}
      {activeTab === 'leads' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.map((l: any) => (
            <div key={l.id} className="p-5 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm dark:text-white text-slate-900">{l.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono">{l.email} • {l.phone || 'No phone'}</p>
                </div>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  l.temperature === 'hot' ? "bg-red-500/10 text-red-500 border-red-500/30" :
                  l.temperature === 'warm' ? "bg-amber-500/10 text-amber-500 border-amber-500/30" :
                  "bg-zinc-800 text-zinc-400 border-zinc-700"
                )}>
                  {l.temperature || 'Lead'}
                </span>
              </div>
              <div className="text-xs dark:text-zinc-300 text-slate-700">
                Source: <span className="font-semibold uppercase text-accent-violet">{l.source}</span> • Score: {l.score || 50}/100
              </div>
              <p className="text-xs dark:text-zinc-400 text-slate-600 dark:bg-zinc-950/40 bg-slate-50 p-3 rounded-xl border dark:border-zinc-800 border-slate-200">
                {l.notes || 'Inbound interest generated via digital channel.'}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-zinc-400 font-mono">Stage: {l.stage || 'new'}</span>
                <Button size="xs" variant="outline" onClick={() => updateLeadMutation.mutate({ id: l.id, data: { stage: 'qualified' } })}>
                  Mark Qualified
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Client Appointments */}
      {activeTab === 'appointments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((a: any) => (
            <div key={a.id} className="p-5 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm dark:text-white text-slate-900">{a.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-accent-violet/10 text-accent-violet">
                  {a.status || 'Scheduled'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono">{a.email} • {a.phone || 'No phone'}</p>
              <p className="text-xs dark:text-zinc-300 text-slate-700">Topic: <span className="font-semibold">{a.topic || 'Business Consultation'}</span></p>
              <p className="text-[10px] text-zinc-400 font-mono">Date: {new Date(a.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
