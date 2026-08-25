import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Bot,
  ShieldAlert,
  SearchCheck,
  Sliders,
  KeyRound,
  Crosshair,
  Microscope,
  BookOpen,
  LogOut,
  Users,
  ExternalLink,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'Main Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'inventory', label: 'Monitored Resources', icon: Boxes },
      { id: 'agent-runtime', label: 'AI Agent Runtime', icon: Bot },
    ],
  },
  {
    title: 'Security Center',
    items: [
      { id: 'security-center/overview', label: 'Overview', icon: SearchCheck },
      { id: 'security-center/risk-findings', label: 'Risk Findings', icon: ShieldAlert },
      { id: 'security-center/policies', label: 'Policies', icon: Sliders },
    ],
  },
  {
    title: 'Connectors & Keys',
    items: [
      { id: 'tokens', label: 'Enrollment Tokens', icon: KeyRound },
    ],
  },
  {
    title: 'Audit Tools',
    items: [
      { id: 'ai-red-team', label: 'AI Red Team Scanner', icon: Crosshair },
      { id: 'hallucinations', label: 'Hallucination Detector', icon: Microscope },
      { id: 'documentation', label: 'Documentation', icon: BookOpen, externalTab: true },
    ],
  },
];

export function Sidebar({ activeRoute, onNavigate }) {
  const { user, isAdmin, logout, setIsUserMgmtOpen } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleItemClick = (item) => {
    if (item.externalTab || item.id === 'documentation') {
      window.open(`${window.location.origin}${window.location.pathname}#/documentation`, '_blank');
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <aside className="w-80 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-white/10 flex flex-col flex-shrink-0 select-none transition-colors">
      {/* Brand Header */}
      <div className="h-[72px] flex items-center px-6 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-dark-900">
        <div>
          <div className="font-brand font-bold text-slate-900 dark:text-white text-lg leading-tight">
            ControlPlane
          </div>
          <div className="text-[10px] text-primary dark:text-primary-light font-mono font-semibold tracking-wider uppercase">
            AI Security Studio
          </div>
        </div>
      </div>

      {/* Nav Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="px-3 text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeRoute === item.id ||
                  (item.id === 'inventory' && activeRoute === 'inventory/add') ||
                  (item.id === 'security-center/risk-findings' && activeRoute === 'security-center/finding-detail');

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-medium transition-all duration-150 text-left ${
                      isActive
                        ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white border border-primary/30 dark:border-primary/40 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.externalTab && (
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-850/70 space-y-2">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200/60 dark:border-transparent">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-xs ring-1 ring-black/10 dark:ring-white/20 flex-shrink-0">
              {getInitials(user?.name || user?.username)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name || user?.username || 'User'}
              </div>
              <div className="text-[10px] text-primary dark:text-accent-cyan font-mono font-medium truncate">
                {user?.role || 'USER'} ({user?.auth_provider === 'google' ? 'Google' : 'Local'})
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsUserMgmtOpen(true)}
              className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex-shrink-0"
              title="Admin User Management & Approvals"
            >
              <Users className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
