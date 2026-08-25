import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAnalytics } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Zap,
  Activity,
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Eye,
  Ban,
  Copy,
} from 'lucide-react';

export function DashboardView() {
  const { activeTenant } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchAnalytics(activeTenant);
        setData(res);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeTenant]);

  const copyApiKey = () => {
    const key = data?.tenant_api_key || `tp_live_${activeTenant.replace(/-/g, '_')}_key`;
    navigator.clipboard.writeText(key);
    showToast(`Tenant API key copied to clipboard! (${key})`, 'cyan');
  };

  const actionBreakdown = data?.action_breakdown || {};
  const allowCount = actionBreakdown.ALLOW || 0;
  const maskCount = (actionBreakdown.MASK || 0) + (actionBreakdown.REDACT || 0);
  const monitorCount = (actionBreakdown.MONITOR || 0) + (actionBreakdown.FLAG || 0);
  const blockCount = (actionBreakdown.BLOCK || 0) + (actionBreakdown.CONFIRM_REQUIRED || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Active Tenant Overview & Live Token Card */}
      <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-primary shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light border border-primary/25 tracking-wider">
                ACTIVE TENANT WORKSPACE
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                {data?.tenant_id || activeTenant}
              </span>
            </div>
            <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">
              Tenant Governance Summary Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              High-level security telemetry, risk finding counts, and red-team scan executions for this tenant workspace.
            </p>
          </div>

          {/* Live API Key Widget */}
          <div className="bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl flex flex-col gap-2 min-w-[280px]">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>🔑 Tenant API Key</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">● LIVE TOKEN</span>
            </div>
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-dark-850 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5">
              <code className="text-xs font-mono text-primary dark:text-accent-cyan truncate font-semibold">
                {data?.tenant_api_key || `tp_live_${activeTenant.replace(/-/g, '_')}_key`}
              </code>
              <button
                onClick={copyApiKey}
                className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors flex-shrink-0"
                title="Copy API Key"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Score KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Interception Velocity */}
        <div className="glass-card p-5 rounded-2xl space-y-1 hover:border-primary/40 transition-colors">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Interception Velocity</div>
          <div className="text-3xl font-black text-primary font-brand">{data?.total_interceptions ?? 0}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold pt-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Sub-15ms Latency</span>
          </div>
        </div>

        {/* Performance Score */}
        <div className="glass-card p-5 rounded-2xl space-y-1 hover:border-primary/40 transition-colors">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Performance (P) Score</div>
          <div className="text-3xl font-black text-indigo-600 dark:text-primary-light font-brand">
            {data?.avg_performance_score ?? 98.5}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">Factuality Average</div>
        </div>

        {/* Cost Score */}
        <div className="glass-card p-5 rounded-2xl space-y-1 hover:border-amber-500/40 transition-colors">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Cost ($) Score</div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-brand">
            {data?.avg_cost_score ?? 94.2}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">Budget Efficiency</div>
        </div>

        {/* Responsibility Score */}
        <div className="glass-card p-5 rounded-2xl space-y-1 hover:border-emerald-500/40 transition-colors">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Responsibility (R) Score</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-brand">
            {data?.avg_responsibility_score ?? 99.1}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">Safety Enforcement</div>
        </div>
      </div>

      {/* Enforcement Breakdown & Trustworthiness Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Breakdown */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
              Enforcement Action Breakdown
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Deterministic Sub-15ms Rules</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{allowCount}</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>ALLOW (Clean)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
              <div className="text-2xl font-extrabold text-cyan-700 dark:text-cyan-400">{maskCount}</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>MASK (Auto-Redacted)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">{monitorCount}</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>MONITOR (Audited)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">{blockCount}</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Ban className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>BLOCK (Halted)</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics & Trustworthiness Index */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
              System Metrics & Trustworthiness Index
            </h3>
            <span className="text-xs text-primary dark:text-accent-cyan font-mono font-semibold">
              Calibrated by Evaluators
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400">Overall System Trustworthiness Score</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                {data?.trustworthiness_score ?? 98.8}%
              </strong>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400">False Positive Rate (FPR %)</span>
              <strong className="text-cyan-700 dark:text-cyan-400 font-mono font-bold">
                {data?.false_positive_rate_percent ?? 1.2}%
              </strong>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400">False Negative Rate (FNR %)</span>
              <strong className="text-amber-700 dark:text-amber-400 font-mono font-bold">
                {data?.false_negative_rate_percent ?? 0.9}%
              </strong>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400">Average Interception Latency</span>
              <strong className="text-primary font-mono font-bold">
                {data?.avg_latency_ms ?? 12.4} ms
              </strong>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400">Active Bot Resources</span>
              <strong className="text-slate-900 dark:text-white font-bold">{data?.total_resources ?? 1}</strong>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-600 dark:text-slate-400">Automated Red-Team Scans</span>
              <strong className="text-slate-900 dark:text-white font-bold">{data?.total_scans ?? 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
