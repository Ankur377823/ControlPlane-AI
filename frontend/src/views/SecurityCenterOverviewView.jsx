import React, { useState, useEffect } from 'react';
import { fetchFindings, fetchAnalytics } from '../services/api';
import { Shield, ArrowRight, RefreshCw, ChevronDown } from 'lucide-react';

export function SecurityCenterOverviewView({ onSelectFinding, onNavigatePolicies, onNavigateRiskFindings }) {
  const [findings, setFindings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('critical_high');

  const loadData = async () => {
    setLoading(true);
    try {
      const [fData, sData] = await Promise.all([fetchFindings({ limit: 100 }), fetchAnalytics()]);
      setFindings(fData || []);
      setStats(sData || null);
    } catch (e) {
      console.warn('Failed to load overview data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute breakdown stats dynamically from loaded findings
  const totalCount = findings.length;
  const criticalCount = findings.filter((f) => (f.severity || '').toUpperCase() === 'CRITICAL').length;
  const highCount = findings.filter((f) => (f.severity || '').toUpperCase() === 'HIGH').length;
  const mediumCount = findings.filter((f) => (f.severity || '').toUpperCase() === 'MEDIUM').length;
  const lowCount = findings.filter((f) => (f.severity || '').toUpperCase() === 'LOW').length;

  const resolvedCount = findings.filter((f) => (f.status || '').toUpperCase() === 'RESOLVED').length;
  const openCount = findings.filter((f) => (f.status || '').toUpperCase() === 'OPEN' || !f.status).length;
  const resolvedPct = totalCount > 0 ? ((resolvedCount / totalCount) * 100).toFixed(1) + '%' : '0.0%';

  const inventoryCount = findings.filter((f) => {
    const s = (f.source || '').toLowerCase();
    return s.includes('inventory') || s.includes('resource');
  }).length;

  const runtimeCount = findings.filter((f) => {
    const s = (f.source || '').toLowerCase();
    return s.includes('runtime') || s.includes('gateway') || s.includes('botpress') || s.includes('rest');
  }).length;

  const agentSessionCount = findings.filter((f) => {
    const s = (f.source || '').toLowerCase();
    return s.includes('agent');
  }).length;

  const endpointCount = findings.filter((f) => {
    const s = (f.source || '').toLowerCase();
    return s.includes('endpoint') || s.includes('browser') || s.includes('chatgpt') || s.includes('extension');
  }).length;

  // Filter recent critical/high findings
  const filteredRecent = findings.filter((f) => {
    const s = (f.severity || '').toUpperCase();
    if (severityFilter === 'critical_high') return s === 'CRITICAL' || s === 'HIGH';
    if (severityFilter === 'critical') return s === 'CRITICAL';
    if (severityFilter === 'high') return s === 'HIGH';
    return true;
  });

  const getSeverityBadge = (sev) => {
    const s = (sev || 'HIGH').toUpperCase();
    return (
      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400">
        {s}
      </span>
    );
  };

  const getRelativeAge = (timestamp) => {
    if (!timestamp) return 'a day ago';
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'just now';
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
          <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Security Center</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Unified view of security findings across all risk sources
        </p>
      </div>

      {/* Large Open Findings Card */}
      <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-none p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Open Findings
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-brand">
              {openCount}
            </div>

            {/* Progress Breakdown Bar */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-2 bg-slate-100 dark:bg-dark-900 overflow-hidden flex">
                <div style={{ width: `${(criticalCount / totalCount) * 100}%` }} className="bg-orange-700"></div>
                <div style={{ width: `${(highCount / totalCount) * 100}%` }} className="bg-orange-500"></div>
                <div style={{ width: `${(mediumCount / totalCount) * 100}%` }} className="bg-orange-400"></div>
                <div style={{ width: `${(lowCount / totalCount) * 100}%` }} className="bg-orange-300"></div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-orange-700"></span>
                  <span>Critical {criticalCount}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-orange-500"></span>
                  <span>High {highCount}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-orange-400"></span>
                  <span>Medium {mediumCount}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-orange-300"></span>
                  <span>Low {lowCount}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Stats Column */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 lg:min-w-[180px] pt-4 lg:pt-0 lg:border-l lg:border-slate-100 dark:lg:border-slate-800 lg:pl-8 text-left">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-brand">{resolvedPct}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Findings</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-brand">{totalCount}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Findings MoM</div>
              <div className="text-lg font-bold text-primary font-brand">↑ 4%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Card Source Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-none p-5 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Inventory
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-brand">{inventoryCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Cloud & platform misconfigurations</div>
        </div>

        <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-none p-5 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            AI Runtime
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-brand">{runtimeCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Gateway LLM & MCP traffic</div>
        </div>

        <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-none p-5 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Agent Session
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-brand">{agentSessionCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Autonomous agent violations</div>
        </div>

        <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-none p-5 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Endpoint
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-brand">{endpointCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Browser & device shadow AI</div>
        </div>
      </div>

      {/* Policies & Protection Card */}
      <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-none p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white">Policies & Protection</h3>
          <button
            onClick={onNavigatePolicies}
            className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
          >
            <span>Manage policies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase">Active Policies</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-brand">9</div>
            <div className="text-[11px] text-slate-500">of 9 configured</div>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase">Protections Enabled</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-brand">—</div>
            <div className="text-[11px] text-slate-500">of 9 realtime protections</div>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase">Policy Detections</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-brand">{totalCount}</div>
            <div className="text-[11px] text-slate-500">findings caught by runtime rules</div>
          </div>
        </div>
      </div>

      {/* Recent Critical Findings Table */}
      <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-none shadow-sm overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
            Recent Critical Findings
          </h3>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-primary shadow-sm"
              >
                <option value="critical_high">Critical + High</option>
                <option value="critical">Critical Only</option>
                <option value="high">High Only</option>
                <option value="all">All Severities</option>
              </select>
            </div>

            <button
              onClick={onNavigateRiskFindings}
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
            >
              <span>View all findings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/70 dark:bg-dark-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4 border border-slate-200 dark:border-slate-800">Severity</th>
                <th className="py-3 px-4 border border-slate-200 dark:border-slate-800">Finding</th>
                <th className="py-3 px-4 border border-slate-200 dark:border-slate-800">Source</th>
                <th className="py-3 px-4 border border-slate-200 dark:border-slate-800">Context</th>
                <th className="py-3 px-4 border border-slate-200 dark:border-slate-800">Age</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              {filteredRecent.slice(0, 8).map((f) => (
                <tr
                  key={f.id}
                  onClick={() => onSelectFinding(f.id)}
                  className="hover:bg-orange-50/40 dark:hover:bg-orange-500/5 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 border border-slate-200 dark:border-slate-800">{getSeverityBadge(f.severity)}</td>
                  <td className="py-3 px-4 border border-slate-200 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white">{f.finding_title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{f.finding_code || 'PII-OUTPUT-001'}</div>
                  </td>
                  <td className="py-3 px-4 border border-slate-200 dark:border-slate-800">
                    <span className="px-2 py-0.5 rounded-sm text-[11px] bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {f.source || 'Endpoint'}
                    </span>
                  </td>
                  <td className="py-3 px-4 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-200 font-medium">
                    {f.context || 'SECRET_EXPOSURE'}
                  </td>
                  <td className="py-3 px-4 border border-slate-200 dark:border-slate-800 text-slate-500">{getRelativeAge(f.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
