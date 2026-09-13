import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  Trash2, 
  Phone, 
  Home, 
  Paperclip, 
  Loader,
  HelpCircle,
  Briefcase,
  StopCircle,
  ArrowRight,
  Mail,
  Smartphone,
  UserCheck,
  CheckCircle2,
  ArrowDown,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../../store/useUIStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { audioSynth } from '../../../lib/audio-synth';
import { aiApi, publicApi } from '../../../services/api';
import { LogoIcon } from '../../../components/atoms/Logo/Logo';
import { useToast } from '../../atoms/Toast';

export interface UploadedAttachment {
  id: string;
  url: string;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  extension: string;
}

export interface VisitorInfo {
  fullName: string;
  phone: string;
  email: string;
}

export const ChatWidget: React.FC = () => {
  const { isChatOpen, toggleChat } = useUIStore();
  const { language } = useLanguageStore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'home' | 'conversation'>('home');
  const [showServicesList, setShowServicesList] = useState(false);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; attachments?: UploadedAttachment[] }>>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState<'idle' | 'sending' | 'connecting' | 'thinking' | 'streaming' | 'completed' | 'error'>('idle');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [visitorId, setVisitorId] = useState<string>('');
  const [isWebRtcEnabled, setIsWebRtcEnabled] = useState(false);
  const [webrtcStatus, setWebrtcStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [duration, setDuration] = useState(0);

  // Progressive Onboarding & Visitor Info State
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<'name' | 'email' | 'phone' | 'complete'>('name');
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Scroll & Accessibility State
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // File Upload State
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamTextRef = useRef('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pollIntervalRef = useRef<any>(null);
  const durationIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (pcRef.current) pcRef.current.close();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Keyboard accessibility: ESC key to close widget
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChatOpen) {
        toggleChat(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen, toggleChat]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollBottomBtn(false);
    }
  };

  const isNearBottom = () => {
    const el = chatContainerRef.current;
    if (!el) return true;
    const threshold = 120;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  const handleChatScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 140;
      setShowScrollBottomBtn(isFarFromBottom);
    }
  };

  useEffect(() => {
    if (isTyping && isNearBottom()) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping]);

  const [hasSavedSession, setHasSavedSession] = useState(false);

  const checkWebRtcStatus = (sid?: string) => {
    const activeSid = sid || sessionId || localStorage.getItem('assistantSessionId') || '';
    const url = activeSid 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/webrtc/session?sessionId=${activeSid}`
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/webrtc/session`;

    const capability = localStorage.getItem('assistantSessionCapability');
    fetch(url, capability ? { headers: { 'X-Session-Capability': capability } } : undefined)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data && res.data.enabled) {
          setIsWebRtcEnabled(true);
        } else {
          setIsWebRtcEnabled(false);
        }
      })
      .catch(err => console.error('Failed to fetch WebRTC availability status', err));
  };

  const getInitialMaryGreeting = (lang: string, name?: string) => {
    if (name) {
      if (lang === 'sw') {
        return `Habari ${name}! 👋 Karibu tena kwenye Biashara ya Denis Chamkaga.\n\nJina langu ni Mary, na mimi ni Msaidizi wa Biashara wa Denis.\n\nNiko hapa kukusaidia kujifunza kuhusu huduma zetu, kujibu maswali yako, kutoa nukuu za bei (quotations), au kukuunganisha moja kwa moja na Denis pale unapohitaji.`;
      }
      return `Hello ${name}! 👋 Welcome back to Denis Chamkaga's Business.\n\nMy name is Mary, and I'm Denis' Business Assistant.\n\nI'm here to help you learn about our services, answer your questions, provide quotations, or connect you directly with Denis whenever needed.`;
    }

    if (lang === 'sw') {
      return `Habari! 👋 Karibu kwenye Biashara ya Denis Chamkaga.\n\nJina langu ni Mary, na mimi ni Msaidizi wa Biashara wa Denis. Naomba kufahamu majina yako kamili? 😊`;
    }
    return `Hello! 👋 Welcome to Denis Chamkaga's Business.\n\nMy name is Mary, and I'm Denis' Business Assistant. May I have your full name, please? 😊`;
  };

  useEffect(() => {
    let vid = localStorage.getItem('assistantVisitorId');
    if (!vid) {
      vid = 'visitor_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('assistantVisitorId', vid);
    }
    setVisitorId(vid);

    // Load saved visitor info from localStorage
    const savedVisitorInfoStr = localStorage.getItem('assistantVisitorInfo');
    if (savedVisitorInfoStr) {
      try {
        const parsed = JSON.parse(savedVisitorInfoStr);
        if (parsed && parsed.fullName && parsed.phone) {
          setVisitorInfo(parsed);
          setFormFullName(parsed.fullName || '');
          setFormPhone(parsed.phone || '');
          setFormEmail(parsed.email || '');
          setOnboardingStep('complete');
        }
      } catch (e) {
        console.error('Failed to parse saved visitor info:', e);
      }
    }

    const sid = localStorage.getItem('assistantSessionId');
    const lastMsgTime = localStorage.getItem('assistantLastMessageTime');
    if (sid) {
      if (lastMsgTime) {
        const diff = Date.now() - parseInt(lastMsgTime, 10);
        if (diff > 30 * 60 * 1000) {
          localStorage.removeItem('assistantSessionId');
          localStorage.removeItem('assistantSessionCapability');
          localStorage.removeItem('assistantLastMessageTime');
        } else {
          setHasSavedSession(true);
          setHasStartedConversation(true);
        }
      } else {
        setHasSavedSession(true);
        setHasStartedConversation(true);
      }
    }

    if (sid) {
      setSessionId(sid);
      aiApi.getHistory(sid)
        .then((history: any[]) => {
          if (history && history.length > 0) {
            const mapped = history.map((h) => ({
              sender: (h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
              text: h.content.replace(/\[CARD:\s*\{.*?\}\s*\]/s, '').trim()
            }));
            setMessages(mapped);
            setHasStartedConversation(true);
          }
        })
        .catch(() => {
          // If error loading history, remain ready
        });
    }
    
    checkWebRtcStatus(sid || undefined);
  }, [isChatOpen, language]);

  // Strict Data Validation & Security Helpers
  const validateFullName = (name: string): { valid: boolean; error: string } => {
    const cleaned = name.trim();
    if (!cleaned) {
      return {
        valid: false,
        error: language === 'sw' ? 'Tafadhali weka majina yako kamili.' : 'Please enter your full name.'
      };
    }
    
    // Reject script tags, HTML symbols, or numbers
    const nameRegex = /^[a-zA-Z\u00C0-\u024F\s'-]+$/;
    if (!nameRegex.test(cleaned)) {
      return {
        valid: false,
        error: language === 'sw'
          ? 'Majina hayapaswi kuwa na namba au alama zisizotakiwa.'
          : 'Name must only contain letters, spaces, hyphens, or apostrophes.'
      };
    }

    const parts = cleaned.split(/\s+/);
    if (parts.length < 2) {
      return {
        valid: false,
        error: language === 'sw'
          ? 'Tafadhali weka angalau majina mawili (mfano: Juma Ally).'
          : 'Please enter at least two names (e.g., John Doe).'
      };
    }

    for (const part of parts) {
      if (part.length < 2) {
        return {
          valid: false,
          error: language === 'sw'
            ? 'Kila jina lazima liwe na angalau herufi mbili.'
            : 'Each name part must be at least 2 characters long.'
        };
      }
    }

    return { valid: true, error: '' };
  };

  const validateEmail = (email: string): { valid: boolean; error: string } => {
    const cleaned = email.trim();
    if (!cleaned) {
      return {
        valid: false,
        error: language === 'sw' ? 'Tafadhali weka barua pepe yako.' : 'Please enter your email address.'
      };
    }

    // Strict RFC 5322 email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleaned)) {
      return {
        valid: false,
        error: language === 'sw'
          ? 'Tafadhali weka anwani sahihi ya barua pepe (mfano: mteja@gmail.com).'
          : 'Please enter a valid email address (e.g., john@example.com).'
      };
    }

    return { valid: true, error: '' };
  };

  const validatePhone = (phone: string): { valid: boolean; error: string } => {
    const cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');
    if (!cleaned) {
      return {
        valid: false,
        error: language === 'sw' ? 'Tafadhali weka namba yako ya simu.' : 'Please enter your phone number.'
      };
    }

    // Must be 9 to 15 digits, optional leading +
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    if (!phoneRegex.test(cleaned)) {
      return {
        valid: false,
        error: language === 'sw'
          ? 'Tafadhali weka namba sahihi ya simu yenye tarakimu 9 hadi 15 (mfano: +255 712 345 678 au 0712345678).'
          : 'Please enter a valid phone number with 9 to 15 digits (e.g., +255 712 345 678).'
      };
    }

    return { valid: true, error: '' };
  };

  // Progressive Onboarding Step Handlers
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (onboardingStep === 'name') {
      const { valid, error } = validateFullName(formFullName);
      if (!valid) {
        setFormError(error);
        return;
      }
      setOnboardingStep('email');
    } else if (onboardingStep === 'email') {
      const { valid, error } = validateEmail(formEmail);
      if (!valid) {
        setFormError(error);
        return;
      }
      setOnboardingStep('phone');
    } else if (onboardingStep === 'phone') {
      const { valid, error } = validatePhone(formPhone);
      if (!valid) {
        setFormError(error);
        return;
      }

      const info: VisitorInfo = {
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim()
      };

      setVisitorInfo(info);
      localStorage.setItem('assistantVisitorInfo', JSON.stringify(info));
      setOnboardingStep('complete');
      setShowVisitorForm(false);

      // Dispatch lead info to Denis
      publicApi.submitContact({
        name: info.fullName,
        email: info.email,
        phone: info.phone,
        subject: `New Registered Visitor: ${info.fullName}`,
        content: `Visitor completed onboarding on Chat Widget: Name: ${info.fullName}, Email: ${info.email}, Phone: ${info.phone}`
      }).catch(err => console.error('Failed to dispatch registered visitor lead:', err));

      setHasStartedConversation(true);
      setActiveTab('conversation');

      if (messages.length === 0) {
        setMessages([{ sender: 'assistant', text: getInitialMaryGreeting(language, info.fullName) }]);
      }

      if (pendingPrompt) {
        const promptToRun = pendingPrompt;
        setPendingPrompt(null);
        handleSend(promptToRun);
      }
    }
  };

  const handleStartQuestion = (customPrompt?: string) => {
    if (customPrompt) {
      setPendingPrompt(customPrompt);
    }

    if (!visitorInfo || onboardingStep !== 'complete') {
      setShowVisitorForm(true);
      setActiveTab('conversation');
      return;
    }

    setHasStartedConversation(true);
    setActiveTab('conversation');
    if (messages.length === 0) {
      setMessages([{ sender: 'assistant', text: getInitialMaryGreeting(language, visitorInfo.fullName) }]);
    }

    if (customPrompt) {
      handleSend(customPrompt);
    }
  };

  const handleResumeChat = () => {
    const sid = localStorage.getItem('assistantSessionId');
    if (sid) {
      setSessionId(sid);
      setHasSavedSession(false);
      setHasStartedConversation(true);
      checkWebRtcStatus(sid);
      setActiveTab('conversation');
    }
  };

  const handleClearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setSessionId('');
    setMessages([]);
    setHasSavedSession(false);
    setHasStartedConversation(false);
    setAttachments([]);
    setNetworkError(null);
    localStorage.removeItem('assistantSessionId');
    localStorage.removeItem('assistantSessionCapability');
    localStorage.removeItem('assistantLastMessageTime');
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
    setChatState('idle');
  };

  const handleDeleteMessage = (index: number) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const handleHangup = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    audioSynth.stop();
    audioSynth.playCallEndedTone();
    setTimeout(() => audioSynth.stop(), 2000);

    setWebrtcStatus('idle');
    setMessages((prev) => [...prev, {
      sender: 'assistant',
      text: language === 'sw' ? "Simu imekatwa." : "Call ended."
    }]);

    const localSessionId = sessionId || localStorage.getItem('assistantSessionId') || '';
    if (localSessionId) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/webrtc/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Capability': localStorage.getItem('assistantSessionCapability') || ''
        },
        body: JSON.stringify({
          sessionId: localSessionId,
          status: 'completed'
        })
      }).catch(err => console.error('Failed to log call:', err));
    }
    setDuration(0);
  };

  const handleVoiceCallClick = async () => {
    // STRICT PROTECTION: Block voice call if visitor info has not been fully collected!
    if (!visitorInfo || !visitorInfo.fullName || !visitorInfo.phone) {
      setFormError(language === 'sw'
        ? 'Tafadhali kamilisha taarifa yako kwanza kabla ya kupiga simu kwa Denis.'
        : 'Please complete your contact details before placing a direct call to Denis.');
      setShowVisitorForm(true);
      setActiveTab('conversation');
      return;
    }

    if (webrtcStatus === 'active' || webrtcStatus === 'loading') {
      handleHangup();
      return;
    }

    setHasStartedConversation(true);
    if (messages.length === 0) {
      setMessages([{ sender: 'assistant', text: getInitialMaryGreeting(language, visitorInfo.fullName) }]);
    }

    if (!isWebRtcEnabled) {
      const msg = language === 'sw'
        ? "Simu za sauti hazipatikani kwa sasa. Msaidizi wa Denis atapokea ujumbe wako badala yake."
        : "Voice calling is currently unavailable. You can continue chatting with Denis Assistant or leave a message.";
      setMessages((prev) => [...prev, { sender: 'assistant', text: msg }]);
      setActiveTab('conversation');
      return;
    }

    setWebrtcStatus('loading');
    setActiveTab('conversation');
    setMessages((prev) => [...prev, {
      sender: 'assistant',
      text: language === 'sw'
        ? `Inapiga kwa Denis... Mteja: ${visitorInfo.fullName} (${visitorInfo.phone}). Tafadhali ruhusu matumizi ya maikrofoni.`
        : `Connecting call to Denis for ${visitorInfo.fullName} (${visitorInfo.phone})... Please allow microphone access.`
    }]);
    audioSynth.playOutgoingRingback();

    try {
      const localSessionId = sessionId || localStorage.getItem('assistantSessionId') || '';
      if (!localSessionId) {
        throw new Error('Active session is required to initiate a call');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/webrtc/candidate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Session-Capability': localStorage.getItem('assistantSessionCapability') || ''
            },
            body: JSON.stringify({
              sessionId: localSessionId,
              role: 'visitor',
              candidate: event.candidate
            })
          }).catch(err => console.error('Failed to post candidate:', err));
        }
      };

      pc.ontrack = (event) => {
        const remoteAudio = new Audio();
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.play().catch(err => console.error('Failed to play call audio:', err));
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setWebrtcStatus('error');
          audioSynth.stop();
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const capability = localStorage.getItem('assistantSessionCapability') || '';
      const offerResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/webrtc/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Capability': capability
        },
        body: JSON.stringify({ sessionId: localSessionId, sdpOffer: offer.sdp })
      });
      if (!offerResponse.ok) {
        const failure = await offerResponse.json().catch(() => null);
        throw new Error(failure?.error?.message || `Call request failed with status ${offerResponse.status}`);
      }

      const seenCandidates = new Set<string>();
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          if (!pc.remoteDescription) {
            const answerResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/webrtc/answer/${localSessionId}`, {
              headers: { 'X-Session-Capability': capability }
            });
            if (answerResponse.ok) {
              const answerData = await answerResponse.json();
              if (answerData.data?.sdpAnswer) {
                await pc.setRemoteDescription({ type: 'answer', sdp: answerData.data.sdpAnswer });
                audioSynth.stop();
                audioSynth.playConnectedTone();
                setWebrtcStatus('active');
              }
            }
          }

          const candidatesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/webrtc/candidates/${localSessionId}?role=admin`, {
            headers: { 'X-Session-Capability': capability }
          });
          if (candidatesResponse.ok) {
            const candidatesData = await candidatesResponse.json();
            for (const candidate of candidatesData.data?.candidates || []) {
              const key = JSON.stringify(candidate);
              if (!seenCandidates.has(key)) {
                seenCandidates.add(key);
                await pc.addIceCandidate(candidate);
              }
            }
          }
        } catch (pollError) {
          console.error('Failed to receive call signaling update:', pollError);
        }
      }, 1500);
    } catch (e) {
      console.error(e);
      setWebrtcStatus('error');
      audioSynth.stop();
      setMessages((prev) => [...prev, {
        sender: 'assistant',
        text: language === 'sw'
          ? 'Simu haikuweza kuunganishwa. Tafadhali jaribu tena au endelea kwa ujumbe.'
          : 'The call could not be connected. Please try again or continue by message.'
      }]);
    }
  };

  const featureCards = language === 'sw' ? [
    { icon: '💼', title: 'Jenga Tovuti ya Biashara', query: 'Ninahitaji kujenga Tovuti ya Biashara.' },
    { icon: '🗄️', title: 'Database & Systems', query: 'Nahitaji Database Design na Systems Optimization.' },
    { icon: '🖥️', title: 'CRM na Business Automation', query: 'Nahitaji CRM na Business Automation.' },
    { icon: '📦', title: 'Mifumo ya Biashara (ERP)', query: 'Nahitaji mfumo wa biashara wa ERP kwa shughuli zangu.' },
    { icon: '🔧', title: 'Custom Software', query: 'Nahitaji Custom Software kwa biashara yangu.' },
    { icon: '📈', title: 'Digital Transformation', query: 'Nahitaji Digital Transformation Consulting.' },
    { icon: '🧭', title: 'Technology Consulting', query: 'Nahitaji Technology Consulting na ushauri wa mifumo.' },
    { icon: '🎓', title: 'Training & Support', query: 'Nahitaji Training na Support baada ya mfumo.' },
    { icon: '💰', title: 'Omba Nukuu ya Bei', query: 'Naomba kupokea Nukuu ya Bei (Quotation).' },
    { icon: '📅', title: 'Panga Consultation', query: 'Ninataka kupanga consultation na Denis.' },
  ] : [
    { icon: '💼', title: 'Build a Business Website', query: 'I would like to build a Business Website.' },
    { icon: '🗄️', title: 'Database & Systems', query: 'I need Database Design and Systems Optimization.' },
    { icon: '🖥️', title: 'CRM & Business Automation', query: 'I need CRM and Business Automation.' },
    { icon: '📦', title: 'Business Systems (ERP)', query: 'I need an ERP business system for my operations.' },
    { icon: '🔧', title: 'Custom Software', query: 'I need Custom Software for my business.' },
    { icon: '📈', title: 'Digital Transformation', query: 'I need Digital Transformation Consulting.' },
    { icon: '🧭', title: 'Technology Consulting', query: 'I need Technology Consulting for my systems.' },
    { icon: '🎓', title: 'Training & Support', query: 'I need Training and Support after delivery.' },
    { icon: '💰', title: 'Request a Quote', query: 'I want to Request a Quote for a project.' },
    { icon: '📅', title: 'Book a Consultation', query: 'I want to book a consultation with Denis.' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.warning(
        language === 'sw' ? 'Faili ni kubwa mno (Zaidi ya 10MB).' : 'File too large. Maximum size is 10MB.',
        language === 'sw' ? 'Faili Kubwa Mno' : 'File Too Large'
      );
      return;
    }

    setUploadingFile(true);
    try {
      const activeSessionId = sessionId || localStorage.getItem('assistantSessionId');
      if (!activeSessionId) {
        toast.warning(language === 'sw' ? 'Tuma ujumbe kwanza ili kuanzisha mazungumzo salama.' : 'Send a message first to start a secure conversation before attaching files.');
        return;
      }
      const uploaded = await aiApi.uploadAttachment(file, activeSessionId);
      setAttachments(prev => [...prev, uploaded]);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputVal;
    if (!textToSend.trim() && attachments.length === 0) return;

    if (!visitorInfo || onboardingStep !== 'complete') {
      handleStartQuestion(textToSend);
      return;
    }

    if (!customPrompt) setInputVal('');
    setNetworkError(null);
    setChatState('sending');

    const currentAttachments = [...attachments];
    setAttachments([]);
    
    setActiveTab('conversation');
    setHasStartedConversation(true);

    let fullPromptText = textToSend;
    if (currentAttachments.length > 0) {
      const linksText = currentAttachments.map(a => `[Attachment: ${a.originalName} (${a.url})]`).join('\n');
      fullPromptText += `\n\n${linksText}`;
    }

    // Auto-dispatch serious lead to Denis in Admin Dashboard
    const seriousTerms = ['quotation', 'nukuu', 'mkutano', 'meeting', 'tovuti', 'website', 'app', 'erp', 'crm', 'project', 'mradi', 'consultation', 'ushauri'];
    const isSerious = seriousTerms.some(term => fullPromptText.toLowerCase().includes(term));
    if (isSerious && visitorInfo) {
      publicApi.submitContact({
        name: visitorInfo.fullName,
        email: visitorInfo.email || `${visitorInfo.phone.replace(/\+/g, '')}@platform.local`,
        phone: visitorInfo.phone,
        subject: `Lead Inquiry from Chat Widget: ${fullPromptText.substring(0, 40)}`,
        content: `Customer ${visitorInfo.fullName} (${visitorInfo.phone}) inquired: ${fullPromptText}`
      }).catch(err => console.error('Auto lead dispatch error:', err));
    }

    // Ensure initial greeting is present if empty
    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          { sender: 'assistant', text: getInitialMaryGreeting(language, visitorInfo.fullName) },
          { sender: 'user', text: textToSend || (language === 'sw' ? 'Ujumbe wenye faili' : 'Message with attachment'), attachments: currentAttachments }
        ];
      }
      return [...prev, { 
        sender: 'user', 
        text: textToSend || (language === 'sw' ? 'Ujumbe wenye faili' : 'Message with attachment'), 
        attachments: currentAttachments 
      }];
    });

    setIsTyping(true);
    setChatState('connecting');

    const activeSessionId = sessionId || localStorage.getItem('assistantSessionId') || undefined;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeSessionId ? { 'X-Session-Capability': localStorage.getItem('assistantSessionCapability') || '' } : {})
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: fullPromptText,
          sessionId: activeSessionId,
          visitorId
        })
      });

      if (!response.ok) {
        throw new Error(`Chat stream failed with status ${response.status}`);
      }

      localStorage.setItem('assistantLastMessageTime', Date.now().toString());

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No readable stream available');

      setChatState('thinking');
      streamTextRef.current = '';
      setMessages((prev) => [...prev, { sender: 'assistant', text: '' }]);

      let buffer = '';
      let tokensReceived = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine || !cleanLine.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(cleanLine.substring(6));

            if (data.greeting) {
              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                updated[lastIndex] = { sender: 'assistant' as const, text: data.greeting };
                return updated;
              });
              
              streamTextRef.current = '';
              setMessages((prev) => [...prev, {
                sender: 'assistant' as const,
                text: language === 'sw' ? 'Fikra...' : 'Thinking...'
              }]);
            }

            if (data.token) {
              tokensReceived++;
              setChatState('streaming');
              streamTextRef.current += data.token;
              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                const last = updated[lastIndex];
                if (last && last.sender === 'assistant') {
                  updated[lastIndex] = { ...last, text: streamTextRef.current };
                }
                return updated;
              });
            }

            if (data.sessionId) {
              setSessionId(data.sessionId);
              localStorage.setItem('assistantSessionId', data.sessionId);
            }
            if (data.sessionCapability) {
              localStorage.setItem('assistantSessionCapability', data.sessionCapability);
            }
            if (data.generationMode === 'fallback' || data.generationMode === 'offline') {
              setNetworkError(language === 'sw'
                ? 'Mary yuko katika hali ya msaada wa msingi kwa sababu huduma ya AI haipatikani kwa sasa.'
                : 'Mary is in limited fallback mode because the AI provider is currently unavailable.');
              setChatState('error');
            }
          } catch (e) {
            console.error('Failed to parse SSE JSON:', e);
          }
        }
      }
      setChatState('completed');
      checkWebRtcStatus(localStorage.getItem('assistantSessionId') || undefined);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Chat stream aborted by user.');
        setChatState('idle');
        return;
      }

      console.error('Widget chat stream request failed', err);
      
      // If tokens were already received before disconnection, preserve the response as partial/completed rather than wiping with red failure
      if (streamTextRef.current.trim().length > 0) {
        console.warn('Stream interrupted but partial tokens preserved.');
        setChatState('completed');
        return;
      }

      const errorText = language === 'sw'
        ? 'Samahani, kumetokea hitilafu ya mtandao. Jaribu tena.'
        : 'Sorry, a connection error occurred. Please try again.';

      setChatState('error');
      setNetworkError(errorText);

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.sender === 'assistant' && (last.text === 'Thinking...' || last.text === 'Fikra...' || !last.text.trim())) {
          last.text = errorText;
        } else {
          updated.push({
            sender: 'assistant' as const,
            text: errorText
          });
        }
        return updated;
      });
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
      setTimeout(() => {
        setChatState((prev) => (prev === 'completed' ? 'idle' : prev));
      }, 300);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end font-body">
      
      {/* Floating Chat Bubble Toggle (When Closed) */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => toggleChat(true)}
            className="p-4 rounded-full bg-accent-violet hover:bg-accent-violet-hover text-white shadow-2xl cursor-pointer transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-violet"
            aria-label="Open Chat Assistant"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="w-[calc(100vw-1.5rem)] max-w-[420px] sm:w-[420px] h-[calc(100vh-2rem)] sm:h-[min(620px,calc(100vh-3rem))] max-h-[620px] rounded-2xl border border-accent-violet/40 dark:border-accent-violet/40 light:border-accent-violet/30 glass-panel shadow-2xl overflow-hidden flex flex-col dark:bg-[#0c0c0e]/95 light:bg-white/95 backdrop-blur-xl transition-all"
          >
            {/* Top Header with Platform Title at Very Top Left */}
            <div className="p-3.5 border-b dark:border-zinc-800/80 light:border-slate-200 flex items-center justify-between dark:bg-[#0c0c0e] light:bg-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                {/* Official Platform Logo Icon on Left */}
                <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-900 light:bg-slate-200 flex items-center justify-center text-accent-violet shrink-0 border border-accent-violet/30 shadow-sm p-1.5">
                  <LogoIcon sizeClass="w-full h-full" className="text-accent-violet" />
                </div>
                {/* Header Title */}
                <h3 className="text-xs sm:text-sm font-extrabold dark:text-white light:text-slate-900 font-display leading-tight">
                  Denis Chamkaga Business Platform
                </h3>
              </div>

              <div className="flex items-center gap-1">
                {hasSavedSession && !sessionId && (
                  <button
                    onClick={handleResumeChat}
                    className="text-[10px] font-bold text-accent-violet hover:underline cursor-pointer mr-1"
                  >
                    {language === 'sw' ? "Rejesha" : "Resume"}
                  </button>
                )}

                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="p-1.5 rounded-full hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                    title={language === 'sw' ? "Futa Mazungumzo" : "Clear Chat"}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button
                  onClick={() => {
                    sessionStorage.setItem('assistantWidgetClosedManually', 'true');
                    toggleChat(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={language === 'sw' ? "Funga (Esc)" : "Close (Esc)"}
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Voice Call Active Bar */}
            {webrtcStatus !== 'idle' && (
              <div className="bg-zinc-950/90 border-b border-accent-violet/30 p-2.5 flex items-center justify-between text-left font-body text-zinc-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-accent-violet/20 flex items-center justify-center text-accent-violet animate-pulse">
                    <User size={13} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-zinc-100">
                      {visitorInfo ? visitorInfo.fullName : 'Denis Chamkaga'}
                    </h4>
                    <p className="text-[9px] text-zinc-400">
                      {webrtcStatus === 'loading' ? (language === 'sw' ? 'Inapiga...' : 'Connecting...') : 
                       (language === 'sw' ? 'Mko Hewani' : 'Connected')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  {webrtcStatus === 'active' && (
                    <span className="text-[10px] font-mono font-bold text-accent-violet bg-accent-violet/10 px-1.5 py-0.5 rounded">
                      {Math.floor(duration / 60).toString().padStart(2, '0')}:{(duration % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                  <button
                    onClick={handleHangup}
                    className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition shadow"
                    title={language === 'sw' ? "Kata Simu" : "End Call"}
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            )}

            {/* MAIN CONTENT AREA */}
            {activeTab === 'home' ? (
              /* ── Home Tab Content (CENTERED BRANDED CARD WITH MARGIN SPACING & BUTTON BORDER) ── */
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto scrollbar flex flex-col justify-center">
                <div className="space-y-4 my-auto">
                  
                  {/* Branded Card with Margins, Button-matching Border in Dark/Light */}
                  <div className="p-5 rounded-2xl border border-accent-violet/40 dark:border-accent-violet/40 light:border-accent-violet/30 dark:bg-zinc-900/80 light:bg-slate-50/90 shadow-xl space-y-3.5 text-center transition-all">
                    
                    {/* Subtitle Badge: Digital Business Office (Centered) */}
                    <div className="flex items-center justify-center border-b dark:border-zinc-800/80 light:border-slate-200 pb-3">
                      <span className="text-xs text-accent-violet flex items-center justify-center gap-1.5 font-extrabold tracking-wider font-display uppercase">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Digital Business Office
                      </span>
                    </div>

                    {/* Motto & Description Inside Card (Centered) */}
                    <div className="space-y-2 pt-0.5 text-center">
                      <h4 className="text-sm sm:text-base font-extrabold dark:text-white light:text-slate-900 font-display">
                        {language === 'sw' ? 'Tuko hapa kukusaidia!' : 'We are here to help you!'}
                      </h4>
                      <p className="text-xs dark:text-zinc-300 light:text-slate-700 leading-relaxed font-body text-center">
                        {language === 'sw'
                          ? 'Tunakusaidia kujenga programu maalum, mifumo ya biashara (CRM/ERP), uotomatishaji, na mikakati ya kidijitali kukuza biashara yako.'
                          : 'We help you design custom software, business systems (CRM/ERP), automation, and digital strategy to scale your enterprise.'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-1">
                    {/* View Offered Services Button */}
                    <button
                      onClick={() => setShowServicesList(!showServicesList)}
                      className="w-full py-3 px-4 rounded-xl border border-accent-violet/30 dark:border-accent-violet/30 light:border-accent-violet/40 dark:bg-zinc-900/80 light:bg-white dark:hover:bg-zinc-800 light:hover:bg-slate-100 dark:text-zinc-100 light:text-slate-800 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-display"
                    >
                      <Briefcase size={16} className="text-accent-violet" />
                      {showServicesList
                        ? (language === 'sw' ? 'Ficha Huduma Zetu' : 'Hide Offered Services')
                        : (language === 'sw' ? 'Tazama Huduma Zetu' : 'View Offered Services')}
                    </button>

                    {/* Expandable Services Grid */}
                    <AnimatePresence>
                      {showServicesList && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-1 overflow-hidden"
                        >
                          {featureCards.map((feat, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleStartQuestion(feat.query)}
                              className="p-2.5 rounded-lg border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/60 light:bg-white hover:border-accent-violet/60 text-left transition-all cursor-pointer flex items-center gap-2 group shadow-sm"
                            >
                              <span className="text-sm group-hover:scale-110 transition-transform">{feat.icon}</span>
                              <span className="text-[11px] font-medium dark:text-zinc-200 light:text-slate-800 leading-tight">
                                {feat.title}
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Ask Question Switcher Button */}
                    <button
                      onClick={() => handleStartQuestion()}
                      className="w-full py-3 px-4 rounded-xl bg-accent-violet hover:bg-accent-violet-hover text-white text-xs sm:text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer font-display"
                    >
                      <HelpCircle size={16} />
                      {language === 'sw' ? 'Uliza Swali' : 'Ask a Question'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Conversation Tab Content ────────────────────────────── */
              <div className="flex-1 flex flex-col min-h-0 relative">

                {/* Progressive Interactive Onboarding Step Card */}
                {showVisitorForm || onboardingStep !== 'complete' ? (
                  <div className="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col justify-center scrollbar text-left">
                    <div className="p-5 rounded-2xl border border-accent-violet/40 dark:border-accent-violet/40 light:border-accent-violet/30 dark:bg-zinc-900/95 light:bg-slate-50/95 shadow-2xl space-y-4 transition-all">
                      
                      {/* Mary Avatar Header with Online Badge */}
                      <div className="flex items-center justify-between border-b dark:border-zinc-800/80 light:border-slate-200 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-accent-violet shrink-0 shadow-md relative">
                            <img src="/images/assistant/mary_avatar.png" alt="Mary" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold dark:text-white light:text-slate-900 font-display flex items-center gap-1.5">
                              Mary
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </h4>
                            <p className="text-[11px] text-accent-violet font-semibold">
                              {language === 'sw' ? "Msaidizi wa Biashara wa Denis" : "Denis' Business Assistant"}
                            </p>
                          </div>
                        </div>

                        {/* Step Progress Pill */}
                        <div className="text-[10px] font-mono font-bold text-accent-violet bg-accent-violet/10 px-2 py-0.5 rounded-full border border-accent-violet/20">
                          {onboardingStep === 'name' ? '1/3' : onboardingStep === 'email' ? '2/3' : '3/3'}
                        </div>
                      </div>

                      {/* Step Progress Visual Bar */}
                      <div className="grid grid-cols-3 gap-1.5 py-0.5">
                        <div className={`h-1.5 rounded-full transition-all ${
                          onboardingStep === 'name' || onboardingStep === 'email' || onboardingStep === 'phone'
                            ? 'bg-accent-violet'
                            : 'bg-zinc-700/40'
                        }`} />
                        <div className={`h-1.5 rounded-full transition-all ${
                          onboardingStep === 'email' || onboardingStep === 'phone'
                            ? 'bg-accent-violet'
                            : 'bg-zinc-800/40 light:bg-slate-200'
                        }`} />
                        <div className={`h-1.5 rounded-full transition-all ${
                          onboardingStep === 'phone'
                            ? 'bg-accent-violet'
                            : 'bg-zinc-800/40 light:bg-slate-200'
                        }`} />
                      </div>

                      {/* Conversational Mary Step Prompt Box */}
                      <div className="p-3.5 rounded-xl bg-accent-violet/10 border border-accent-violet/20 text-xs sm:text-sm dark:text-zinc-100 light:text-slate-800 leading-relaxed font-body whitespace-pre-wrap shadow-inner">
                        {onboardingStep === 'name' ? (
                          language === 'sw'
                            ? `Habari! 👋 Karibu kwenye Biashara ya Denis Chamkaga.\n\nJina langu ni Mary, na mimi ni Msaidizi wa Biashara wa Denis. Naomba kufahamu majina yako kamili? 😊`
                            : `Hello! 👋 Welcome to Denis Chamkaga's Business.\n\nMy name is Mary, and I'm Denis' Business Assistant. May I have your full name, please? 😊`
                        ) : onboardingStep === 'email' ? (
                          language === 'sw'
                            ? `Nafurahi kukufahamu, ${formFullName}! 😊 Let's stay in touch! Please enter your email address in case we need to reach out to you.`
                            : `Nice to meet you, ${formFullName}! 😊 Let's stay in touch! Please enter your email address in case we need to reach out to you.`
                        ) : (
                          language === 'sw'
                            ? `Asante sana, ${formFullName}! 📱 Mwisho, naomba uweke namba yako ya simu ili tuweze kuwasiliana nawe moja kwa moja au kukuunganisha kwa simu pale inapobidi.`
                            : `Thank you, ${formFullName}! 📱 Lastly, please share your phone number so we can reach you directly or connect you via call when needed.`
                        )}
                      </div>

                      {formError && (
                        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-medium">
                          {formError}
                        </div>
                      )}

                      {/* Onboarding Form Fields */}
                      <form onSubmit={handleNextStep} className="space-y-3 pt-1">
                        {onboardingStep === 'name' && (
                          <div>
                            <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 block mb-1 flex items-center gap-1 font-display">
                              <UserCheck size={13} className="text-accent-violet" />
                              {language === 'sw' ? 'Majina Kamili' : 'Full Name'}
                            </label>
                            <input
                              type="text"
                              required
                              autoFocus
                              value={formFullName}
                              onChange={(e) => {
                                // Block digits 0-9 in real time
                                const sanitized = e.target.value.replace(/[0-9]/g, '');
                                setFormFullName(sanitized);
                              }}
                              placeholder={language === 'sw' ? 'Mfano: Denis Chamkaga' : 'e.g., John Doe'}
                              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border dark:border-zinc-700 light:border-slate-300 dark:bg-zinc-950 light:bg-white dark:text-white light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-accent-violet font-body shadow-sm"
                            />
                          </div>
                        )}

                        {onboardingStep === 'email' && (
                          <div>
                            <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 block mb-1 flex items-center gap-1 font-display">
                              <Mail size={13} className="text-accent-violet" />
                              {language === 'sw' ? 'Barua Pepe (Email)' : 'Email Address'}
                            </label>
                            <input
                              type="email"
                              required
                              autoFocus
                              value={formEmail}
                              onChange={(e) => setFormEmail(e.target.value)}
                              placeholder={language === 'sw' ? 'Mfano: mteja@gmail.com' : 'e.g., john@example.com'}
                              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border dark:border-zinc-700 light:border-slate-300 dark:bg-zinc-950 light:bg-white dark:text-white light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-accent-violet font-body shadow-sm"
                            />
                          </div>
                        )}

                        {onboardingStep === 'phone' && (
                          <div>
                            <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-400 light:text-slate-600 block mb-1 flex items-center gap-1 font-display">
                              <Smartphone size={13} className="text-accent-violet" />
                              {language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                            </label>
                            <input
                              type="tel"
                              required
                              autoFocus
                              value={formPhone}
                              onChange={(e) => {
                                // Block letters a-z/A-Z in real time
                                const sanitized = e.target.value.replace(/[^0-9+\s\-\(\)]/g, '');
                                setFormPhone(sanitized);
                              }}
                              placeholder={language === 'sw' ? 'Mfano: +255 712 345 678' : 'e.g., +255 712 345 678'}
                              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border dark:border-zinc-700 light:border-slate-300 dark:bg-zinc-950 light:bg-white dark:text-white light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-accent-violet font-body shadow-sm"
                            />
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-3 px-4 rounded-xl bg-accent-violet hover:bg-accent-violet-hover text-white text-xs sm:text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer font-display mt-2"
                        >
                          {onboardingStep === 'phone' ? (
                            <>
                              <CheckCircle2 size={16} />
                              {language === 'sw' ? 'Kamilisha & Anza Mazungumzo' : 'Complete & Start Chat'}
                            </>
                          ) : (
                            <>
                              <span>{language === 'sw' ? 'Endelea' : 'Next'}</span>
                              <ArrowRight size={15} />
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : !hasStartedConversation ? (
                  /* Conversation Intro Screen with strictly "Ask Question" button */
                  <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center text-center space-y-6 scrollbar">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-accent-violet shadow-xl relative">
                      <img src="/images/assistant/mary_avatar.png" alt="Mary" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900 animate-pulse" />
                    </div>
                    <div className="space-y-1.5 max-w-xs">
                      <h4 className="text-lg font-bold dark:text-white light:text-slate-800 font-display">
                        Mary
                      </h4>
                      <p className="text-xs text-accent-violet font-semibold">
                        {language === 'sw' ? "Msaidizi wa Biashara wa Denis" : "Denis' Business Assistant"}
                      </p>
                      <p className="text-xs dark:text-zinc-400 light:text-slate-600 leading-relaxed pt-2">
                        {visitorInfo ? (
                          language === 'sw'
                            ? `Karibu tena ${visitorInfo.fullName}! Bonyeza hapa chini kuanza mazungumzo na Mary.`
                            : `Welcome back ${visitorInfo.fullName}! Click below to start a conversation with Mary.`
                        ) : (
                          language === 'sw'
                            ? 'Bonyeza hapa chini kuanza mazungumzo na Mary.'
                            : 'Click below to start a conversation with Mary.'
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartQuestion()}
                      className="w-full max-w-xs py-3.5 px-6 rounded-xl bg-accent-violet hover:bg-accent-violet-hover text-white text-sm font-bold transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer font-display"
                    >
                      <HelpCircle size={18} />
                      {language === 'sw' ? 'Uliza Swali' : 'Ask a Question'}
                    </button>
                  </div>
                ) : (
                  /* Active Chat Stream Screen with Mary's Welcome Greeting & Input Bar */
                  <div className="flex-1 flex flex-col min-h-0 relative">
                    
                    {/* Floating "Scroll to latest" button */}
                    <AnimatePresence>
                      {showScrollBottomBtn && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          onClick={scrollToBottom}
                          className="absolute bottom-16 right-4 z-20 p-2.5 rounded-full bg-accent-violet text-white shadow-xl hover:bg-accent-violet-hover transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        >
                          <ArrowDown size={14} />
                          <span>{language === 'sw' ? 'Rudi Chini' : 'Scroll to latest'}</span>
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Chat Messages Frame */}
                    <div 
                      ref={chatContainerRef}
                      onScroll={handleChatScroll}
                      className="flex-1 p-4 overflow-y-auto space-y-4 text-left scrollbar"
                    >
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`group relative flex gap-3 max-w-[88%] ${
                            msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                            msg.sender === 'user' 
                              ? 'bg-zinc-700 text-white' 
                              : 'border border-accent-violet/40 shadow-sm'
                          }`}>
                            {msg.sender === 'user' ? <User size={13} /> : <img src="/images/assistant/mary_avatar.png" alt="Mary" className="w-full h-full object-cover" />}
                          </div>
                          <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed relative ${
                            msg.sender === 'user'
                              ? 'dark:bg-accent-violet dark:text-white light:bg-light-accent light:text-white rounded-tr-none'
                              : 'dark:bg-zinc-800/90 dark:text-zinc-100 light:bg-slate-100 light:text-slate-800 rounded-tl-none whitespace-pre-wrap'
                          }`}>
                            {msg.text}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                                {msg.attachments.map(att => (
                                  <div key={att.id} className="flex items-center gap-1.5 text-[10px] opacity-90">
                                    <Paperclip size={10} />
                                    <span className="truncate">{att.originalName}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Cancel/Delete message button for sent user message */}
                            {msg.sender === 'user' && (
                              <button
                                onClick={() => handleDeleteMessage(index)}
                                className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 border border-zinc-700 transition-all cursor-pointer shadow-sm"
                                title={language === 'sw' ? 'Futa Ujumbe Huu' : 'Cancel/Delete Message'}
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex flex-col items-start gap-2">
                          <div className="flex gap-3 max-w-[85%] self-start">
                            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-accent-violet/40">
                              <img src="/images/assistant/mary_avatar.png" alt="Mary" className="w-full h-full object-cover" />
                            </div>
                            <div className="px-3.5 py-2 rounded-2xl dark:bg-zinc-800/90 light:bg-slate-100 rounded-tl-none flex items-center gap-2 border border-zinc-700/40">
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-pulse" />
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-pulse" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-pulse" style={{ animationDelay: '300ms' }} />
                              </div>
                              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-400 light:text-slate-500">
                                {chatState === 'connecting'
                                  ? (language === 'sw' ? 'Inaunganisha...' : 'Connecting...')
                                  : (language === 'sw' ? 'Mary anafikiri...' : 'Mary is thinking...')}
                              </span>
                            </div>
                          </div>
                          
                          {/* Cancel/Stop Response Generation Button (Neutral, subtle, NOT red error-looking) */}
                          <button
                            onClick={handleCancelGeneration}
                            className="ml-10 px-3 py-1 rounded-full dark:bg-zinc-800/80 light:bg-slate-200 border dark:border-zinc-700/70 light:border-slate-300 text-zinc-400 dark:hover:text-zinc-200 light:hover:text-slate-800 text-[10px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <StopCircle size={12} className="text-zinc-400" />
                            {language === 'sw' ? 'Simamisha Jibu' : 'Stop generating'}
                          </button>
                        </div>
                      )}

                      {networkError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <WifiOff size={15} />
                            <span>{networkError}</span>
                          </div>
                          <button
                            onClick={() => handleSend()}
                            className="px-2.5 py-1 rounded bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw size={10} />
                            <span>{language === 'sw' ? 'Jaribu Tena' : 'Retry'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Attached File Preview Bar */}
                    {attachments.length > 0 && (
                      <div className="px-3 py-1.5 bg-zinc-900/80 border-t border-zinc-800 flex flex-wrap gap-1.5 shrink-0">
                        {attachments.map(att => (
                          <div key={att.id} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300">
                            <Paperclip size={10} className="text-accent-violet" />
                            <span className="truncate max-w-[120px]">{att.originalName}</span>
                            <button
                              onClick={() => removeAttachment(att.id)}
                              className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lower Input Bar with Multiline Textarea Support */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                      className="p-3 border-t dark:border-zinc-800/80 light:border-slate-200 flex items-end gap-1.5 dark:bg-[#0c0c0e] light:bg-slate-50 shrink-0"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.xlsx"
                      />
                      {/* File Upload Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        className="p-2 rounded-lg border dark:border-zinc-800 light:border-slate-200 text-zinc-400 hover:text-accent-violet dark:hover:bg-zinc-800 light:hover:bg-slate-200 transition-colors cursor-pointer shrink-0 mb-0.5"
                        title={language === 'sw' ? 'Pakia Faili' : 'Attach File'}
                      >
                        {uploadingFile ? (
                          <Loader size={16} className="animate-spin text-accent-violet" />
                        ) : (
                          <Paperclip size={16} />
                        )}
                      </button>

                      {/* Voice Call Button (Placed right beside File Upload button) */}
                      {isWebRtcEnabled && (
                        <button
                          type="button"
                          onClick={handleVoiceCallClick}
                          disabled={webrtcStatus === 'loading'}
                          className={`p-2 rounded-lg border dark:border-zinc-800 light:border-slate-200 transition-colors flex items-center justify-center cursor-pointer shrink-0 mb-0.5 ${
                            webrtcStatus === 'loading'
                              ? 'animate-pulse text-yellow-500 bg-yellow-500/10'
                              : webrtcStatus === 'active'
                              ? 'bg-green-500 text-white hover:bg-green-600 border-green-500'
                              : webrtcStatus === 'error'
                              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                              : 'text-zinc-400 hover:text-green-500 dark:hover:bg-zinc-800 light:hover:bg-slate-200'
                          }`}
                          title={
                            webrtcStatus === 'loading' ? (language === 'sw' ? "Kujiandaa..." : "Preparing...") :
                            webrtcStatus === 'active' ? (language === 'sw' ? "Simu Imetayarishwa" : "Call UI Prepared") :
                            webrtcStatus === 'error' ? (language === 'sw' ? "Hitilafu ya Simu" : "Call Error") :
                            (language === 'sw' ? "Tayarisha Simu" : "Prepare Voice Call")
                          }
                        >
                          {webrtcStatus === 'loading' ? (
                            <span className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Phone size={16} />
                          )}
                        </button>
                      )}

                      <textarea
                        ref={textareaRef}
                        id="chat-widget-input"
                        rows={1}
                        value={inputVal}
                        onKeyDown={handleInputKeyDown}
                        onChange={(e) => setInputVal(e.target.value)}
                        placeholder={language === 'sw' ? "Ujumbe wako kwa Mary... (Enter kutuma, Shift+Enter mstari mpya)" : "Type your message to Mary... (Enter to send, Shift+Enter for new line)"}
                        className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet font-body resize-none max-h-24 scrollbar"
                      />
                      <button
                        type="submit"
                        disabled={!inputVal.trim() && attachments.length === 0}
                        className="p-2 rounded-lg bg-accent-violet hover:bg-accent-violet-hover disabled:opacity-50 text-white cursor-pointer transition-colors shrink-0 mb-0.5"
                      >
                        <Send size={15} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Tabs Bar (VERY BOTTOM OF CHAT WIDGET) */}
            <div className="flex items-center border-t dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950 light:bg-slate-100 shrink-0 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-t-2 ${
                  activeTab === 'home'
                    ? 'border-accent-violet text-accent-violet dark:bg-zinc-900/60'
                    : 'border-transparent dark:text-zinc-400 light:text-slate-500 hover:text-accent-violet'
                }`}
              >
                <Home size={15} />
                {language === 'sw' ? 'Nyumbani' : 'Home'}
              </button>
              <button
                onClick={() => {
                  setActiveTab('conversation');
                  if (!visitorInfo || onboardingStep !== 'complete') {
                    setShowVisitorForm(true);
                  }
                }}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-t-2 ${
                  activeTab === 'conversation'
                    ? 'border-accent-violet text-accent-violet dark:bg-zinc-900/60'
                    : 'border-transparent dark:text-zinc-400 light:text-slate-500 hover:text-accent-violet'
                }`}
              >
                <MessageSquare size={15} />
                {language === 'sw' ? 'Mazungumzo' : 'Conversation'}
                {messages.length > 1 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-violet" />
                )}
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ChatWidget;
