import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Eye, EyeOff, Lock, User, Sun, Moon, Shield, Key, ArrowRight } from 'lucide-react';

export function LoginScreen() {
  const { login, googleLogin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('Please enter a valid username or email address');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }
    setLoading(true);
    const success = await login(username.trim(), password, remember);
    if (!success) {
      setErrorMsg('Invalid email or password (Try admin / password123)');
    }
    setLoading(false);
  };

  const handleQuickLogin = (uname, pwd) => {
    setUsername(uname);
    setPassword(pwd);
    login(uname, pwd, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100 dark:bg-black transition-colors">
      <div className="w-full max-w-[440px] bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-md p-8 sm:p-10 shadow-xl shadow-slate-200/60 dark:shadow-black/60 transition-colors">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" strokeWidth={1.8} />
            <span className="font-brand font-bold text-lg text-slate-900 dark:text-white">ControlPlane AI</span>
          </div>

          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-md flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-800 hover:bg-slate-50 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-slate-300" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>
        </div>

        <div className="mb-6">
          <h1 className="font-brand text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sign in</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Enter your credentials to access your ControlPlane workspace.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
              USERNAME OR EMAIL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="admin or ankur@acme.com"
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-500 dark:text-rose-400 font-medium mt-1.5">
                {errorMsg}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
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
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary accent-primary"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/25 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Quick Demo Sign In Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'password123')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-dark-900 dark:hover:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors flex items-center justify-between px-3"
            >
              <span>Demo Quick Sign-In (admin / password123)</span>
              <ArrowRight className="w-3 h-3 text-primary" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
