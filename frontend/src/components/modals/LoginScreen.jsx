import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Eye, EyeOff, Lock, User, Sun, Moon, Shield, Sparkles, 
  Activity, CheckCircle2, ArrowRight, Zap, Terminal, Globe, 
  Layers, LockKeyhole, Cpu, Server, Radio
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

  // Live Terminal Logs Animation (Render & Hacker Aesthetic)
  const [logs, setLogs] = useState([
    { time: '02:15:01', text: 'INCOMING SECURE SESSION DETECTED ...', type: 'info' },
    { time: '02:15:02', text: 'ALLOCATING 4-TIER THREAT MATRIX ...', type: 'info' },
    { time: '02:15:03', text: 'UNIVERSAL VECTOR ENGINE INITIALIZED [ONLINE]', type: 'success' },
    { time: '02:15:04', text: 'GATEWAY STATUS: READY FOR OPERATOR AUTH', type: 'accent' },
  ]);

  // Grid pixel animation matrix
  const [activePixels, setActivePixels] = useState([2, 5, 8, 14, 18, 22]);

  useEffect(() => {
    const pixelInterval = setInterval(() => {
      const randomIndices = Array.from({ length: 6 }, () => Math.floor(Math.random() * 36));
      setActivePixels(randomIndices);
    }, 800);
    return () => clearInterval(pixelInterval);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-[#06070a] text-slate-100 selection:bg-purple-500 selection:text-white overflow-y-auto font-mono">
      
      {/* 1. Cyber Grid Background with Render-Style Layout */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Wireframe Matrix Grid */}
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, #a855f7 1px, transparent 1px), linear-gradient(to bottom, #a855f7 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Ambient Nebula Glow */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute -bottom-32 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* 2. Main Executive Modal Container */}
      <div className="relative w-full max-w-6xl bg-[#090b10]/95 border border-purple-500/20 backdrop-blur-2xl rounded-2xl shadow-[0_0_100px_rgba(168,85,247,0.12)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* LEFT COLUMN: Render-Style Terminal & ASCII Canvas (6 cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 bg-[#07090e] border-b lg:border-b-0 lg:border-r border-purple-500/20 flex flex-col justify-between relative overflow-hidden">
          
          {/* Top Header Logo */}
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Shield className="w-5 h-5 text-purple-400" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="font-brand font-black text-lg text-white tracking-wider flex items-center gap-1.5 font-mono">
                    <span className="text-white">CONTROLPLANE</span>
                    <span className="text-purple-400">.AI</span>
                  </div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-widest">
                    SYSTEM SECURE RUNTIME // v1.0.0
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-purple-400 bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE</span>
              </div>
            </div>

            {/* Live Terminal Logs (Render Style) */}
            <div className="space-y-1.5 font-mono text-[11px] bg-black/60 border border-slate-800/80 rounded-xl p-4 shadow-inner">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-slate-500 shrink-0 select-none">{log.time}</span>
                  <span className={`
                    ${log.type === 'success' ? 'text-emerald-400 font-semibold' : ''}
                    ${log.type === 'accent' ? 'text-purple-300 font-semibold' : ''}
                    ${log.type === 'info' ? 'text-slate-300' : ''}
                  `}>
                    {log.text}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1 text-purple-400">
                <span className="animate-pulse">▶</span>
                <span className="text-slate-400">AWAITING_CLIENT_AUTHORIZATION</span>
                <span className="w-2 h-3.5 bg-purple-400 animate-pulse ml-0.5 inline-block" />
              </div>
            </div>

            {/* ASCII Wireframe Box (Render Aesthetic) */}
            <div className="relative p-4 rounded-xl bg-black/40 border border-dashed border-purple-500/30 text-purple-300/90 select-none text-[8.5px] sm:text-[10px] leading-none overflow-x-auto shadow-inner">
              <pre className="font-mono text-center tracking-tighter">
{`+-------------------------------------------------------+
|  __          ________ _      _____ ____  __  __ ______  |
|  \\ \\        / /  ____| |    / ____/ __ \\|  \\/  |  ____| |
|   \\ \\  /\\  / /| |__  | |   | |   | |  | | \\  / | |__    |
|    \\ \\/  \\/ / |  __| | |   | |   | |  | | |\\/| |  __|   |
|     \\  /\\  /  | |____| |___| |___| |__| | |  | | |____  |
|      \\/  \\/   |______|______\\_____\\____/|_|  |_|______| |
|                                                       |
|             T O   C O N T R O L P L A N E             |
+-------------------------------------------------------+`}
              </pre>
            </div>
          </div>

          {/* Bottom Grid Pixel Tiles (Interactive Render Aesthetic) */}
          <div className="pt-6 mt-4 border-t border-slate-800/80 relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">THREAT TELEMETRY:</span>
              <span className="text-[10px] text-emerald-400 font-bold">134 CENTROIDS ARMED</span>
            </div>

            {/* Glowing Pixel Block Matrix */}
            <div className="grid grid-cols-6 gap-1 p-1 bg-black/50 border border-slate-800 rounded">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-[2px] transition-all duration-500 ${
                    activePixels.includes(i)
                      ? i % 2 === 0
                        ? 'bg-purple-400 shadow-[0_0_8px_#c084fc]'
                        : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                      : 'bg-slate-800/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Executive Access & Sign-In Form (6 cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 flex flex-col justify-between bg-[#0b0e16]/90 font-sans">
          
          {/* Header & Theme Toggle */}
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-brand tracking-tight">
                  Sign In
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  Enter your credentials to enter ControlPlane AI console.
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
                  Operator Identifier / Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                    <User className="w-4 h-4" />
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
                    className="w-full bg-black/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                    Security Passkey
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">SHA-256 Validated</span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
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
                    className="w-full bg-black/60 border border-slate-800 rounded-xl pl-10 pr-11 py-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
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
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2 animate-in fade-in font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Session Retention */}
              <div className="flex items-center justify-between pt-1 font-mono">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-purple-500/30 accent-purple-500"
                  />
                  <span className="text-xs text-slate-400">Remember session</span>
                </label>
                <span className="text-[11px] text-purple-400/80 hover:text-purple-300 cursor-pointer transition-colors">
                  Enterprise SSO
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-primary to-indigo-600 hover:from-purple-500 hover:via-primary-hover hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 tracking-wider font-mono uppercase"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate to Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Security Badges */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TLS 1.3 End-to-End Encrypted</span>
            </div>
            <span>SOC 2 • HIPAA • EU AI Act</span>
          </div>
        </div>
      </div>
    </div>
  );
}
