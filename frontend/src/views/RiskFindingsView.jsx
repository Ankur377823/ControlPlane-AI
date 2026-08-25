import React, { useState, useEffect } from 'react';
import { fetchFindings } from '../services/api';
import { ShieldAlert, Search, RefreshCw, ArrowUpRight, Bot } from 'lucide-react';

const FILTER_SOURCES = ['All', 'Endpoint', 'Inventory', 'External Gateway', 'Agent Session'];
const SEVERITIES = ['All severities', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function RiskFindingsView({ onSelectFinding }) {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All severities');
  const [searchTerm, setSearchTerm] = useState('');

  const loadFindings = async () => {
    setLoading(true);
    try {
      const data = await fetchFindings({
        source: sourceFilter,
        severity: severityFilter,
        search: searchTerm,
      });
      setFindings(data || []);
    } catch (err) {
      console.error('Failed to load findings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [sourceFilter, severityFilter, searchTerm]);

  const criticalCount = findings.filter(
    (f) => (f.severity || '').toUpperCase() === 'CRITICAL' || (f.severity || '').toUpperCase() === 'HIGH'
  ).length;
  const avgLatency = findings.length
    ? Math.round(findings.reduce((sum, f) => sum + (f.latency_ms || 0), 0) / findings.length)
    : 0;
  const uniqueBots = new Set(findings.map((f) => f.source || 'Endpoint AI Bot')).size;

  const sevColor = (sev) => {
    switch ((sev || '').toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25';
      case 'MEDIUM':
        return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25';
      default:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25';
    }
  };

  const formatTime = (ts) => {
    if (!ts) return 'Just now';
    try {
      const date = new Date(ts);
      return isNaN(date.getTime()) ? ts : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary dark:text-primary-light">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Risk Findings Telemetry</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Live prompt-level vulnerability telemetry and interceptions across all connected AI chat channels.
        </p>
      </div>

      {/* 4 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-primary space-y-1">
          <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">TOTAL INTERCEPTIONS</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{findings.length}</div>
          <div className="text-[11px] text-slate-500">Across all active channels</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-rose-500 space-y-1">
          <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">CRITICAL & HIGH RISKS</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{criticalCount}</div>
          <div className="text-[11px] text-slate-500">Immediate action recommended</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-cyan-500 space-y-1">
          <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">AVERAGE LATENCY</div>
          <div className="text-2xl font-black text-cyan-700 dark:text-cyan-400">{avgLatency} ms</div>
          <div className="text-[11px] text-slate-500">Sub-15ms compliance threshold</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500 space-y-1">
          <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">MONITORED CHANNELS</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{uniqueBots}</div>
          <div className="text-[11px] text-slate-500">Connected agent frameworks</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {FILTER_SOURCES.map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                sourceFilter === src
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              {src}
            </button>
          ))}
        </div>

        {/* Search & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
          >
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev} className="bg-white dark:bg-dark-850 text-slate-900 dark:text-white">
                {sev}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompts & session..."
              className="w-48 sm:w-56 bg-white dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <button
            onClick={loadFindings}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
            title="Refresh findings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Findings Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-dark-800/90 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Finding & Risk Cause</th>
                <th className="py-3.5 px-4">Chatbot Target</th>
                <th className="py-3.5 px-4">Session ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {loading && findings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading risk findings telemetry...
                  </td>
                </tr>
              ) : findings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                    No Active Risk Findings Match Current Filter.
                  </td>
                </tr>
              ) : (
                findings.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectFinding(item.id, item.session_id)}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${sevColor(item.severity)}`}>
                        {item.severity || 'HIGH'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{item.finding_title}</div>
                      <div className="text-[11px] text-primary dark:text-accent-cyan font-mono font-medium">
                        {item.context || 'PII_FLAG'} ({item.finding_code})
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{formatTime(item.timestamp)}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                        <span>{item.source || 'Endpoint AI Bot'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{item.resource_name || 'Global Guardrail'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary dark:text-primary-light font-mono text-[11px] font-bold border border-primary/20 hover:bg-primary/20 transition-colors">
                        🔗 {item.session_id || 'sess_8f3a92b1'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        ● {item.status || 'open'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFinding(item.id, item.session_id);
                        }}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
