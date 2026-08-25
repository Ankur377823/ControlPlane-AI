import React, { useState, useEffect } from 'react';
import { fetchFindings } from '../services/api';
import { Shield, Search, RefreshCw, ArrowUpDown } from 'lucide-react';

const FILTER_SOURCES = ['All', 'Inventory', 'AI Runtime', 'External Gateway', 'Agent Session', 'Endpoint'];
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

  const sevBadge = (sev) => {
    return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
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
          <h1 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Risk Findings</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Detection and platform findings across inventory, gateway, agent, and endpoint sources
        </p>
      </div>

      {/* Filter Source Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_SOURCES.map((src) => (
          <button
            key={src}
            onClick={() => setSourceFilter(src)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              sourceFilter === src
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-semibold shadow-sm'
                : 'bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-dark-800'
            }`}
          >
            {src}
          </button>
        ))}
      </div>

      {/* Severity Filter + Finding Count + Refresh */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary shadow-sm font-medium"
          >
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev} className="bg-white dark:bg-dark-850 text-slate-900 dark:text-white">
                {sev}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {sortedFindings.length} findings
          </span>
        </div>

        <button
          onClick={loadFindings}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors text-xs font-semibold shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Clean Enterprise Findings Table matching screenshot */}
      <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/70 dark:bg-dark-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs">
              <tr>
                <th
                  onClick={() => handleSort('severity')}
                  className="py-3.5 px-5 cursor-pointer select-none hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Severity</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('finding_title')}
                  className="py-3.5 px-5 cursor-pointer select-none hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Finding</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('source')}
                  className="py-3.5 px-5 cursor-pointer select-none hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Source</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('context')}
                  className="py-3.5 px-5 cursor-pointer select-none hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Context</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3.5 px-5 cursor-pointer select-none hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('timestamp')}
                  className="py-3.5 px-5 cursor-pointer select-none hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {loading && sortedFindings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading risk findings...
                  </td>
                </tr>
              ) : sortedFindings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No active risk findings matching current filter.
                  </td>
                </tr>
              ) : (
                sortedFindings.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectFinding(item.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-dark-800/50 cursor-pointer transition-colors"
                  >
                    {/* Severity Pill */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${sevBadge(
                          item.severity
                        )}`}
                      >
                        {item.severity || 'HIGH'}
                      </span>
                    </td>

                    {/* Finding Title & Code */}
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.finding_title || 'PII Detected in Model Response'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item.finding_code || 'PII-OUTPUT-001'}
                      </div>
                    </td>

                    {/* Source Pill */}
                    <td className="py-3.5 px-5">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                        {item.source || 'Endpoint'}
                      </span>
                    </td>

                    {/* Context Category */}
                    <td className="py-3.5 px-5 font-mono text-xs text-slate-700 dark:text-slate-300 uppercase font-medium">
                      {item.context || 'SECRET_EXPOSURE'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-400 lowercase">
                      {item.status || 'open'}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-5 text-xs text-slate-500 whitespace-nowrap">
                      {formatTime(item.timestamp)}
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
