// DenisAssistantPage/components/VisitorInfoDialog.tsx
import React from 'react';
import { X, Sparkles, Terminal, Award } from 'lucide-react';

interface VisitorInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionMeta: {
    sessionId: string;
    intent: string;
    leadScore: number;
    temperature: string;
    recommendation?: string;
    facts?: {
      name?: string;
      company?: string;
      industry?: string;
      budget?: string;
      timeline?: string;
      branches?: number;
      phone?: string;
      email?: string;
    };
  } | null;
}

export const VisitorInfoDialog: React.FC<VisitorInfoDialogProps> = ({
  isOpen,
  onClose,
  sessionMeta,
}) => {
  if (!isOpen) return null;

  const facts = sessionMeta?.facts || {};
  const score = sessionMeta?.leadScore ?? 0;
  const temp = sessionMeta?.temperature || 'cold';

  const getTempBadgeColor = (t: string) => {
    if (t === 'hot') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (t === 'warm') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3.5 border-b dark:border-zinc-800/60 light:border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-accent-violet" />
            <h3 className="text-sm font-bold dark:text-white light:text-slate-800 font-display">
              Visitor Information (AI Memory Console)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg dark:hover:bg-zinc-800/80 light:hover:bg-slate-100 dark:text-zinc-400 light:text-zinc-500 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[360px] scrollbar text-left">
          {/* Main Grade Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border dark:border-zinc-800/80 light:border-slate-150 dark:bg-zinc-950/40 light:bg-slate-50 space-y-1">
              <span className="text-[10px] dark:text-zinc-500 light:text-slate-400 font-semibold uppercase">Lead Score</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-accent-violet">{score}%</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getTempBadgeColor(temp)}`}>
                  {temp}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-zinc-800/80 rounded-full h-1.5 mt-1 overflow-hidden">
                <div 
                  className="bg-accent-violet h-full rounded-full transition-all duration-500" 
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl border dark:border-zinc-800/80 light:border-slate-150 dark:bg-zinc-950/40 light:bg-slate-50 space-y-1">
              <span className="text-[10px] dark:text-zinc-500 light:text-slate-400 font-semibold uppercase font-display">Detected Intent</span>
              <p className="text-sm font-bold dark:text-white light:text-slate-800 truncate">
                {sessionMeta?.intent || 'General Inquiry'}
              </p>
              <span className="text-[9px] dark:text-zinc-500 light:text-slate-400 italic block mt-1">
                Classified in Real-time
              </span>
            </div>
          </div>

          {/* Session Profile */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-extrabold dark:text-zinc-400 light:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={11} className="text-accent-violet" /> Extracted Facts Memory
            </h4>

            <div className="border dark:border-zinc-850 light:border-slate-150 rounded-xl divide-y dark:divide-zinc-850 light:divide-slate-100 overflow-hidden text-xs">
              <div className="flex justify-between p-2.5 dark:bg-zinc-950/20">
                <span className="dark:text-zinc-500 light:text-slate-400 font-medium">Session UUID</span>
                <span className="font-mono text-[10px] dark:text-zinc-300 light:text-slate-700 truncate max-w-[180px]">
                  {sessionMeta?.sessionId || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between p-2.5">
                <span className="dark:text-zinc-500 light:text-slate-400 font-medium">Visitor Name</span>
                <span className="dark:text-white light:text-slate-800 font-semibold">
                  {facts.name || 'Not provided yet'}
                </span>
              </div>

              <div className="flex justify-between p-2.5">
                <span className="dark:text-zinc-500 light:text-slate-400 font-medium">Industry Type</span>
                <span className="dark:text-white light:text-slate-800 font-semibold uppercase">
                  {facts.industry || 'Not detected'}
                </span>
              </div>

              <div className="flex justify-between p-2.5">
                <span className="dark:text-zinc-500 light:text-slate-400 font-medium">Branches Count</span>
                <span className="dark:text-white light:text-slate-800 font-semibold">
                  {facts.branches || 'Not specified'}
                </span>
              </div>

              <div className="flex justify-between p-2.5">
                <span className="dark:text-zinc-500 light:text-slate-400 font-medium">Budget Bracket</span>
                <span className="dark:text-white light:text-slate-800 font-semibold truncate max-w-[180px]">
                  {facts.budget || 'Not specified'}
                </span>
              </div>

              <div className="flex justify-between p-2.5">
                <span className="dark:text-zinc-500 light:text-slate-400 font-medium">Contact Email</span>
                <span className="dark:text-white light:text-slate-800 font-mono text-[11px]">
                  {facts.email || 'None'}
                </span>
              </div>

              <div className="flex justify-between p-2.5">
                <span className="dark:text-zinc-500 light:text-slate-400 font-medium">Contact Phone</span>
                <span className="dark:text-white light:text-slate-800 font-mono text-[11px]">
                  {facts.phone || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Recommendation */}
          {sessionMeta?.recommendation && (
            <div className="p-3 rounded-xl dark:bg-accent-violet/10 light:bg-violet-50/50 border dark:border-accent-violet/20 light:border-violet-100 space-y-1">
              <h4 className="text-[10px] font-bold text-accent-violet uppercase tracking-widest flex items-center gap-1">
                <Award size={12} /> Next Best Channel
              </h4>
              <p className="text-xs dark:text-zinc-300 light:text-slate-700 leading-relaxed font-body">
                {sessionMeta.recommendation}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t dark:border-zinc-800/60 light:border-slate-100 dark:bg-zinc-950/20 light:bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-accent-violet hover:bg-accent-violet-hover text-white transition-all cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
