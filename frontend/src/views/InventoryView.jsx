import React, { useState, useEffect } from 'react';
import { fetchResources, validateResource } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Boxes, Plus, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

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
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 inline-flex items-center gap-1">
          <span>🟢</span>
          <span>Valid</span>
        </span>
      );
    }
    if (s === 'failed' || s === 'invalid' || s === 'error') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25 inline-flex items-center gap-1">
          <span>🔴</span>
          <span>Failed</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 inline-flex items-center gap-1">
        <span>🟡</span>
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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Resource</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-dark-800/90 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">AI Tool / Resource Name</th>
                <th className="py-3.5 px-4">AI Provider</th>
                <th className="py-3.5 px-4">Account Name</th>
                <th className="py-3.5 px-4">Use Case Type</th>
                <th className="py-3.5 px-4">Webhook ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-700 dark:text-slate-300">
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
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{r.resource_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {r.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-primary dark:text-accent-cyan flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>{r.ai_provider === 'botpress' ? 'Botpress Connector' : 'Botpress Webhook'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">{r.account_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary dark:text-primary-light font-mono font-bold border border-primary/20">
                        {r.use_case_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <code className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {r.webhook_id_redacted || '••••••••'}
                      </code>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(r.validation_status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleValidate(r.id)}
                        disabled={validatingId === r.id}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-1"
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
