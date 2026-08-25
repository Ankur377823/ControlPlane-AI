import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Eye, EyeOff, Lock, User, Sun, Moon, Shield, Key } from 'lucide-react';

export function LoginScreen() {
  const { login, googleLogin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }
    setLoading(true);
    const success = await login(username.trim(), password, remember);
    if (!success) {
      setErrorMsg('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100 dark:bg-black transition-colors">
      <div className="w-full max-w-[440px] bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-md p-8 sm:p-10 shadow-xl shadow-slate-200/60 dark:shadow-black/60 transition-colors">
        <div className="flex items-center justify-between mb-10">
          <Shield className="w-10 h-10 text-primary" strokeWidth={1.8} />

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-md flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-800 hover:bg-slate-50 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

        <div className="mb-8">
          <h1 className="font-brand text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Sign in to your ControlPlane AI security workspace.</p>
        </div>


        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
              EMAIL ADDRESS
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
                placeholder="ankur@acme.com"
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
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
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              <span className="text-xs text-slate-500 dark:text-slate-400">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-md bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-md shadow-primary/25 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Google Sign In Option */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => googleLogin('ankur@acme.com', 'Ankur Kumar Singh')}
              className="w-full py-3 rounded-md bg-white hover:bg-slate-50 dark:bg-dark-850 dark:hover:bg-dark-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Key className="w-3.5 h-3.5 text-primary" />
              <span>Sign in with Google OAuth (Demo)</span>
            </button>
          </div>

          {/* Google Sign In Option */}
          <button
            type="button"
            onClick={() => googleLogin('ankur@acme.com', 'Ankur Kumar Singh')}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-dark-900 dark:hover:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2.5 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}

