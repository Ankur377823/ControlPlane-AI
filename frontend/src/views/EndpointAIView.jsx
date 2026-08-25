import React from 'react';
import { Laptop, CheckCircle2, Lock, FileText, Zap } from 'lucide-react';

const SUPPORTED_PLATFORMS = [
  { name: 'ChatGPT', url: 'chat.openai.com', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25' },
  { name: 'Claude', url: 'claude.ai', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25' },
  { name: 'Gemini', url: 'gemini.google.com', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25' },
  { name: 'DeepSeek', url: 'chat.deepseek.com', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25' },
  { name: 'Kimi', url: 'kimi.moonshot.cn', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25' },
];

export function EndpointAIView() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary dark:text-primary-light">
          <Laptop className="w-5 h-5" />
          <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Extension & Endpoint AI Interceptor</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Browser extension connection status, supported AI chat platforms, and quick-setup guide for client-side prompt guarding.
        </p>
      </div>

      {/* Top 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-emerald-500 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                Extension Connection Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">ControlPlane Chrome Extension v1.0 (Manifest V3)</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Connected to localhost:8000</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary dark:text-primary-light border border-primary/25 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>HTTPS Intercept Active</span>
            </span>
          </div>
        </div>

        {/* Supported Platforms Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-4">
          <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">Supported AI Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_PLATFORMS.map((p) => (
              <span key={p.name} className={`px-3 py-1 rounded-xl text-xs font-semibold border ${p.color}`}>
                {p.name} ({p.url})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-4">
        <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span>Quick Setup Guide for Chrome Extension</span>
        </h3>

        <ol className="space-y-3 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside leading-relaxed font-medium">
          <li>
            Open Google Chrome and navigate to{' '}
            <code className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-900 text-primary dark:text-accent-cyan font-mono border border-slate-200 dark:border-slate-700">
              chrome://extensions/
            </code>
          </li>
          <li>
            Toggle <strong className="text-slate-900 dark:text-white font-bold">Developer mode</strong> to ON in the top-right corner.
          </li>
          <li>
            Click <strong className="text-slate-900 dark:text-white font-bold">Load unpacked</strong> and select the directory:{' '}
            <code className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-900 text-primary dark:text-accent-cyan font-mono border border-slate-200 dark:border-slate-700">
              frontend/extension/
            </code>
          </li>
          <li>
            Open the extension popup from the browser toolbar and click{' '}
            <strong className="text-primary dark:text-primary-light">Auto-Enroll Extension</strong>.
          </li>
          <li>
            The status indicator will switch to <span className="text-emerald-600 dark:text-emerald-400 font-bold">CONNECTED</span> and commence client-side prompt guarding.
          </li>
          <li>
            Navigate to any supported platform (ChatGPT, Claude, etc.) — the top monitoring banner confirms active interception.
          </li>
        </ol>
      </div>
    </div>
  );
}
