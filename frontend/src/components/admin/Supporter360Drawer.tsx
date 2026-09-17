import React, { useState } from 'react';
import { X, Heart, Mail, Send, MessageSquare } from 'lucide-react';
import { Button } from '../atoms/Button';
import { useToast } from '../atoms/Toast';

interface Supporter360DrawerProps {
  supporter: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Supporter360Drawer: React.FC<Supporter360DrawerProps> = ({ supporter, isOpen, onClose }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'timeline' | 'communication'>('profile');
  const [emailSubject, setEmailSubject] = useState('Thank You for Supporting Denis Chamkaga OS');
  const [emailBody, setEmailBody] = useState('');

  if (!isOpen || !supporter) return null;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = supporter.supporterEmail || supporter.email;
    window.open(`mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
    toast.info('Your email application has been opened with this message.', 'Email draft');
  };

  const handleSendWhatsApp = () => {
    const phone = supporter.supporterPhone || supporter.phone || '';
    if (!phone) {
      toast.error('This supporter has no verified phone number.', 'WhatsApp');
      return;
    }
    const text = encodeURIComponent(`Habari ${supporter.supporterName || supporter.fullName}, ahsante sana kwa mchango wako wa ${supporter.tier || 'Vision Supporter'} katika kusaidia Denis Chamkaga OS!`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs font-body">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col text-left">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-accent-violet/10 border border-accent-violet/20 text-accent-violet">
                <Heart size={20} className="fill-accent-violet/20" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white font-display">
                  {supporter.supporterName || supporter.fullName}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400 font-mono">
                  <span>{supporter.supporterEmail || supporter.email}</span>
                  <span>•</span>
                  <span>{supporter.country || 'Tanzania'}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800">
              <X size={18} />
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-900/40 border-b border-zinc-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500">Current Tier</span>
              <div className="font-bold text-accent-violet mt-0.5 uppercase tracking-wider font-mono">
                {supporter.tier || 'VISION_BUILDER'}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500">Lifetime Support</span>
              <div className="font-bold text-emerald-400 font-mono mt-0.5">
                {(supporter.totalLifetimeAmount || supporter.amount || 0).toLocaleString()} TZS
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500">Type</span>
              <div className="font-bold text-amber-400 uppercase font-mono mt-0.5">
                {supporter.isRecurring ? 'Recurring Monthly' : 'One-Time'}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 px-6 pt-3">
            {[
              { id: 'profile', label: 'Supporter Profile' },
              { id: 'history', label: 'Contribution History' },
              { id: 'timeline', label: 'Unified Activity Timeline' },
              { id: 'communication', label: 'Send Communication' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs font-bold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-accent-violet text-accent-violet'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Key Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Supporter Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-500">Phone Contact</span>
                      <div className="font-mono font-bold text-slate-800 dark:text-white mt-0.5">{supporter.supporterPhone || supporter.phone || '—'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-500">Payment Provider</span>
                      <div className="font-mono font-bold text-slate-800 dark:text-white mt-0.5">{supporter.paymentProvider || 'DPO / Mobile Money'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-500">Status</span>
                      <div className="font-mono font-bold text-emerald-400 mt-0.5 uppercase">{supporter.status || 'Active'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-500">Join Date</span>
                      <div className="font-mono font-bold text-slate-800 dark:text-white mt-0.5">{supporter.createdAt ? new Date(supporter.createdAt).toLocaleDateString() : '—'}</div>
                    </div>
                  </div>
                </div>

                {/* One-Click Action Trigger Strip */}
                <div className="pt-4 border-t border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Direct Actions</h4>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSendWhatsApp} leftIcon={<MessageSquare size={14} className="text-emerald-500" />}>
                      Send WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('communication')} leftIcon={<Mail size={14} className="text-blue-500" />}>
                      Send Email
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recorded Contribution Timeline</h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white">Support Contribution ({supporter.tier || 'VISION_BUILDER'})</div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{supporter.receiptNumber || 'Receipt pending'} • {supporter.paymentMethod || 'Payment method not recorded'}</div>
                    </div>
                    <span className="font-bold font-mono text-emerald-400 text-sm">{Number(supporter.amount || 0).toLocaleString()} TZS</span>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'timeline' && (
              <div className="space-y-4 font-body">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Unified Customer Lifecycle Timeline (Driven by business_activities)
                </h4>
                <div className="relative pl-6 space-y-4 text-xs border-l border-zinc-800">
                  {(supporter.activities || []).map((evt: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-accent-violet border-2 border-zinc-900" />
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-white text-xs">{evt.title}</span>
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet">
                            {evt.source}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-body">{evt.desc}</p>
                        <div className="text-[9px] text-zinc-500 font-mono">{evt.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'communication' && (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Subject</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Message</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Type your appreciation note or campaign update here..."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
                  />
                </div>
                <Button type="submit" variant="primary" leftIcon={<Send size={14} />}>
                  Dispatch Email Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
