import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BrandLogo } from '../common/BrandLogo';
import { Eye, EyeOff, Lock, User, Sun, Moon, Shield, Key } from 'lucide-react';

export function LoginScreen() {
  const { login, googleLogin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    await login(username, password, remember);
    setLoading(false);
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-dark-900/80 backdrop-blur-xl animate-fade-in transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-300/50 dark:shadow-black/80 relative overflow-hidden transition-colors">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-cyan/10 dark:bg-accent-cyan/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Bar with Theme Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BrandLogo className="w-12 h-12 rounded-2xl" />
            <div>
              <h2 className="font-brand font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                ControlPlane AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise AI Security & Governance</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

        {/* Preset Credential Chips */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <span>Quick Login Presets:</span>
            <span className="font-mono text-primary dark:text-accent-cyan">pwd: password123</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('ankur@acme.com', 'password123')}
              className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary dark:text-primary-light text-[11px] font-semibold transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              <span>Admin (Ankur)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('john@acme.com', 'password123')}
              className="px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              <span>John (Acme)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('alice@globex.com', 'password123')}
              className="px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              <span>Alice (Globex)</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Username / Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-sm"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">Remember me on this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-md shadow-primary/25 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In to ControlPlane AI</span>
              </>
            )}
          </button>

          {/* Google Sign In Option */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => googleLogin('ankur@acme.com', 'Ankur Kumar Singh')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Key className="w-3.5 h-3.5 text-primary" />
              <span>Sign in with Google OAuth (Demo)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
