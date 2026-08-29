import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, User, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live real-time clock
  const [timeStr, setTimeStr] = useState('02:18:10');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${h}:${m}:${s}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('PLEASE ENTER OPERATOR IDENTIFIER');
      return;
    }
    if (!password) {
      setErrorMsg('PLEASE ENTER PASSKEY');
      return;
    }
    setLoading(true);
    const success = await login(username.trim(), password, remember);
    if (!success) {
      setErrorMsg('INVALID CREDENTIALS. ACCESS DENIED.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#08090b] text-[#eaeaea] font-mono select-none overflow-y-auto">
      
      {/* 1. Minimalist Cyber Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 2. Main Minimal Black Frame */}
      <div className="relative w-full max-w-5xl bg-[#0e1014] border border-[#22252c] rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10">
        
        {/* LEFT COLUMN: Clean AI Security Terminal Canvas (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#22252c] flex flex-col justify-between space-y-6">
          
          <div className="space-y-5">
            {/* Top Minimal Logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-white inline-block shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <span className="text-sm font-bold text-white tracking-widest uppercase font-mono">
                  CONTROLPLANE AI
                </span>
              </div>
              <span className="text-[10px] text-[#717682] uppercase tracking-wider">
                SECURITY RUNTIME v1.0.0
              </span>
            </div>

            {/* AI Security Governance Logs */}
            <div className="space-y-1.5 text-xs text-[#8a8f98] font-mono tracking-tight pt-1">
              <div className="flex items-center gap-3">
                <span className="text-[#454a54]">{timeStr}</span>
                <span className="text-[#a1a1aa]">INITIALIZING RESPONSIBLE AI GOVERNANCE SHIELD ...</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#454a54]">{timeStr}</span>
                <span className="text-[#a1a1aa]">4-TIER THREAT CASCADE MATRIX: <span className="text-white font-bold">ARMED</span> (134 TAXONOMIES)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#454a54]">{timeStr}</span>
                <span className="text-[#a1a1aa]">SHA-256 CRYPTOGRAPHIC AUDIT LOG: <span className="text-white font-bold">SYNCHRONIZED</span></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#454a54]">{timeStr}</span>
                <span className="text-white font-semibold">REAL-TIME INGRESS GATEWAY (&lt;15MS): <span className="text-emerald-400">ACTIVE</span></span>
              </div>
            </div>

            {/* High-Precision Clean ASCII Typography */}
            <div className="p-4 sm:p-5 border border-[#2a2d36] rounded-lg bg-[#07080a] text-white text-[9px] sm:text-[10.5px] leading-tight overflow-x-auto shadow-inner select-none">
              <pre className="font-mono text-center tracking-tight text-[#d4d4d8]">
{`   _____ ____  _   _ _____ ____   ___  _     ____  _        _    _   _ _____ 
  / ____/ __ \\| \\ | |_   _|  _ \\ / _ \\| |   |  _ \\| |      / \\  | \\ | | ____|
 | |   | |  | |  \\| | | | | |_) | | | | |   | |_) | |     / _ \\ |  \\| |  _|  
 | |___| |__| | |\\  | | | |  _ <| |_| | |___|  __/| |___ / ___ \\| |\\  | |___ 
  \\_____\\____/|_| \\_| |_| |_| \\_\\\\___/|_____|_|   |_____/_/   \\_\\_| \\_|_____|
                                                                             
               [ R E S P O N S I B L E   A I   C O N T R O L ]               `}
              </pre>
            </div>

            <div className="text-xs text-[#8a8f98] flex items-center gap-3 pt-1">
              <span className="text-[#454a54]">{timeStr}</span>
              <span className="text-white font-medium">STATUS: READY FOR OPERATOR AUTHENTICATION</span>
              <span className="w-1.5 h-3 bg-white animate-pulse inline-block" />
            </div>
          </div>

          {/* Bottom Minimal Footer */}
          <div className="pt-5 border-t border-[#22252c] flex items-center justify-between text-[11px] text-[#6b7280]">
            <span className="flex items-center gap-2 text-[#9ca3af]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>GATEWAY INGRESS ONLINE</span>
            </span>
            <span className="text-[10px] text-[#555a64] uppercase tracking-wider">
              TLS 1.3 • SOC 2 • HIPAA READY
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Minimalist Clean Sign-In Form (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 bg-[#090a0d] flex flex-col justify-between">
          
          <div>
            <div className="mb-6 pb-4 border-b border-[#22252c]">
              <h1 className="text-xl font-bold text-white tracking-tight uppercase">
                Sign In
              </h1>
              <p className="text-xs text-[#717682] mt-1 font-mono">
                Authenticate to access governance console.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#8a8f98] uppercase tracking-wider mb-1.5 font-mono">
                  OPERATOR IDENTIFIER / EMAIL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#555a64]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="admin or email@domain.com"
                    required
                    className="w-full bg-[#050608] border border-[#252830] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#3f434e] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-[#8a8f98] uppercase tracking-wider font-mono">
                    PASSKEY
                  </label>
                  <span className="text-[9px] text-[#555a64] font-mono">ENCRYPTED</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#555a64]">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#050608] border border-[#252830] rounded-lg pl-9 pr-9 py-2.5 text-xs text-white placeholder-[#3f434e] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#555a64] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errorMsg && (
                  <p className="text-[11px] text-rose-400 font-mono mt-2 p-2 border border-rose-900/50 bg-rose-950/20 rounded">
                    {errorMsg}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#252830] bg-[#050608] text-white focus:ring-white accent-white"
                  />
                  <span className="text-[#8a8f98] text-[11px]">Remember session</span>
                </label>
              </div>

              {/* Pure Minimal High-Contrast White Button with Black Text */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 rounded-lg bg-white hover:bg-[#e4e4e7] active:bg-[#d4d4d8] text-black text-xs font-bold font-mono uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-white/10"
              >
                {loading ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>AUTHENTICATE TO CONSOLE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-[#22252c] text-center text-[10px] text-[#555a64] font-mono uppercase tracking-wider">
            <span>SECURE SYSTEM ACCESS // COMPLIANCE CERTIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
