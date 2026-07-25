import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  Bell,
  Send,
  Sparkles,
  Trash2,
  X,
  RefreshCw
} from 'lucide-react';
import { Logo } from '../../atoms/Logo';
import { cn } from '../../../lib/cn';
import { ROUTES } from '../../../config/routes';
import { useAuthStore } from '../../../store/useAuthStore';
import { adminApi } from '../../../services/api';
import { ADMIN_NAVIGATION } from '../../../config/navigation';
import { IconRegistry } from '../../atoms/IconRegistry';
import { canAccessRoute, Role } from '@dc/shared';

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.ADMIN_LOGIN);
    }
  }, [isAuthenticated, navigate]);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [presence, setPresence] = useState('Offline');

  useEffect(() => {
    if (isAuthenticated) {
      adminApi.getPresence()
        .then((data: any) => {
          if (data && data.status) {
            setPresence(data.status);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handlePresenceChange = async (status: string) => {
    try {
      setPresence(status);
      await adminApi.updatePresence(status);
    } catch (err) {
      console.error('Failed to change presence status:', err);
    }
  };

  // WebRTC Global calling states are now managed via CallProvider context.

  // Admin AI Copilot States
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotSessionId, setCopilotSessionId] = useState<string | null>(() => localStorage.getItem('dc_copilot_session_id'));
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);
  const [platformStats, setPlatformStats] = useState<{ leads?: { hot: number; total: number }; messages?: { totalUnread: number }; chatSessions?: { activeSessions: number } } | null>(null);
  const copilotScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    setTimeout(() => {
      copilotScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  // Load history when panel is opened
  useEffect(() => {
    if (!isCopilotOpen) return;

    // Fetch live platform stats for the context bar
    adminApi.getAdminCopilotContext()
      .then((ctx: any) => setPlatformStats(ctx))
      .catch(() => {});

    if (copilotSessionId) {
      setIsCopilotTyping(true);
      adminApi.getAdminAiCopilotHistory(copilotSessionId)
        .then((data: any) => {
          const list = data?.messages || [];
          if (list.length > 0) {
            setCopilotMessages(list);
          } else {
            setCopilotMessages([{
              role: 'assistant',
              content: 'Hello Denis! I am your Admin AI Copilot. How can I help you manage the platform, review database knowledge, or check business leads today?'
            }]);
          }
          scrollToBottom();
        })
        .catch(() => {
          setCopilotMessages([{
            role: 'assistant',
            content: 'Hello Denis! I am your Admin AI Copilot. How can I help you manage the platform today?'
          }]);
        })
        .finally(() => setIsCopilotTyping(false));
    } else {
      setCopilotMessages([{
        role: 'assistant',
        content: 'Hello Denis! I am your Admin AI Copilot. How can I help you manage the platform, review database knowledge, or check business leads today?'
      }]);
    }
  }, [isCopilotOpen, copilotSessionId]);

  const handleSendCopilot = async (text: string) => {
    if (!text.trim() || isCopilotTyping) return;

    const userText = text.trim();
    setCopilotMessages(prev => [...prev, { role: 'user', content: userText }]);
    setCopilotInput('');
    setIsCopilotTyping(true);
    scrollToBottom();

    // Add thinking bubble
    setCopilotMessages(prev => [...prev, { role: 'assistant', content: 'Thinking...' }]);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/ai-copilot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userText, sessionId: copilotSessionId || undefined })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream available');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumContent = '';
      let isFirstToken = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const clean = line.trim();
          if (!clean.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(clean.substring(6));
            if (data.token) {
              if (isFirstToken) {
                isFirstToken = false;
                setCopilotMessages(prev => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === 'assistant') {
                    last.content = '';
                  }
                  return copy;
                });
              }

              accumContent += data.token;
              setCopilotMessages(prev => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last && last.role === 'assistant') {
                  last.content = accumContent;
                }
                return copy;
              });
              scrollToBottom();
            }

            if (data.sessionId) {
              setCopilotSessionId(data.sessionId);
              localStorage.setItem('dc_copilot_session_id', data.sessionId);
            }
          } catch {}
        }
      }
    } catch (err) {
      setCopilotMessages(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.role === 'assistant') {
          last.content = 'Sorry, a connection error occurred with the AI Copilot. Please check system status and try again.';
        }
        return copy;
      });
    } finally {
      setIsCopilotTyping(false);
      scrollToBottom();
    }
  };

  const handleClearCopilot = () => {
    if (confirm('Start a new session with AI Copilot?')) {
      setCopilotSessionId(null);
      localStorage.removeItem('dc_copilot_session_id');
      setCopilotMessages([{
        role: 'assistant',
        content: 'New session started. How can I assist you now?'
      }]);
    }
  };

  const authUser = useAuthStore((state) => state.user);
  const userRole = authUser?.role as Role;

  const allowedNavItems = ADMIN_NAVIGATION.filter((item) => {
    if (!item.isVisible) return false;

    if (item.requiredPermission && userRole) {
      if (!canAccessRoute(userRole, item.requiredPermission)) {
        return false;
      }
    }

    if (item.featureFlag) {
      // In Bootstrap phase, all feature flags are disabled by default
      return false;
    }

    return true;
  }).sort((a, b) => a.sortOrder - b.sortOrder);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.ADMIN_LOGIN);
  };

  return (
    <div className="min-h-screen flex dark:bg-primary-bg light:bg-light-bg transition-colors duration-300">
      
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "hidden md:flex flex-col border-r transition-all duration-300 z-30",
        "dark:border-zinc-800/80 dark:bg-[#09090b] light:border-slate-200 light:bg-slate-50",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}>
        
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b dark:border-zinc-800/80 light:border-slate-200">
          <Link to={ROUTES.HOME} className="flex items-center">
            {isSidebarCollapsed ? (
              <div className="w-8 h-8 rounded-lg bg-accent-violet flex items-center justify-center font-bold text-white text-xs">DC</div>
            ) : (
              <Logo size="sm" />
            )}
          </Link>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded-lg hover:bg-zinc-800/40 cursor-pointer dark:text-zinc-400 light:text-slate-600"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 px-3 space-y-4 flex flex-col justify-start overflow-y-auto max-h-[calc(100vh-8rem)]">
          {Object.entries(
            allowedNavItems.reduce((acc, item) => {
              const grp = item.group || 'Dashboard';
              if (!acc[grp]) acc[grp] = [];
              acc[grp].push(item);
              return acc;
            }, {} as Record<string, typeof allowedNavItems>)
          ).map(([groupName, items]) => (
            <div key={groupName} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 pt-2 pb-1 text-[9.5px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                  {groupName}
                </div>
              )}
              {items.map((item) => {
                const isActive = location.pathname === item.path;
                const IconComponent = IconRegistry[item.iconKey];
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex items-center gap-3 py-2 px-3 rounded-lg font-medium text-xs transition-all cursor-pointer text-left w-full",
                      isActive
                        ? "dark:bg-accent-violet dark:text-white light:bg-light-accent light:text-white font-semibold shadow-xs"
                        : "dark:text-zinc-400 dark:hover:bg-zinc-900/60 light:text-slate-600 light:hover:bg-slate-200",
                      isSidebarCollapsed ? "justify-center tooltip" : ""
                    )}
                    title={isSidebarCollapsed ? t(item.labelKey) : undefined}
                  >
                    {IconComponent && <IconComponent size={16} />}
                    {!isSidebarCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t dark:border-zinc-800/80 light:border-slate-200">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 py-2.5 px-3.5 rounded-lg font-medium text-sm text-red-500 hover:bg-red-500/10 transition-all cursor-pointer text-left w-full",
              isSidebarCollapsed ? "justify-center" : ""
            )}
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span>{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 border-b dark:border-zinc-800/80 dark:bg-[#09090b] light:border-slate-200 light:bg-slate-50 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-zinc-800/40 cursor-pointer dark:text-zinc-400 light:text-slate-600 md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-accent-violet" />
              <span className="text-xs font-semibold uppercase tracking-wider dark:text-zinc-400 light:text-slate-500">
                Security Level: Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Presence Selector */}
            <div className="flex items-center gap-1.5 border dark:border-zinc-800 light:border-slate-200 rounded-lg px-2.5 py-1 bg-zinc-950/20 light:bg-slate-100">
              <span className={cn(
                "w-2 h-2 rounded-full",
                presence === 'Online' ? 'bg-green-500 animate-pulse' :
                presence === 'Busy' ? 'bg-red-500 animate-pulse' :
                presence === 'Meeting' ? 'bg-amber-500 animate-pulse' :
                'bg-zinc-500'
              )} />
              <select
                value={presence}
                onChange={(e) => handlePresenceChange(e.target.value)}
                className="bg-transparent border-none text-[11px] font-bold dark:text-zinc-350 light:text-slate-600 focus:outline-none cursor-pointer"
              >
                <option value="Online" className="dark:bg-zinc-950 dark:text-white">Online</option>
                <option value="Busy" className="dark:bg-zinc-950 dark:text-white">Busy</option>
                <option value="Meeting" className="dark:bg-zinc-950 dark:text-white">Meeting</option>
                <option value="Offline" className="dark:bg-zinc-950 dark:text-white">Offline</option>
              </select>
            </div>

            {/* AI Copilot Toggle */}
            <button
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              title="Toggle Admin AI Copilot"
              className={cn(
                "p-2 rounded-full cursor-pointer transition-colors relative",
                isCopilotOpen ? "bg-accent-violet/20 text-accent-violet animate-pulse" : "dark:hover:bg-zinc-800/80 light:hover:bg-slate-200/80 dark:text-zinc-300 light:text-slate-600"
              )}
            >
              <Bot size={18} />
              {!isCopilotOpen && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-violet animate-pulse" />
              )}
            </button>

            {/* Notification Indicator */}
            <button className="p-2 rounded-full cursor-pointer transition-colors dark:hover:bg-zinc-800/80 light:hover:bg-slate-200/80 dark:text-zinc-300 light:text-slate-600 relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-violet animate-pulse" />
            </button>

            {/* Admin Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm text-white">
                DC
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold dark:text-white light:text-slate-800">Denis Chamkaga</p>
                <span className="text-[10px] dark:text-zinc-500 light:text-slate-400">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Frame */}
        <main className="flex-1 p-6 md:p-8">
          <React.Suspense fallback={<div className="text-center py-12 dark:text-zinc-400">Loading module...</div>}>
            <Outlet />
          </React.Suspense>
        </main>
      </div>

      {/* Mobile Drawer Navigation Backdrop */}
      {isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="fixed top-0 bottom-0 left-0 w-64 z-50 flex flex-col dark:bg-[#09090b] light:bg-slate-50 border-r dark:border-zinc-800 light:border-slate-200 animate-slide-in">
            <div className="h-16 flex items-center justify-between px-4 border-b dark:border-zinc-800 light:border-slate-200">
              <Logo size="sm" />
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800/40 cursor-pointer dark:text-zinc-400 light:text-slate-600"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <nav className="flex-grow py-6 px-3 space-y-1.5 flex flex-col justify-start">
              {allowedNavItems.map((item) => {
                const IconComponent = IconRegistry[item.iconKey];
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setIsMobileSidebarOpen(false);
                      navigate(item.path);
                    }}
                    className={cn(
                      "flex items-center gap-3 py-2.5 px-3.5 rounded-lg font-medium text-sm transition-all cursor-pointer text-left w-full",
                      location.pathname === item.path
                        ? "dark:bg-accent-violet dark:text-white light:bg-light-accent light:text-white font-semibold"
                        : "dark:text-zinc-400 dark:hover:bg-zinc-900/60 light:text-slate-600 light:hover:bg-slate-200"
                    )}
                  >
                    {IconComponent && <IconComponent size={18} />}
                    <span>{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-3 border-t dark:border-zinc-800 light:border-slate-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 py-2.5 px-3.5 rounded-lg font-medium text-sm text-red-500 hover:bg-red-500/10 transition-all cursor-pointer text-left w-full"
              >
                <LogOut size={18} />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Floating Copilot Trigger Button (Bottom Right) */}
      {!isCopilotOpen && (
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-accent-violet hover:bg-accent-violet/90 text-white p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 border border-white/15"
          title="Open Admin AI Copilot"
        >
          <Bot size={22} className="animate-pulse" />
        </button>
      )}

      {/* Admin AI Copilot Right Slide-out Drawer */}
      {isCopilotOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCopilotOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="fixed top-0 bottom-0 right-0 w-full sm:w-[400px] z-50 flex flex-col bg-white dark:bg-zinc-950 border-l dark:border-zinc-850 border-zinc-200 shadow-2xl animate-slide-in-right">
            
            {/* Header */}
            <div className="p-4 border-b dark:border-zinc-850 border-zinc-200 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-accent-violet animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold dark:text-white text-slate-800 uppercase tracking-wider">AI Copilot Panel</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Role: Super Admin Clearance</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearCopilot}
                  title="Clear Chat / New Session"
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 cursor-pointer transition-all"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setIsCopilotOpen(false)}
                  title="Close Copilot Panel"
                  className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Live Platform Stats Bar */}
            {platformStats && (
              <div className="px-4 py-2 border-b dark:border-zinc-850 border-zinc-200 bg-accent-violet/5 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-[10px] font-semibold dark:text-zinc-300 text-slate-700">
                    {platformStats.leads?.hot ?? '—'} Hot Leads
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-semibold dark:text-zinc-300 text-slate-700">
                    {platformStats.messages?.totalUnread ?? '—'} Unread Msgs
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-semibold dark:text-zinc-300 text-slate-700">
                    {platformStats.chatSessions?.activeSessions ?? '—'} Active Chats
                  </span>
                </div>
              </div>
            )}
            {/* Chat message logs */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0 bg-zinc-50/50 dark:bg-zinc-950/20">
              {copilotMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs",
                    msg.role === 'user'
                      ? "ml-auto bg-accent-violet text-white rounded-tr-xs"
                      : "mr-auto bg-white dark:bg-zinc-900/90 dark:text-zinc-300 text-slate-800 border dark:border-zinc-850 border-zinc-200 rounded-tl-xs"
                  )}
                >
                  {/* Sender attribution */}
                  <span className={cn(
                    "text-[8.5px] uppercase tracking-wider font-bold mb-1 block",
                    msg.role === 'user' ? "text-white/70" : "text-accent-violet"
                  )}>
                    {msg.role === 'user' ? 'Denis (You)' : 'AI Copilot'}
                  </span>
                  
                  {/* Content snippet */}
                  <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</p>
                </div>
              ))}
              {isCopilotTyping && copilotMessages[copilotMessages.length - 1]?.content === 'Thinking...' && (
                <div className="mr-auto bg-white dark:bg-zinc-900/90 dark:text-zinc-400 text-slate-800 border dark:border-zinc-850 border-zinc-200 rounded-2xl rounded-tl-xs p-3 text-xs flex items-center gap-1.5 shadow-xs">
                  <RefreshCw size={12} className="animate-spin text-accent-violet" />
                  <span>AI is thinking...</span>
                </div>
              )}
              <div ref={copilotScrollRef} />
            </div>

            {/* Suggested prompts list */}
            {copilotMessages.length <= 1 && (
              <div className="px-4 py-2 border-t dark:border-zinc-850 border-zinc-200 bg-zinc-50 dark:bg-zinc-900/20">
                <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-2">Operational Tasks Suggestions:</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    "Check knowledge database coverage status",
                    "Summarize recent business leads grading",
                    "How do I update platform prompt directives?",
                    "What are the core technical guidelines?"
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendCopilot(s)}
                      className="text-left py-1.5 px-2.5 rounded-lg border dark:border-zinc-850 border-zinc-200 hover:border-accent-violet hover:bg-accent-violet/5 dark:text-zinc-400 text-slate-700 text-[10px] truncate transition-all cursor-pointer"
                    >
                      ✦ {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCopilot(copilotInput);
              }}
              className="p-3 border-t dark:border-zinc-850 border-zinc-200 flex gap-2 items-center bg-white dark:bg-zinc-900/40"
            >
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                placeholder="Ask Copilot about settings, database schema, or leads..."
                disabled={isCopilotTyping}
                className="flex-1 px-3 py-2 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
              />
              <button
                type="submit"
                disabled={!copilotInput.trim() || isCopilotTyping}
                className="p-2.5 rounded-xl bg-accent-violet hover:bg-accent-violet/90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
              >
                <Send size={13} />
              </button>
            </form>

          </aside>
        </>
      )}

    </div>
  );
};
