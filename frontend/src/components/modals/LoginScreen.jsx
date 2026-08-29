import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Eye, EyeOff, Lock, User, Sun, Moon, Shield, Sparkles, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

export function LoginScreen() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('Please enter your username or email');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }
    setLoading(true);
    const success = await login(username.trim(), password, remember);
    if (!success) {
      setErrorMsg('Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 selection:bg-primary selection:text-white overflow-y-auto">
      {/* Background Decorative Gradients & Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Main Login Card with Dual Hero / Form Layout */}
      <div className="relative w-full max-w-4xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10 transition-all duration-300">
        
        {/* Left Hero Brand Panel (5 cols) */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-primary/10 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
                <Shield className="w-6 h-6 text-primary" strokeWidth={2} />
              </div>
              <div>
                <span className="font-brand font-black text-xl text-white tracking-tight">ControlPlane AI</span>
                <span className="block text-[10px] font-mono text-primary font-bold uppercase tracking-widest">Security Platform</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h2 className="text-2xl font-extrabold text-white font-brand leading-tight">
                Enterprise AI Governance & Threat Defense
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Real-time multi-tier guardrails, cryptographic audit logging, and automated threat interception for generative AI.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sub-15ms Real-Time Guardrail Shield</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>4-Tier Threat Cascading & Vector Engine</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SHA-256 Cryptographic Audit Trails</span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-slate-800/60 relative z-10 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>ControlPlane AI v1.0.0</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Gateway Active
            </span>
          </div>
        </div>

        {/* Right Form Panel (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-slate-900/60">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-white font-brand tracking-tight">
                Welcome to ControlPlane AI
              </h1>
              <p className="text-xs text-slate-400">Sign in to access your security workspace & guardrails.</p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition-colors shadow-sm"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-300 uppercase mb-1.5 font-mono">
                USERNAME OR EMAIL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter your username or email"
                  required
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-300 uppercase mb-1.5 font-mono">
                PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium mt-2 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary accent-primary"
                />
                <span className="text-xs text-slate-400">Remember this session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white text-xs font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 tracking-wide font-mono"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-800/60 text-center">
            <span className="text-[11px] text-slate-500">
              Protected by ControlPlane Autonomous AI Threat Defense
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
