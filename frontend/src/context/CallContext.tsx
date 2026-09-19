// frontend/src/context/CallContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Play, Pause, Edit3, User, Sparkles, Check } from 'lucide-react';
import { audioSynth } from '../lib/audio-synth';
import { adminApi } from '../services/api';
import { useToast } from '../components/atoms/Toast';

export type CallState = 
  | 'idle' 
  | 'ringing' 
  | 'connecting' 
  | 'connected' 
  | 'ended' 
  | 'declined' 
  | 'timeout' 
  | 'failed' 
  | 'disconnected' 
  | 'reconnecting'
  | 'summary_pending';

interface CallSessionMeta {
  sessionId: string;
  callerName: string;
  email?: string;
  company?: string;
  page?: string;
  interest?: string;
  leadScore?: number;
  temperature?: string;
  customerBrief?: any;
}

interface CallContextProps {
  activeCall: CallSessionMeta | null;
  callState: CallState;
  duration: number;
  isMuted: boolean;
  isHeld: boolean;
  liveNotes: string;
  setLiveNotes: (notes: string) => void;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  hangupCall: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
}

const CallContext = createContext<CallContextProps | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within a CallProvider');
  return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCall, setActiveCall] = useState<CallSessionMeta | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [liveNotes, setLiveNotes] = useState('');
  const [crmSummary, setCrmSummary] = useState<any>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { toast } = useToast();

  const adminPcRef = useRef<RTCPeerConnection | null>(null);
  const adminStreamRef = useRef<MediaStream | null>(null);
  const pollIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const ringerTimeoutRef = useRef<any>(null);

  // Restore draft call notes and summaries on mount
  useEffect(() => {
    try {
      const savedMeta = localStorage.getItem('call_active_meta_draft');
      const savedNotes = localStorage.getItem('call_live_notes_draft') || '';
      const savedSummary = localStorage.getItem('call_crm_summary_draft');

      if (savedMeta) {
        setActiveCall(JSON.parse(savedMeta));
        setLiveNotes(savedNotes);
        if (savedSummary) {
          setCrmSummary(JSON.parse(savedSummary));
        }
        setCallState('summary_pending');
      }
    } catch (err) {
      console.error('Failed to restore call session draft:', err);
    }
  }, []);

  // Sync draft states to localStorage
  useEffect(() => {
    if (activeCall) {
      localStorage.setItem('call_active_meta_draft', JSON.stringify(activeCall));
    }
  }, [activeCall]);

  useEffect(() => {
    if (activeCall) {
      localStorage.setItem('call_live_notes_draft', liveNotes);
    }
  }, [liveNotes, activeCall]);

  useEffect(() => {
    if (activeCall && crmSummary) {
      localStorage.setItem('call_crm_summary_draft', JSON.stringify(crmSummary));
    }
  }, [crmSummary, activeCall]);

  const isAuthenticated = !!localStorage.getItem('accessToken');

  // Poll for incoming call offers when idle
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      if (callState !== 'idle') return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/webrtc/offers`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data?.offers) && data.data.offers.length > 0) {
            const offer = data.data.offers[0];
            setActiveCall({
              sessionId: offer.sessionId,
              callerName: offer.callerName,
              email: offer.email,
              company: offer.company,
              page: offer.page,
              interest: offer.interest,
              leadScore: offer.leadScore,
              temperature: offer.temperature,
              customerBrief: offer.customerBrief
            });
            setCallState('ringing');
            audioSynth.playIncomingRingtone();
            setLiveNotes('');
            setIsMuted(false);
            setIsHeld(false);

            // Ringing Timeout: 45 seconds to answer
            ringerTimeoutRef.current = setTimeout(() => {
              declineCall();
              audioSynth.playBusyTone();
              setTimeout(() => audioSynth.stop(), 2000);
            }, 45000);
          }
        }
      } catch (err) {
        console.error('Failed to poll WebRTC offers:', err);
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      if (ringerTimeoutRef.current) clearTimeout(ringerTimeoutRef.current);
    };
  }, [isAuthenticated, callState]);

  // Duration Timer updates on connected state
  useEffect(() => {
    if (callState === 'connected') {
      timerIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (callState === 'idle') {
        setDuration(0);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [callState]);

  const acceptCall = async () => {
    if (!activeCall) return;
    if (ringerTimeoutRef.current) {
      clearTimeout(ringerTimeoutRef.current);
      ringerTimeoutRef.current = null;
    }
    audioSynth.stop();
    audioSynth.playConnectedTone();

    try {
      setCallState('connecting');
      const offerRes = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/webrtc/offers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const offerData = await offerRes.json();
      const offer = offerData.data.offers.find((o: any) => o.sessionId === activeCall.sessionId);
      if (!offer) throw new Error('SDP Offer not found');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      adminStreamRef.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      adminPcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/webrtc/candidate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
              sessionId: activeCall.sessionId,
              candidate: event.candidate
            })
          }).catch(err => console.error('Failed to send admin ICE candidate:', err));
        }
      };

      pc.ontrack = (event) => {
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.play().catch(e => console.error('Failed to play remote audio:', e));
      };

      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offer.sdpOffer }));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/webrtc/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          sessionId: activeCall.sessionId,
          sdpAnswer: answer.sdp
        })
      });

      setCallState('connected');

      // Poll visitor candidates
      pollIntervalRef.current = setInterval(async () => {
        try {
          const candRes = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/webrtc/candidates/${activeCall.sessionId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
          });
          if (candRes.ok) {
            const candData = await candRes.json();
            if (candData.success && Array.isArray(candData.data?.candidates)) {
              for (const cand of candData.data.candidates) {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              }
            }
          }
        } catch (e) {
          console.error('Error fetching remote ICE candidates:', e);
        }
      }, 3000);

    } catch (err) {
      console.error('Failed to accept call:', err);
      setCallState('failed');
      audioSynth.playCallEndedTone();
      setTimeout(() => cleanupCall(), 2000);
    }
  };

  const declineCall = () => {
    if (ringerTimeoutRef.current) {
      clearTimeout(ringerTimeoutRef.current);
      ringerTimeoutRef.current = null;
    }
    audioSynth.stop();
    audioSynth.playCallEndedTone();

    if (activeCall) {
      fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/webrtc/hangup/${activeCall.sessionId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      }).catch(err => console.error('Failed to hangup session:', err));

      // Post missed call log
      fetch(`${import.meta.env.VITE_API_URL || '/api'}/ai/webrtc/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          sessionId: activeCall.sessionId,
          status: 'declined',
          denisNotes: 'Call declined by admin'
        })
      }).catch(e => console.error(e));
    }

    setCallState('declined');
    setTimeout(() => cleanupCall(), 2000);
  };

  const hangupCall = () => {
    audioSynth.stop();
    audioSynth.playCallEndedTone();

    if (activeCall) {
      // Post call log with live notes to backend!
      fetch(`${import.meta.env.VITE_API_URL || '/api'}/ai/webrtc/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          sessionId: activeCall.sessionId,
          status: 'completed',
          denisNotes: liveNotes || 'None'
        })
      }).catch(e => console.error(e));

      fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/webrtc/hangup/${activeCall.sessionId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      }).catch(err => console.error('Failed to hangup session:', err));
    }

    if (adminPcRef.current) {
      adminPcRef.current.close();
      adminPcRef.current = null;
    }
    if (adminStreamRef.current) {
      adminStreamRef.current.getTracks().forEach(t => t.stop());
      adminStreamRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setCallState('summary_pending');
  };

  const handleGenerateSummary = async () => {
    if (!activeCall) return;
    setIsGeneratingSummary(true);
    try {
      const summary = await adminApi.generateCrmSummary(activeCall.sessionId, liveNotes);
      setCrmSummary(summary);
    } catch (err) {
      console.error('Failed to generate CRM summary:', err);
      toast.error('Failed to generate CRM summary. Please try again.', 'Summary Error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const [isSyncingSummary, setIsSyncingSummary] = useState(false);

  const handleSyncSummary = async () => {
    if (!activeCall || !crmSummary) return;
    setIsSyncingSummary(true);
    try {
      await adminApi.syncCrmSummary(activeCall.sessionId, liveNotes, crmSummary);
      cleanupCall();
    } catch (err) {
      console.error('Failed to sync CRM summary:', err);
      toast.error('Failed to sync CRM summary. Please try again.', 'Sync Error');
    } finally {
      setIsSyncingSummary(false);
    }
  };

  const cleanupCall = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (adminPcRef.current) {
      adminPcRef.current.close();
      adminPcRef.current = null;
    }
    if (adminStreamRef.current) {
      adminStreamRef.current.getTracks().forEach(t => t.stop());
      adminStreamRef.current = null;
    }
    
    // Clear persisted drafts
    localStorage.removeItem('call_active_meta_draft');
    localStorage.removeItem('call_live_notes_draft');
    localStorage.removeItem('call_crm_summary_draft');

    setActiveCall(null);
    setCallState('idle');
    setLiveNotes('');
    setCrmSummary(null);
    setIsGeneratingSummary(false);
    setIsSyncingSummary(false);
  };

  const toggleMute = () => {
    if (adminStreamRef.current) {
      const audioTrack = adminStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleHold = () => {
    setIsHeld(prev => !prev);
    // Future integration placeholder for RTC hold signals
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <CallContext.Provider value={{
      activeCall,
      callState,
      duration,
      isMuted,
      isHeld,
      liveNotes,
      setLiveNotes,
      acceptCall,
      declineCall,
      hangupCall,
      toggleMute,
      toggleHold
    }}>
      {children}

      {/* Global Call Manager Overlay View */}
      {callState !== 'idle' && activeCall && (
        <div className={`fixed bottom-6 right-6 z-[9999] flex flex-col transition-all bg-zinc-950/95 backdrop-blur-md border border-accent-violet/60 p-5 rounded-2xl shadow-2xl animate-fade-in font-body text-zinc-100 ${
          (activeCall.customerBrief || callState === 'summary_pending') ? 'w-[480px]' : 'w-[360px]'
        }`}>
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-zinc-800/80 pb-3 mb-3">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-violet/20 text-accent-violet animate-pulse">
                <User size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-100 font-display truncate w-[200px]">
                  {activeCall.customerBrief?.name || activeCall.callerName}
                </h4>
                <p className="text-[11px] text-zinc-400 truncate w-[200px]">
                  {activeCall.customerBrief?.position ? `${activeCall.customerBrief.position}, ` : ''}
                  {activeCall.customerBrief?.company || activeCall.company || 'Unknown Company'}
                </p>
              </div>
            </div>
            
            {(activeCall.customerBrief?.leadScore !== undefined || activeCall.leadScore !== undefined) && (
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  (activeCall.customerBrief?.leadTemperature || activeCall.temperature) === 'hot' ? 'bg-rose-500/20 text-rose-400' :
                  (activeCall.customerBrief?.leadTemperature || activeCall.temperature) === 'warm' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-zinc-500/20 text-zinc-400'
                }`}>
                  {(activeCall.customerBrief?.leadTemperature || activeCall.temperature) === 'hot' ? '★ Hot Lead' : 
                   (activeCall.customerBrief?.leadTemperature || activeCall.temperature) === 'warm' ? '★ Warm Lead' : 'Cold Lead'}
                </span>
                <span className="text-[9px] text-zinc-400 font-semibold font-mono">
                  Score: {activeCall.customerBrief?.leadScore || activeCall.leadScore}%
                </span>
              </div>
            )}
          </div>

          {/* CRM Context details (Brief) */}
          {callState === 'ringing' && (
            <>
              {activeCall.customerBrief ? (
                <div className="text-left space-y-3 mb-4 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-850/80 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] border-b border-zinc-800/80 pb-2.5">
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Requested Service</span>
                      <span className="text-zinc-200 font-semibold truncate block">{activeCall.customerBrief.serviceRequested || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Country</span>
                      <span className="text-zinc-250 font-semibold truncate block">{activeCall.customerBrief.country || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Current Page</span>
                      <span className="text-zinc-200 truncate block">{activeCall.customerBrief.currentPage || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Chat Duration</span>
                      <span className="text-zinc-200 font-semibold truncate block">{activeCall.customerBrief.conversationDuration || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Budget</span>
                      <span className="text-zinc-200 font-semibold text-emerald-400 truncate block">{activeCall.customerBrief.budget || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Timeline</span>
                      <span className="text-zinc-200 font-semibold text-amber-400 truncate block">{activeCall.customerBrief.timeline || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="text-[11px] space-y-2.5 pt-1">
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Conversation Summary</span>
                      <p className="text-zinc-300 leading-relaxed">{activeCall.customerBrief.summary}</p>
                    </div>

                    {activeCall.customerBrief.painPoints && activeCall.customerBrief.painPoints.length > 0 && (
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Pain Points</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-zinc-300">
                          {activeCall.customerBrief.painPoints.map((pt: string, idx: number) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeCall.customerBrief.recommendedApproach && (
                      <div className="bg-accent-violet/10 border-l-2 border-accent-violet p-2.5 rounded-r">
                        <span className="text-accent-violet block text-[9px] uppercase font-extrabold tracking-wider">Recommended Sales Approach</span>
                        <p className="text-zinc-200 leading-relaxed text-[11px]">{activeCall.customerBrief.recommendedApproach}</p>
                      </div>
                    )}

                    {activeCall.customerBrief.suggestedOpening && (
                      <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg italic text-zinc-300 leading-relaxed relative mt-2 text-[11px]">
                        <span className="absolute -top-2 left-3.5 bg-zinc-950 px-1.5 text-[8px] text-zinc-500 font-bold uppercase not-italic tracking-wider border border-zinc-900 rounded">Suggested Opening Quote</span>
                        "{activeCall.customerBrief.suggestedOpening}"
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-left text-xs text-zinc-400 space-y-1 mb-4 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-850">
                  {activeCall.email && <div className="truncate"><strong>Email:</strong> {activeCall.email}</div>}
                  <div className="truncate"><strong>Page:</strong> {activeCall.page}</div>
                  <div className="truncate"><strong>Interest:</strong> {activeCall.interest}</div>
                </div>
              )}
            </>
          )}

          {/* Live Call Notes (Denis Notes) */}
          {(callState === 'connected' || callState === 'connecting') && (
            <div className="mb-4 text-left">
              <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1 mb-1.5">
                <Edit3 size={10} /> Call Live Notes
              </label>
              <textarea
                value={liveNotes}
                onChange={(e) => setLiveNotes(e.target.value)}
                placeholder="Write customer requirements or next actions here..."
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-250 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet resize-none"
              />
            </div>
          )}

          {/* State Text & Duration */}
          {callState !== 'summary_pending' && (
            <div className="flex items-center justify-between mb-4 bg-zinc-900/20 p-2 rounded border border-zinc-850">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                {callState === 'ringing' ? 'Incoming Call...' :
                 callState === 'connecting' ? 'Connecting...' :
                 callState === 'connected' ? 'Call Active' :
                 callState === 'declined' ? 'Call Declined' :
                 callState === 'ended' ? 'Call Ended' : 'Call Error'}
              </span>
              {callState === 'connected' && (
                <span className="text-sm font-bold text-accent-violet font-mono">
                  {formatTimer(duration)}
                </span>
              )}
            </div>
          )}

          {/* Post-Call Review Screen (when hung up) */}
          {callState === 'summary_pending' && (
            <div className="text-left space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar mb-4 pr-1">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1 mb-1.5">
                  <Edit3 size={10} /> Edit Raw Call Notes
                </label>
                <textarea
                  value={liveNotes}
                  onChange={(e) => setLiveNotes(e.target.value)}
                  placeholder="Refine call details..."
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet resize-none"
                />
              </div>

              {!crmSummary ? (
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="w-full bg-accent-violet hover:bg-accent-violet/90 text-white text-xs py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-accent-violet/10 disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingSummary ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing Notes & Generating CRM Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Generate CRM Summary
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80 animate-fade-in text-[11px]">
                  <div className="flex items-center justify-between border-b border-zinc-800/65 pb-2">
                    <span className="text-accent-violet font-bold text-xs flex items-center gap-1">
                      <Sparkles size={12} /> AI CRM Summary (Editable Review)
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase">Closing Prob:</span>
                      <input 
                        type="text" 
                        value={crmSummary.probabilityOfClosing || 'High'} 
                        onChange={(e) => setCrmSummary({ ...crmSummary, probabilityOfClosing: e.target.value })}
                        className="bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1 py-0.5 rounded border border-emerald-500/20 text-center w-14"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1.5">
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1">Customer Profile</span>
                      <textarea
                        value={crmSummary.customerProfile || ''}
                        onChange={(e) => setCrmSummary({ ...crmSummary, customerProfile: e.target.value })}
                        rows={2}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded p-1 text-[10px] text-zinc-200 focus:outline-none focus:border-accent-violet resize-none"
                      />
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1">Business Needs</span>
                      <textarea
                        value={crmSummary.businessNeeds || ''}
                        onChange={(e) => setCrmSummary({ ...crmSummary, businessNeeds: e.target.value })}
                        rows={2}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded p-1 text-[10px] text-zinc-200 focus:outline-none focus:border-accent-violet resize-none"
                      />
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1">Stated Pain Points</span>
                      <textarea
                        value={crmSummary.painPoints || ''}
                        onChange={(e) => setCrmSummary({ ...crmSummary, painPoints: e.target.value })}
                        rows={2}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded p-1 text-[10px] text-zinc-200 focus:outline-none focus:border-accent-violet resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-b border-zinc-800/40 py-2">
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1">Budget Info</span>
                        <input
                          type="text"
                          value={crmSummary.budget || ''}
                          onChange={(e) => setCrmSummary({ ...crmSummary, budget: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1 text-[10px] text-emerald-400 font-semibold focus:outline-none focus:border-accent-violet"
                        />
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1">Timeline</span>
                        <input
                          type="text"
                          value={crmSummary.timeline || ''}
                          onChange={(e) => setCrmSummary({ ...crmSummary, timeline: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1 text-[10px] text-amber-400 font-semibold focus:outline-none focus:border-accent-violet"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1">Decision Makers</span>
                        <input
                          type="text"
                          value={crmSummary.decisionMakers || ''}
                          onChange={(e) => setCrmSummary({ ...crmSummary, decisionMakers: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1 text-[10px] text-zinc-300 focus:outline-none focus:border-accent-violet"
                        />
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1">Objections Raised</span>
                        <input
                          type="text"
                          value={crmSummary.objections || ''}
                          onChange={(e) => setCrmSummary({ ...crmSummary, objections: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1 text-[10px] text-rose-450 text-rose-400 focus:outline-none focus:border-accent-violet"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1">Risks</span>
                      <textarea
                        value={crmSummary.risks || ''}
                        onChange={(e) => setCrmSummary({ ...crmSummary, risks: e.target.value })}
                        rows={1}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded p-1 text-[10px] text-zinc-350 focus:outline-none focus:border-accent-violet resize-none"
                      />
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1">Recommended Service</span>
                      <input
                        type="text"
                        value={crmSummary.recommendedService || ''}
                        onChange={(e) => setCrmSummary({ ...crmSummary, recommendedService: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded p-1 text-[10px] text-zinc-200 font-medium focus:outline-none focus:border-accent-violet"
                      />
                    </div>
                    <div className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg space-y-2">
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1">Next Follow-Up Action Plan</span>
                        <textarea
                          value={crmSummary.nextAction || ''}
                          onChange={(e) => setCrmSummary({ ...crmSummary, nextAction: e.target.value })}
                          rows={2}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] text-zinc-100 font-bold focus:outline-none focus:border-accent-violet resize-none"
                        />
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold mb-1">Follow-Up Action Details</span>
                        <textarea
                          value={crmSummary.followUpPlan || ''}
                          onChange={(e) => setCrmSummary({ ...crmSummary, followUpPlan: e.target.value })}
                          rows={2}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] text-zinc-350 focus:outline-none focus:border-accent-violet resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions Button Bar */}
          <div className="flex gap-2 w-full">
            {callState === 'ringing' ? (
              <>
                <button
                  onClick={acceptCall}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 rounded-xl font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20"
                >
                  <Phone size={14} /> Accept Call
                </button>
                <button
                  onClick={declineCall}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs py-2.5 rounded-xl font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/20"
                >
                  <PhoneOff size={14} /> Decline
                </button>
              </>
            ) : callState === 'summary_pending' ? (
              <button
                onClick={crmSummary ? handleSyncSummary : cleanupCall}
                disabled={isSyncingSummary}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSyncingSummary ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Syncing to CRM...
                  </>
                ) : (
                  <>
                    <Check size={14} /> {crmSummary ? 'Approve & Sync to CRM' : 'Close Call Log'}
                  </>
                )}
              </button>
            ) : (
              <>
                {callState === 'connected' && (
                  <>
                    <button
                      onClick={toggleMute}
                      className={`p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                        isMuted ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
                      }`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                    <button
                      onClick={toggleHold}
                      className={`p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                        isHeld ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
                      }`}
                      title={isHeld ? 'Resume' : 'Hold'}
                    >
                      {isHeld ? <Play size={16} /> : <Pause size={16} />}
                    </button>
                  </>
                )}
                <button
                  onClick={callState === 'connected' ? hangupCall : declineCall}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs py-2.5 rounded-xl font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  disabled={callState === 'ended' || callState === 'declined'}
                >
                  <PhoneOff size={14} /> Hang Up
                </button>
              </>
            )}
          </div>

        </div>
      )}
    </CallContext.Provider>
  );
};
