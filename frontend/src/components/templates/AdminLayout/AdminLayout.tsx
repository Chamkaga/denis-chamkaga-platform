import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  FolderGit,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu
} from 'lucide-react';
import { Logo } from '../../atoms/Logo';
import { cn } from '../../../lib/cn';
import { ROUTES } from '../../../config/routes';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: ROUTES.ADMIN_DASHBOARD },
    { name: 'Leads', icon: <Users size={18} />, path: '/admin/leads' },
    { name: 'Projects', icon: <FolderGit size={18} />, path: '/admin/projects' },
    { name: 'Services', icon: <Briefcase size={18} />, path: '/admin/services' },
    { name: 'Messages', icon: <MessageSquare size={18} />, path: '/admin/messages' },
    { name: 'Analytics', icon: <TrendingUp size={18} />, path: '/admin/analytics' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    // In future: invoke authService.logout()
    navigate(ROUTES.HOME);
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
        <nav className="flex-1 py-6 px-3 space-y-1.5 flex flex-col justify-start">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-3.5 rounded-lg font-medium text-sm transition-all cursor-pointer text-left w-full",
                  isActive
                    ? "dark:bg-accent-violet dark:text-white light:bg-light-accent light:text-white font-semibold"
                    : "dark:text-zinc-400 dark:hover:bg-zinc-900/60 light:text-slate-600 light:hover:bg-slate-200",
                  isSidebarCollapsed ? "justify-center tooltip" : ""
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                {item.icon}
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </button>
            );
          })}
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
          {children}
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
              {menuItems.map((item) => (
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
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
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

    </div>
  );
};
