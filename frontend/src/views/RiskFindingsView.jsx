import React, { useState, useEffect } from 'react';
import { fetchFindings } from '../services/api';
import { Shield, Search, RefreshCw, ArrowUpDown, Filter, Layers, Laptop, Bot, Server, Cpu } from 'lucide-react';

const FILTER_SOURCES = [
  { id: 'All', label: 'All Sources', icon: Layers },
  { id: 'Endpoint', label: 'Browser Extension (ChatGPT)', icon: Laptop },
  { id: 'Inventory', label: 'Botpress Webhooks', icon: Bot },
  { id: 'External Gateway', label: 'REST AI Gateway', icon: Server },
  { id: 'AI Runtime', label: 'Agent Runtime', icon: Cpu },
];

const SEVERITIES = ['All severities', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function RiskFindingsView({ onSelectFinding }) {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All severities');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortAsc, setSortAsc] = useState(false);

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedFindings = [...findings].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const getSeverityStyle = (sev) => {
    const s = (sev || 'HIGH').toUpperCase();
    if (s === 'CRITICAL') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    if (s === 'HIGH') return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
    if (s === 'MEDIUM') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
  };

  const formatTime = (ts) => {
    if (!ts) return 'a day ago';
    try {
      let dateObj = new Date(ts);
      if (isNaN(dateObj.getTime())) {
        const num = Number(ts);
        if (!isNaN(num)) {
          dateObj = new Date(num > 10000000000 ? num : num * 1000);
        } else {
          return ts || 'a day ago';
        }
      }
      const now = Date.now();
      const past = dateObj.getTime();
      const diffSec = Math.max(0, Math.floor((now - past) / 1000));

      if (diffSec < 60) return 'just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin === 1) return '1 min ago';
      if (diffMin < 60) return `${diffMin} mins ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      return diffDays === 1 ? 'a day ago' : `${diffDays} days ago`;
    } catch (e) {
      return 'a day ago';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-900 dark:text-white" />
          <h1 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Risk Findings & Telemetry</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Real-time security violations and telemetry across Chrome Extension (ChatGPT), Botpress Webhooks, and API Gateways
        </p>
      </div>

      {/* Clear Self-Descriptive Source Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_SOURCES.map((src) => {
          const Icon = src.icon;
          const isSelected = sourceFilter === src.id;
          return (
            <button
              key={src.id}
              onClick={() => setSourceFilter(src.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm border border-slate-900 dark:border-white'
                  : 'bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-dark-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{src.label}</span>
            </button>
          );
        })}
      </div>

      {/* Severity Filter + Finding Count + Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary shadow-sm font-medium"
          >
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev} className="bg-white dark:bg-dark-850 text-slate-900 dark:text-white">
                {sev}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {sortedFindings.length} {sortedFindings.length === 1 ? 'finding' : 'findings'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompts, rules..."
              className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-primary shadow-sm w-48 sm:w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <button
            onClick={loadFindings}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50/75 dark:bg-dark-900/75 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('severity')}>
                <div className="flex items-center gap-1">
                  <span>Severity</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('finding_title')}>
                <div className="flex items-center gap-1">
                  <span>Finding</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('source')}>
                <div className="flex items-center gap-1">
                  <span>Source</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('context')}>
                <div className="flex items-center gap-1">
                  <span>Context</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer select-none text-right" onClick={() => handleSort('timestamp')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                  <div className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                  <div>Loading risk findings...</div>
                </td>
              </tr>
            ) : sortedFindings.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                  No risk findings found for this filter combination.
                </td>
              </tr>
            ) : (
              sortedFindings.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => onSelectFinding && onSelectFinding(f.id)}
                  className="hover:bg-slate-50 dark:hover:bg-dark-800/60 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${getSeverityStyle(
                        f.severity
                      )}`}
                    >
                      {f.severity || 'HIGH'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {f.finding_title || 'Security Violation Detected'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {f.finding_code || f.id}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-dark-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 inline-block">
                      {f.source || 'Endpoint AI'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                    {f.context || 'PII_CREDIT_CARD'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-bold uppercase ${
                        f.status === 'open'
                          ? 'text-orange-500'
                          : f.status === 'resolved'
                          ? 'text-emerald-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {f.status || 'open'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                    {formatTime(f.timestamp)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
