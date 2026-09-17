import React from 'react';

export const SalesPipelineTab: React.FC<{ leads?: any[] }> = ({ leads = [] }) => {
  const itemFor = (lead: any) => ({
    id: lead.id,
    name: lead.organizationName || lead.organization?.name || lead.company || lead.name || 'Lead',
    amount: lead.estimatedValue ? `TZS ${Number(lead.estimatedValue).toLocaleString()}` : 'Value not confirmed',
    contact: lead.firstName ? `${lead.firstName} ${lead.lastName || ''}`.trim() : lead.name || lead.email || 'Contact pending',
    date: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—',
  });
  const inStage = (...stages: string[]) => leads
    .filter((lead) => stages.includes(String(lead.stage || lead.status || 'new').toLowerCase()))
    .map(itemFor);
  const columns = [
    {
      id: 'lead',
      title: 'New Leads',
      color: 'border-blue-500',
      badge: 'bg-blue-500/10 text-blue-500',
      items: inStage('new', 'contacted'),
    },
    {
      id: 'consultation',
      title: 'Consultation',
      color: 'border-amber-500',
      badge: 'bg-amber-500/10 text-amber-500',
      items: inStage('consultation', 'qualified'),
    },
    {
      id: 'quote',
      title: 'Quotation Sent',
      color: 'border-accent-violet',
      badge: 'bg-accent-violet/10 text-accent-violet',
      items: inStage('proposal', 'quotation', 'quote_sent'),
    },
    {
      id: 'won',
      title: 'Won & Project Started',
      color: 'border-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-500',
      items: inStage('won', 'converted', 'project_started'),
    },
  ];

  return (
    <div className="space-y-4 text-left font-body">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white font-display">Sales Opportunity Pipeline</h3>
          <p className="text-xs text-zinc-500">Visual opportunity funnel from lead capture to project start</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="p-4 rounded-2xl border dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 space-y-3 min-w-[260px]">
            <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-2">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${col.badge} px-2.5 py-0.5 rounded-full border border-current`}>
                {col.title} ({col.items.length})
              </span>
            </div>

            <div className="space-y-3">
              {col.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-2 hover:border-accent-violet transition-colors cursor-pointer"
                >
                  <div className="font-bold text-sm text-slate-800 dark:text-white">{item.name}</div>
                  <div className="text-xs font-mono font-semibold text-emerald-500">{item.amount}</div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t dark:border-zinc-800/80">
                    <span>{item.contact}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
