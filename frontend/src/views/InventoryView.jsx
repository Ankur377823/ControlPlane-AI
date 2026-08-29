import React, { useState, useEffect } from 'react';
import { fetchResources, validateResource } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Boxes, Plus, CheckCircle2, RefreshCw, Zap, Server } from 'lucide-react';

export function InventoryView({ onNavigateOnboard }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validatingId, setValidatingId] = useState(null);
  const { showToast } = useToast();

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await fetchResources();
      setResources(data || []);
    } catch (err) {
      showToast('Error loading resources: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleValidate = async (id) => {
    setValidatingId(id);
    try {
      const res = await validateResource(id);
      const isOk = res.validation_status === 'valid' || res.validation_status === 'validated';
      showToast(
        `Target Botpress Validation: ${res.validation_status?.toUpperCase() || 'VALID'}`,
        isOk ? 'success' : 'error'
      );
      loadResources();
    } catch (err) {
      showToast('Validation failed: ' + err.message, 'error');
    } finally {
      setValidatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'not_validated').toLowerCase().trim();
    if (s === 'valid' || s === 'validated' || s === 'success') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Valid</span>
        </span>
      );
    }
    if (s === 'failed' || s === 'invalid' || s === 'error') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Failed</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>Not Validated</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary dark:text-primary-light">
            <Boxes className="w-5 h-5" />
            <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Monitored AI Resources</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Register and manage AI chatbots, agent endpoints, and webhook connectors under ControlPlane guardrail protection.
          </p>
        </div>

        <button
          onClick={onNavigateOnboard}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-[#e4e4e7] active:bg-[#d4d4d8] text-black text-xs font-bold font-mono tracking-wider transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-black stroke-[2.5]" />
          <span>+ Onboard New Resource</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="glass-panel rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="border border-slate-200 dark:border-slate-800 py-3.5 px-4">AI Tool / Resource Name</th>
                <th className="border border-slate-200 dark:border-slate-800 py-3.5 px-4">AI Provider</th>
                <th className="border border-slate-200 dark:border-slate-800 py-3.5 px-4">Account Name</th>
                <th className="border border-slate-200 dark:border-slate-800 py-3.5 px-4">Use Case Type</th>
                <th className="border border-slate-200 dark:border-slate-800 py-3.5 px-4">Webhook ID</th>
                <th className="border border-slate-200 dark:border-slate-800 py-3.5 px-4">Status</th>
                <th className="border border-slate-200 dark:border-slate-800 py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              {loading && resources.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading monitored AI resources...
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No resources onboarded yet. Click "Onboard New Resource" to add one.
                  </td>
                </tr>
              ) : (
                resources.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-dark-900/50 transition-colors">
                    <td className="border border-slate-200 dark:border-slate-800 py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{r.resource_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {r.id}</div>
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 py-3.5 px-4">
                      <span className="font-bold text-primary dark:text-accent-cyan flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5" />
                        <span>{r.ai_provider === 'botpress' ? 'Botpress Connector' : 'Botpress Webhook'}</span>
                      </span>
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">{r.account_name}</td>
                    <td className="border border-slate-200 dark:border-slate-800 py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] bg-primary/10 text-primary dark:text-primary-light font-mono font-bold border border-primary/20">
                        {r.use_case_type}
                      </span>
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 py-3.5 px-4">
                      <code className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {r.webhook_id_redacted || '••••••••'}
                      </code>
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 py-3.5 px-4">
                      {getStatusBadge(r.validation_status)}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleValidate(r.id)}
                        disabled={validatingId === r.id}
                        className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-1 shadow-sm"
                      >
                        {validatingId === r.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        )}
                        <span>Validate</span>
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
