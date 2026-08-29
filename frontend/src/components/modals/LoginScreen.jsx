import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Eye, EyeOff, Lock, User, Sun, Moon, Shield, Sparkles, 
  Activity, CheckCircle2, ArrowRight, Zap, Terminal, Globe, 
  Layers, LockKeyhole, Cpu, Server
} from 'lucide-react';

export function LoginScreen() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTelemetry, setActiveTelemetry] = useState(0);

  // Live rotating security metrics
  const telemetryStats = [
    { label: 'Real-Time Pipeline', val: '<12ms Latency', status: 'Optimal' },
    { label: 'Threat Centroids', val: '134 Test Taxonomies', status: 'Enforced' },
    { label: 'SHA-256 Hash Chain', val: 'Tamper-Proof Audit', status: 'Active' },
    { label: 'Gateway Nodes', val: 'Global Ingress Active', status: 'Online' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTelemetry((prev) => (prev + 1) % telemetryStats.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('Please enter your workspace username or corporate email');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your account password');
      return;
    }
    setLoading(true);
    const success = await login(username.trim(), password, remember);
    if (!success) {
      setErrorMsg('Authentication failed. Check your credentials or contact security administrator.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-black overflow-y-auto font-sans">
      
      {/* 1. Dynamic Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Ambient Aurora Orbs */}
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[160px]" />
      </div>

      {/* 2. Main Executive Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#0d111a]/85 border border-slate-800/80 backdrop-blur-2xl rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* LEFT COLUMN: Enterprise Governance Studio Showcase (5 cols) */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-b from-[#0e1422] via-[#0b0f19] to-[#070a12] border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
          
          {/* Top Brand & Status */}
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-primary/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                  <Shield className="w-6 h-6 text-cyan-400" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="font-brand font-black text-xl text-white tracking-tight flex items-center gap-2">
                    <span>ControlPlane</span>
                    <span className="text-cyan-400">AI</span>
                  </div>
                  <span className="block text-[10px] font-mono text-slate-400 font-medium uppercase tracking-widest">
                    Enterprise AI Governance
                  </span>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2 pt-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Next-Gen Security Gateway</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-brand leading-tight tracking-tight pt-1">
                Zero-Trust Control for Autonomous AI & LLMs
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Multi-tier real-time guardrail interception, cryptographic SHA-256 audit chaining, and information-theoretic threat prevention.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 transition-colors hover:border-slate-700">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sub-15ms Real-Time Guardrail Shield</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Instant PII masking, credit card Luhn check, and token budgeting.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 transition-colors hover:border-slate-700">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">4-Tier Threat Cascading Engine</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Universal continuous vector space projection across NIST & Meta taxonomies.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 transition-colors hover:border-slate-700">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <LockKeyhole className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Tamper-Proof Audit Telemetry</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Cryptographic SHA-256 hash chaining for compliance certification.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Rotating Live Status Telemetry */}
          <div className="pt-6 mt-6 border-t border-slate-800/60 relative z-10 flex items-center justify-between text-[11px] font-mono">
            <div className="space-y-0.5">
              <span className="text-slate-500 block uppercase text-[9px] tracking-wider">
                {telemetryStats[activeTelemetry].label}
              </span>
              <span className="font-bold text-slate-200">
                {telemetryStats[activeTelemetry].val}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {telemetryStats[activeTelemetry].status}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Executive Access & Sign-In Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-[#0a0d14]/70">
          
          {/* Header & Mode Switcher */}
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-brand tracking-tight">
                  Welcome to ControlPlane AI
                </h1>
                <p className="text-xs text-slate-400">
                  Authenticate to access policy orchestration, review queues, and live gateways.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-all shadow-md shrink-0"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
              </button>
            </div>

            {/* Main Sign-In Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                  Workspace Identity / Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter your username or email address"
                    required
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                    Security Credentials
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">Encrypted Transport (TLS 1.3)</span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter your account password"
                    required
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
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

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Session Retention */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 accent-cyan-500"
                  />
                  <span className="text-xs text-slate-400 font-medium">Keep session authenticated</span>
                </label>
                <span className="text-[11px] font-mono text-cyan-400/80 hover:text-cyan-300 cursor-pointer transition-colors">
                  SSO Enterprise
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-primary to-indigo-600 hover:from-cyan-400 hover:via-primary-hover hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 tracking-wider font-mono uppercase"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Governance Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Security Certifications */}
          <div className="mt-10 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>TLS 1.3 & SHA-256 Validated</span>
            </div>
            <span>SOC 2 • HIPAA • EU AI Act Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
