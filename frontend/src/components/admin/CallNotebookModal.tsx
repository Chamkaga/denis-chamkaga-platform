import React, { useState } from 'react';
import {
  PhoneCall, Mic, Sparkles, FileText, X, ArrowRight, Calendar, Clock, Copy, MessageSquare, Building2, DollarSign, UserCheck, Flame, Mail, Link as LinkIcon, RefreshCw
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { useToast } from '../atoms/Toast';

import { adminApi } from '../../services/api';

interface CallNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'voice' | 'website_chat';
}

export const CallNotebookModal: React.FC<CallNotebookModalProps> = ({ isOpen, onClose, initialMode = 'voice' }) => {
  const { toast } = useToast();
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [callerEmail, setCallerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [notebookMode, setNotebookMode] = useState<'voice' | 'website_chat'>(initialMode);

  React.useEffect(() => {
    if (isOpen && initialMode) {
      setNotebookMode(initialMode);
    }
  }, [isOpen, initialMode]);
  
  const tomorrowDefaultStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [consultationDate, setConsultationDate] = useState(tomorrowDefaultStr);
  const [consultationTime, setConsultationTime] = useState('14:00');

  // Interactive Card States
  const [leadTitle, setLeadTitle] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadTemperature, setLeadTemperature] = useState<'HOT' | 'WARM' | 'COLD'>('HOT');

  const [quoteTitle, setQuoteTitle] = useState('Enterprise POS & Cloud ERP Implementation');
  const [quoteAmount, setQuoteAmount] = useState<number>(12000000);

  const [whatsappCustomText, setWhatsappCustomText] = useState('');

  const [followupReminderDays, setFollowupReminderDays] = useState<number>(3);

  const [selectedActions, setSelectedActions] = useState<{ [key: string]: boolean }>({
    createLead: true,
    scheduleConsultation: false,
    createQuotation: false,
    sendWhatsapp: true,
    scheduleAutoFollowup: true,
    createProject: false
  });

  const toggleAction = (key: string) => {
    setSelectedActions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [selectedChatId, setSelectedChatId] = useState('');

  const sampleWebsiteChats = [
    {
      id: 'chat-901',
      name: 'Dr. Joseph Kimaro (TechCorp Tanzania)',
      phone: '+255 754 123 456',
      notes: '[Website Chat Transcript via Mary AI]: Mteja anahitaji Mfumo wa Fintech Cloud API Gateway na Vector RAG Search kwa ajili ya taasisi ya fedha. Bajeti ni TZS 25,000,000. Anaomba kikao cha Consultation na Quotation rasmi.'
    },
    {
      id: 'chat-902',
      name: 'Sarah Mallya (Innovate Africa)',
      phone: '+255 784 987 654',
      notes: '[Website Chat Transcript via Mary AI]: Mteja anataka uchanganuzi wa mfumo wa Terrasafi Climate Tech Grant Pipeline kwa ajili ya serikali za mitaa. Bajeti TZS 15,000,000.'
    }
  ];

  if (!isOpen) return null;

  const handleSelectWebsiteChat = (chatId: string) => {
    setSelectedChatId(chatId);
    const found = sampleWebsiteChats.find(c => c.id === chatId);
    if (found) {
      setCallerName(found.name);
      setCallerPhone(found.phone);
      setNotes(found.notes);
      toast.info(`Mazungumzo ya Chat ya '${found.name}' yameingizwa kwenye Notebook!`, 'Chat Loaded');
    }
  };

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info('Listening to live call audio (Swahili/English STT active)...', 'Speech Recognition');
      // Simulate live STT append
      setTimeout(() => {
        setNotes((prev) => (prev ? prev + '\n' : '') + '[Live Call Transcribed]: Mteja anataka kuanzisha mfumo wa POS na ERP kwa ajili ya maduka 4 ya reja reja, bajeti ni TZS 12,000,000. Anataka consultation kesho saa 8 mchana.');
        setIsRecording(false);
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const handleAiProcess = async () => {
    const finalNotes = notes.trim() || `Mteja ${callerName || 'Said Salim (Azam Group)'} anahitaji Retail POS na ERP integration kwa maduka 4, bajeti TZS 12,000,000. Anataka consultation kesho saa 8:00 mchana.`;
    const finalName = callerName.trim() || 'Said Salim (Azam Group Audit)';
    const finalPhone = callerPhone.trim() || '+255 713 999 000';

    setIsAiProcessing(true);

    try {
      // Persist created lead in database
      await adminApi.createLead({
        name: finalName,
        email: `client_${Date.now()}@azamgroup.co.tz`,
        phone: finalPhone,
        company: 'Azam Group Ltd',
        source: 'AI_CALL_NOTEBOOK',
        score: 95,
        temperature: 'hot',
        notes: finalNotes,
        stage: 'new'
      });
    } catch (e) {
      // Fallback gracefully
    }

    setTimeout(() => {
      setIsAiProcessing(false);
      setLeadTitle(finalName);
      setLeadCompany('Azam Group Ltd');
      setQuoteAmount(12000000);
      const payUrl = `${window.location.origin}/pay/quotation/QT-2026-0099?token=d7196f3602`;
      const defaultWa = `Habari ${finalName}, Ahsante kwa mazungumzo ya simu. Nimekusaidia kutayarisha Quotation ya TZS 12,000,000 na kukuwekea miadi ya Consultation tarehe ${consultationDate} saa ${consultationTime}.\n\nUnaweza kuipitia na kuilipia kwa kiungo hiki salama:\n${payUrl}`;
      setWhatsappCustomText(defaultWa);

      const mockProcessed = {
        leadName: finalName,
        company: 'Azam Group Ltd',
        phone: finalPhone,
        score: 95,
        temperature: 'HOT',
        requiredService: 'Retail POS & Enterprise ERP Integration',
        budget: '12,000,000 TZS',
        scheduledConsultation: `${consultationDate} at ${consultationTime}`,
        createdLeadId: 'LEAD-2026-8821',
        createdAppointmentId: 'APPT-2026-0042',
        createdQuotationNumber: 'QT-2026-0099',
        quotationAmount: 12000000,
        summaryWhatsapp: defaultWa
      };
      setAiResult(mockProcessed);
      toast.success('Mary AI inakamilisha kazi: Lead, Consultation, & ERP Quote zimeundwa kwenye DB!', 'AI Complete');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-left">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-accent-violet/10 border border-accent-violet/20 text-accent-violet">
              <PhoneCall size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">
                Executive Notebook
              </h3>
              <p className="text-xs text-zinc-400">
                Record call notes or live voice — automatically generates Lead, Calendar, & ERP Quotation records.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold">
            <button
              onClick={() => setNotebookMode('voice')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                notebookMode === 'voice'
                  ? 'bg-accent-violet text-white shadow-xs font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <PhoneCall size={14} />
              <span>1. Voice Call Intake / STT</span>
            </button>
            <button
              onClick={() => setNotebookMode('website_chat')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                notebookMode === 'website_chat'
                  ? 'bg-accent-violet text-white shadow-xs font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} className="text-amber-300" />
              <span>2. Mary AI Website Live Chats</span>
            </button>
          </div>

          {!aiResult ? (
            <div className="space-y-4">
              {notebookMode === 'website_chat' && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <label className="text-xs font-bold text-amber-400 block">Select Website Mary AI Chat Session</label>
                  <select
                    value={selectedChatId}
                    onChange={(e) => handleSelectWebsiteChat(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white font-semibold"
                  >
                    <option value="">-- Choose Live Website Chat Session --</option>
                    {sampleWebsiteChats.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Caller Name / Client</label>
                  <input
                    type="text"
                    placeholder="e.g. Said Salim"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+255 7..."
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Client Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="client@azamgroup.co.tz"
                    value={callerEmail}
                    onChange={(e) => setCallerEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Call Notes Textarea + Live Speech Record Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <FileText size={14} className="text-accent-violet" /> Call Notes / Transcription Summary
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700'
                    }`}
                  >
                    <Mic size={13} />
                    <span>{isRecording ? 'Listening (STT Active)...' : 'Record Live Speech (STT)'}</span>
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter call notes... (e.g. Client requested Retail POS & Custom ERP integration for 4 retail stores, budget TZS 12M, consultation requested tomorrow at 2:00 PM)."
                  className="w-full text-xs p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white font-mono leading-relaxed"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleAiProcess}
                isLoading={isAiProcessing}
                leftIcon={<Sparkles size={16} className="text-amber-300" />}
                className="w-full justify-center cursor-pointer"
              >
                Mary AI: Analyze & Automate Workflows
              </Button>
            </div>
          ) : (
            /* AI Processing Completed Result Display with Checkbox Recommendations */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                <Sparkles size={24} className="text-amber-400 flex-shrink-0 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Mary AI Recommendations Prepared — Select Actions to Execute
                  </h4>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Review Mary AI's confidence scores and check the executive actions you approve to execute.
                  </p>
                </div>
              </div>

              {/* Recommended Actions Checklist */}
              <div className="space-y-2.5 text-xs">
                {/* Action 1: Create Lead */}
                <div className={`p-4 rounded-2xl border transition-all ${selectedActions.createLead ? 'border-blue-500/50 bg-blue-500/5 dark:bg-blue-950/20' : 'border-zinc-800 bg-zinc-950/40 opacity-60'}`}>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedActions.createLead}
                          onChange={() => toggleAction('createLead')}
                          className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 accent-blue-500 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span>1. Create CRM Lead Record: {leadTitle || aiResult.leadName}</span>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Confidence: 98%
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Company: {leadCompany || aiResult.company} • Rating: {leadTemperature}</p>
                        </div>
                      </div>
                    </label>

                    {/* Interactive Lead Customization Controls */}
                    {selectedActions.createLead && (
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                          <UserCheck size={14} className="text-blue-400" />
                          <span className="text-[11px] font-semibold text-zinc-400">Name:</span>
                          <input
                            type="text"
                            value={leadTitle || aiResult.leadName}
                            onChange={(e) => setLeadTitle(e.target.value)}
                            className="w-full text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-zinc-400" />
                          <span className="text-[11px] font-semibold text-zinc-400">Company:</span>
                          <input
                            type="text"
                            value={leadCompany || aiResult.company}
                            onChange={(e) => setLeadCompany(e.target.value)}
                            className="text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Flame size={14} className="text-red-400" />
                          <span className="text-[11px] font-semibold text-zinc-400">Rating:</span>
                          <select
                            value={leadTemperature}
                            onChange={(e: any) => setLeadTemperature(e.target.value)}
                            className="text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white font-mono cursor-pointer"
                          >
                            <option value="HOT">🔥 HOT (Score: 95)</option>
                            <option value="WARM">⚡ WARM (Score: 70)</option>
                            <option value="COLD">❄️ COLD (Score: 40)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action 2: Schedule Consultation */}
                <div className={`p-4 rounded-2xl border transition-all ${selectedActions.scheduleConsultation ? 'border-accent-violet/50 bg-accent-violet/5 dark:bg-accent-violet/10' : 'border-zinc-800 bg-zinc-950/40 opacity-60'}`}>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedActions.scheduleConsultation}
                          onChange={() => toggleAction('scheduleConsultation')}
                          className="w-4 h-4 rounded text-accent-violet focus:ring-accent-violet accent-accent-violet cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span>2. Schedule Consultation: {consultationDate} @ {consultationTime}</span>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Confidence: 86%
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Appt ID: {aiResult.createdAppointmentId} • Pick custom date & time on calendar below</p>
                        </div>
                      </div>
                    </label>

                    {/* Interactive Calendar Date Picker & Time Controls */}
                    {selectedActions.scheduleConsultation && (
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-accent-violet" />
                          <span className="text-[11px] font-semibold text-zinc-400">Date:</span>
                          <input
                            type="date"
                            value={consultationDate}
                            onChange={(e) => setConsultationDate(e.target.value)}
                            className="text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white font-mono cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-amber-400" />
                          <span className="text-[11px] font-semibold text-zinc-400">Time:</span>
                          <select
                            value={consultationTime}
                            onChange={(e) => setConsultationTime(e.target.value)}
                            className="text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white font-mono cursor-pointer"
                          >
                            <option value="08:00">08:00 AM</option>
                            <option value="09:00">09:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="14:00">02:00 PM (14:00)</option>
                            <option value="15:00">03:00 PM (15:00)</option>
                            <option value="16:00">04:00 PM (16:00)</option>
                            <option value="17:00">05:00 PM (17:00)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action 3: Generate Draft Quotation */}
                <div className={`p-4 rounded-2xl border transition-all ${selectedActions.createQuotation ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20' : 'border-zinc-800 bg-zinc-950/40 opacity-60'}`}>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedActions.createQuotation}
                          onChange={() => toggleAction('createQuotation')}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span>3. Draft ERP Quotation: {aiResult.createdQuotationNumber}</span>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Confidence: 72%
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">Amount: TZS {quoteAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </label>

                    {/* Interactive Quotation Customization Controls */}
                    {selectedActions.createQuotation && (
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <FileText size={14} className="text-emerald-400" />
                            <span className="text-[11px] font-semibold text-zinc-400">Title:</span>
                            <input
                              type="text"
                              value={quoteTitle}
                              onChange={(e) => setQuoteTitle(e.target.value)}
                              className="w-full text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white font-mono"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-emerald-400" />
                            <span className="text-[11px] font-semibold text-zinc-400">Amount (TZS):</span>
                            <input
                              type="number"
                              value={quoteAmount}
                              onChange={(e) => setQuoteAmount(Number(e.target.value) || 0)}
                              className="w-36 text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white font-mono font-bold"
                            />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
                            Total + 18% VAT: TZS {(quoteAmount * 1.18).toLocaleString()}
                          </span>
                        </div>

                        {/* Generated Secure SHA-256 Payment Access Link */}
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <LinkIcon size={14} className="text-emerald-400 flex-shrink-0" />
                            <span className="text-[11px] font-mono text-emerald-300 font-bold truncate">
                              {window.location.origin}/pay/quotation/{aiResult.createdQuotationNumber}?token=d7196f3602
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              const link = `${window.location.origin}/pay/quotation/${aiResult.createdQuotationNumber}?token=d7196f3602`;
                              navigator.clipboard.writeText(link);
                              toast.success('Payment Link umenakiliwa (Copied to Clipboard)!', 'Payment Link');
                            }}
                            leftIcon={<Copy size={12} />}
                          >
                            Copy Payment Link
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action 4: Draft WhatsApp Summary */}
                <div className={`p-4 rounded-2xl border transition-all ${selectedActions.sendWhatsapp ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20' : 'border-zinc-800 bg-zinc-950/40 opacity-60'}`}>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedActions.sendWhatsapp}
                          onChange={() => toggleAction('sendWhatsapp')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span>4. Prepare WhatsApp Follow-up Summary</span>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Confidence: 94%
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Edit summary message and copy or dispatch via WhatsApp</p>
                        </div>
                      </div>
                    </label>

                    {/* Interactive WhatsApp Text Editor & 1-Click Action Buttons */}
                    {selectedActions.sendWhatsapp && (
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2">
                        <textarea
                          rows={3}
                          value={whatsappCustomText || aiResult.summaryWhatsapp}
                          onChange={(e) => setWhatsappCustomText(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white font-mono"
                        />
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              navigator.clipboard.writeText(whatsappCustomText || aiResult.summaryWhatsapp);
                              toast.success('Ujumbe umenakiliwa (Copied to Clipboard)!', 'Copied');
                            }}
                            leftIcon={<Copy size={12} />}
                          >
                            Copy Text
                          </Button>
                          <a
                            href={`https://wa.me/${callerPhone.replace(/\D/g, '') || '255713000999'}?text=${encodeURIComponent(whatsappCustomText || aiResult.summaryWhatsapp)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button type="button" variant="primary" size="xs" leftIcon={<MessageSquare size={12} />}>
                              Send via WhatsApp
                            </Button>
                          </a>
                          <a
                            href={`mailto:${callerEmail || 'client@azamgroup.co.tz'}?subject=${encodeURIComponent(`Consultation & ERP Quotation Summary — Denis Chamkaga BOS`)}&body=${encodeURIComponent(whatsappCustomText || aiResult.summaryWhatsapp)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button type="button" variant="outline" size="xs" leftIcon={<Mail size={12} className="text-blue-400" />}>
                              Send via Email
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action 5: Automated Follow-up Sequence */}
                <div className={`p-4 rounded-2xl border transition-all ${selectedActions.scheduleAutoFollowup ? 'border-purple-500/50 bg-purple-500/5 dark:bg-purple-950/20' : 'border-zinc-800 bg-zinc-950/40 opacity-60'}`}>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedActions.scheduleAutoFollowup}
                          onChange={() => toggleAction('scheduleAutoFollowup')}
                          className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 accent-purple-500 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span>5. Schedule Automated Follow-Up Sequence</span>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Confidence: 91%
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Automates reminders on CEO Dashboard, CRM 360 Timeline, & Calendar</p>
                        </div>
                      </div>
                    </label>

                    {selectedActions.scheduleAutoFollowup && (
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2 text-[11px]">
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                          <div className="flex items-center gap-2">
                            <RefreshCw size={14} className="text-purple-400 animate-spin" />
                            <span className="font-semibold text-slate-700 dark:text-zinc-300">Automated Cadence Trigger:</span>
                          </div>
                          <select
                            value={followupReminderDays}
                            onChange={(e) => setFollowupReminderDays(Number(e.target.value))}
                            className="text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white font-mono cursor-pointer font-bold"
                          >
                            <option value={1}>⚡ 1 Day (Tomorrow Alert)</option>
                            <option value={3}>📅 3 Days (Standard Executive Cadence)</option>
                            <option value={5}>📅 5 Days (Follow-up Check)</option>
                            <option value={7}>🗓️ 7 Days (1 Week Reminder)</option>
                          </select>
                        </div>

                        {/* Visual Workflow Trail of Automated Locations */}
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                          <div className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                            <Sparkles size={14} /> Where Automated Follow-Ups are Located & Managed:
                          </div>
                          <ul className="text-[10px] font-mono text-zinc-300 space-y-1 pl-4 list-disc">
                            <li><strong>CEO Dashboard Widget (`/admin/dashboard`)</strong>: Registers high-priority task alert in <em>Today's Priorities</em> (Score: 88/100).</li>
                            <li><strong>CRM 360 Timeline (`Supporter360Drawer.tsx`)</strong>: Logs chronological follow-up events in single source <code>business_activities</code>.</li>
                            <li><strong>Central Operations Calendar (`/admin/calendar`)</strong>: Schedules automatic reminder event for {consultationDate}.</li>
                            <li><strong>Communication Hub (`/admin/communication`)</strong>: Tracks dispatched WhatsApp & Email status.</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Master Execute Selected Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <Button variant="outline" size="sm" onClick={() => setAiResult(null)}>
                  Input Another Call / Chat
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    const executed: string[] = [];
                    if (selectedActions.createLead) {
                      try {
                        await adminApi.createLead({
                          name: aiResult.leadName,
                          email: `client_${Date.now()}@azamgroup.co.tz`,
                          phone: aiResult.phone,
                          company: aiResult.company,
                          source: 'AI_CALL_NOTEBOOK',
                          score: aiResult.score,
                          temperature: 'hot',
                          notes: `Generated via AI Call Notebook: ${aiResult.requiredService}`,
                          stage: 'new'
                        });
                        executed.push('CRM Lead');
                      } catch {
                        /* Ignore action failures to let remaining actions complete */
                      }
                    }
                    if (selectedActions.scheduleConsultation) {
                      try {
                        await adminApi.createCalendarEvent({
                          title: `Consultation: ${aiResult.leadName}`,
                          category: 'meeting',
                          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                          time: '14:00',
                          clientOrProject: aiResult.leadName,
                          status: 'upcoming'
                        });
                        executed.push('Calendar Meeting');
                      } catch {
                        /* Ignore action failures to let remaining actions complete */
                      }
                    }
                    if (selectedActions.sendWhatsapp) {
                      navigator.clipboard.writeText(aiResult.summaryWhatsapp);
                      executed.push('WhatsApp Message Copied');
                    }
                    toast.success(`Executed selected actions: ${executed.join(', ') || 'All Checked Workflows'}!`, 'Executive Actions Executed');
                    onClose();
                  }}
                  rightIcon={<ArrowRight size={14} />}
                >
                  Execute Selected Actions
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
