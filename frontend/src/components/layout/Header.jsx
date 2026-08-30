import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ChevronRight, ShieldCheck, Zap } from 'lucide-react';

export function Header({ activeRoute }) {
  const { user, isAdmin, activeTenant, changeActiveTenant } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const formatBreadcrumb = (route) => {
    if (!route) return ['Main', 'Dashboard'];
    const parts = route.split('/');
    const formatStr = (s) =>
      s
        .replace(/-/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    if (parts.length > 1) {
      return [formatStr(parts[0]), formatStr(parts[1])];
    }
    return ['Main', formatStr(parts[0])];
  };

  const [parentName, childName] = formatBreadcrumb(activeRoute);

  const allowedTenants =
    isAdmin && Array.isArray(user?.allowed_tenants) && user?.allowed_tenants.length > 0
      ? user.allowed_tenants
      : [user?.tenant_id || 'ankur-tenant-1'];

  return (
    <header className="h-[68px] border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md px-6 md:px-8 flex items-center justify-between flex-shrink-0 z-20 transition-colors">
      {/* Breadcrumb Title */}
      <div className="flex items-center gap-2.5 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
        <span className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">{parentName}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
        <span className="text-slate-900 dark:text-white font-semibold">{childName}</span>
      </div>

      {/* Controls & Tenant Pill */}
      <div className="flex items-center gap-3">

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300 shadow-sm transition-all duration-150 focus:outline-none hover:scale-105 active:scale-95"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Tenant Pill / Switcher */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-dark-850 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-200 shadow-sm transition-colors text-xs font-semibold font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {isAdmin && allowedTenants.length > 1 ? (
            <select
              value={activeTenant}
              onChange={(e) => changeActiveTenant(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {allowedTenants.map((t) => (
                <option key={t} value={t} className="bg-white dark:bg-dark-850 text-slate-900 dark:text-white">
                  {t}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-slate-900 dark:text-white text-xs font-semibold">{activeTenant}</span>
          )}
        </div>
      </div>
    </header>
  );
}
