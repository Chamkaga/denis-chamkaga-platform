import React from 'react';

export const SalesPipelineTab: React.FC = () => {
  const columns = [
    {
      id: 'lead',
      title: 'New Leads',
      color: 'border-blue-500',
      badge: 'bg-blue-500/10 text-blue-500',
      items: [
        { id: 'p-1', name: 'Kilimanjaro Tech', amount: 'TZS 4,500,000', contact: 'Grace Massawe', date: 'Jul 30' },
        { id: 'p-2', name: 'Zanzibar Logistics', amount: 'TZS 1,800,000', contact: 'Salim Ally', date: 'Jul 29' },
      ],
    },
    {
      id: 'consultation',
      title: 'Consultation',
      color: 'border-amber-500',
      badge: 'bg-amber-500/10 text-amber-500',
      items: [
        { id: 'p-3', name: 'Serengeti Breweries', amount: 'TZS 8,000,000', contact: 'David Kimaro', date: 'Jul 26' },
      ],
    },
    {
      id: 'quote',
      title: 'Quotation Sent',
      color: 'border-accent-violet',
      badge: 'bg-accent-violet/10 text-accent-violet',
      items: [
        { id: 'p-4', name: 'CRDB Bank Plc', amount: 'TZS 12,500,000', contact: 'Flora Shirima', date: 'Jul 24' },
      ],
    },
    {
      id: 'won',
      title: 'Won & Project Started',
      color: 'border-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-500',
      items: [
        { id: 'p-5', name: 'Azam Media Ltd', amount: 'TZS 850,000', contact: 'Baraka John', date: 'Jul 20' },
      ],
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
