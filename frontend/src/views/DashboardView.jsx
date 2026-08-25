import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAnalytics } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Zap,
  CheckCircle2,
  Lock,
  Eye,
  Ban,
  Copy,
  ExternalLink,
  Plus,
  ChevronRight,
  Bot,
  Cpu,
  Server,
  Layers,
  Cloud,
  Laptop,
  Boxes,
  ShieldCheck,
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

  const totalAssets = (data?.total_resources ? data.total_resources * 4 : 14) || 14;
  const modelCount = 11;
  const endpointCount = 2;
  const mcpServerCount = 1;
  const agentCount = 0;
  const appCount = 0;

  const platforms = [
    { name: 'openai', count: 4, icon: Cloud },
    { name: 'anthropic', count: 3, icon: Cloud },
    { name: 'windows', count: 2, icon: Laptop },
    { name: 'deepseek', count: 1, icon: Cloud },
    { name: 'google', count: 1, icon: Cloud },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
      </div>

      {/* Top Row: 2 Cards (Discovered Assets & Resources by Platform) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Discovered Assets */}
        <div className="glass-panel p-6 sm:p-7 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Boxes className="w-4 h-4 text-primary" />
              <span>Discovered Assets</span>
            </div>
            <a
              href="#/inventory"
              className="text-[11px] font-bold text-primary dark:text-primary-light hover:underline uppercase tracking-wider flex items-center gap-1"
            >
              <span>View Inventory</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-brand">
                {totalAssets}
              </span>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                ↑ 3 MoM
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across 1 connected integration
            </p>
          </div>

          {/* Multi-segment progress bar */}
          <div className="space-y-2">
            <div className="w-full h-2 rounded-none bg-slate-100 dark:bg-dark-900 overflow-hidden flex">
              <div style={{ width: '75%' }} className="h-full bg-orange-500"></div>
              <div style={{ width: '15%' }} className="h-full bg-orange-400"></div>
              <div style={{ width: '10%' }} className="h-full bg-orange-300"></div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>Model {modelCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span>Endpoint {endpointCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-300"></span>
                <span>MCP_Server {mcpServerCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Resources by Platform */}
        <div className="glass-panel p-6 sm:p-7 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Layers className="w-4 h-4 text-primary" />
              <span>Resources by Platform</span>
            </div>
            <a
              href="#/inventory/add"
              className="px-3 py-1 rounded-none bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 text-[11px] font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Platform</span>
            </a>
          </div>

          <div className="space-y-2 pt-1">
            {platforms.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.name}
                  className="flex items-center justify-between py-1.5 px-2 rounded-none hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-none bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {p.count} Resources
                  </span>
                </div>
              );
            })}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <a
                href="#/inventory"
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-between py-1 px-2 rounded-none hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors"
              >
                <span>... 3 more platforms</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: AI Resources Discovered (4 Columns) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Layers className="w-4 h-4 text-primary" />
            <span>AI Resources Discovered</span>
          </div>
          <a
            href="#/inventory"
            className="text-[11px] font-bold text-primary dark:text-primary-light hover:underline uppercase tracking-wider flex items-center gap-1"
          >
            <span>View Inventory</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: AGENTS */}
          <div className="glass-panel p-5 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
                <span>Agents</span>
              </div>
              <span>- 0 MoM</span>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-brand">{agentCount}</div>
            </div>

            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span>• 0 critical</span>
                <span>• 0 high</span>
                <span>• 0 medium</span>
                <span>• 0 low</span>
              </div>
              <a
                href="#/agent-runtime"
                className="text-xs font-semibold text-primary dark:text-primary-light hover:underline flex items-center gap-1"
              >
                <span>View agents</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Card 2: MODELS */}
          <div className="glass-panel p-5 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                <span>Models</span>
              </div>
              <span>- 0 MoM</span>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-brand">{modelCount}</div>
              <div className="w-full h-1 bg-orange-400 rounded-none mt-2"></div>
            </div>

            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span>• 0 critical</span>
                <span className="text-orange-400 font-semibold">• 15 high</span>
                <span className="text-orange-400 font-semibold">• 113 medium</span>
                <span>• 0 low</span>
              </div>
              <a
                href="#/security-center/policies"
                className="text-xs font-semibold text-primary dark:text-primary-light hover:underline flex items-center gap-1"
              >
                <span>View governance</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Card 3: MCP SERVERS */}
          <div className="glass-panel p-5 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-primary" />
                <span>MCP Servers</span>
              </div>
              <span>- 0 MoM</span>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-brand">{mcpServerCount}</div>
            </div>

            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span>• 0 critical</span>
                <span>• 0 high</span>
                <span>• 0 medium</span>
                <span>• 0 low</span>
              </div>
              <a
                href="#/inventory"
                className="text-xs font-semibold text-primary dark:text-primary-light hover:underline flex items-center gap-1"
              >
                <span>View MCP servers</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Card 4: APPS */}
          <div className="glass-panel p-5 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>Apps</span>
              </div>
              <span>- 0 MoM</span>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-brand">{appCount}</div>
            </div>

            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span>• 0 critical</span>
                <span>• 0 high</span>
                <span>• 0 medium</span>
                <span>• 0 low</span>
              </div>
              <a
                href="#/inventory"
                className="text-xs font-semibold text-primary dark:text-primary-light hover:underline flex items-center gap-1"
              >
                <span>View applications</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Guardrail Security Telemetry & Enforcement Action Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Left: Tenant API Key & Governance Status */}
        <div className="glass-panel p-6 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Real-Time Guardrail Shield & Live Token</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-none text-[10px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              <span>Sub-15ms Active</span>
            </span>
          </div>

          <div className="p-3.5 rounded-none bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tenant Live API Key</div>
              <code className="text-xs font-mono text-primary dark:text-accent-cyan font-bold truncate block mt-0.5">
                {data?.tenant_api_key || `tp_live_${activeTenant.replace(/-/g, '_')}_key`}
              </code>
            </div>
            <button
              onClick={copyApiKey}
              className="p-2 rounded-none bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-primary transition-colors flex-shrink-0 shadow-sm"
              title="Copy API Key"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1 text-center">
            <div className="p-3 rounded-none bg-slate-50 dark:bg-dark-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Trust Index</div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400 font-brand">
                {data?.trustworthiness_score ?? 98.8}%
              </div>
            </div>
            <div className="p-3 rounded-none bg-slate-50 dark:bg-dark-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Avg Latency</div>
              <div className="text-lg font-bold text-primary font-brand">
                {data?.avg_latency_ms ?? 12.4} ms
              </div>
            </div>
            <div className="p-3 rounded-none bg-slate-50 dark:bg-dark-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Interceptions</div>
              <div className="text-lg font-bold text-primary dark:text-primary-light font-brand">
                {data?.total_interceptions ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Enforcement Action Breakdown */}
        <div className="glass-panel p-6 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span>Enforcement Action Breakdown</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Deterministic Rules</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-none bg-orange-500/10 border border-orange-500/20 space-y-1">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{allowCount}</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span>ALLOW (Clean)</span>
              </div>
            </div>

            <div className="p-4 rounded-none bg-orange-400/10 border border-orange-400/20 space-y-1">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{maskCount}</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-orange-500 dark:text-orange-300" />
                <span>MASK (Redacted)</span>
              </div>
            </div>

            <div className="p-4 rounded-none bg-orange-300/10 border border-orange-300/20 space-y-1">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{monitorCount}</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-orange-500 dark:text-orange-300" />
                <span>MONITOR (Audited)</span>
              </div>
            </div>

            <div className="p-4 rounded-none bg-orange-200/10 border border-orange-200/20 space-y-1">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-200">{blockCount}</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Ban className="w-3.5 h-3.5 text-orange-500 dark:text-orange-200" />
                <span>BLOCK (Halted)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
