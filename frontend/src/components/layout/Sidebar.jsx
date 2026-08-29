import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Bot,
  ShieldAlert,
  SearchCheck,
  UserCheck,
  Sliders,
  KeyRound,
  Crosshair,
  Microscope,
  BookOpen,
  LogOut,
  Users,
  ExternalLink,
  Shield,
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
      { id: 'security-center/review-queue', label: 'HITL Review Queue', icon: UserCheck },
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
      { id: 'hallucinations', label: 'Hallucination & RAG Grounding', icon: Microscope },
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
    <aside className="w-72 bg-white dark:bg-dark-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col flex-shrink-0 select-none transition-colors">
      {/* Brand Header */}
      <div className="h-[68px] flex items-center px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-dark-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black border border-[#2a2d36] flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-brand font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-none">
              ControlPlane
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 font-medium tracking-wide mt-1">
              AI Security Studio
            </div>
          </div>
        </div>
      </div>

      {/* Nav Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left ${
                      isActive
                        ? 'bg-primary/10 dark:bg-primary/15 text-primary dark:text-orange-400 font-semibold shadow-sm ring-1 ring-primary/25'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-dark-800/60'
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
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-dark-850/40 space-y-2">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-dark-850 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center font-bold text-white text-xs shadow-sm flex-shrink-0">
              {getInitials(user?.name || user?.username)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name || user?.username || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {user?.role || 'USER'} &bull; {user?.auth_provider === 'google' ? 'Google' : 'Local'}
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsUserMgmtOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-500 hover:text-primary transition-colors flex-shrink-0"
              title="Admin User Management & Approvals"
            >
              <Users className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900/30 transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
