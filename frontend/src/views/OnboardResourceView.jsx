import React, { useState } from 'react';
import { onboardResource } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Bot, ArrowLeft } from 'lucide-react';

export function OnboardResourceView({ onBack, onComplete }) {
  const [provider, setProvider] = useState('botpress');
  const [accountName, setAccountName] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [webhookId, setWebhookId] = useState('');
  const [useCase, setUseCase] = useState('customer_support');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSelectPreset = () => {
    setProvider('botpress');
    showToast('Selected Botpress Connector', 'cyan');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountName || !resourceName || !webhookId) return;

    setSubmitting(true);
    try {
      const payload = {
        account_name: accountName,
        resource_name: resourceName,
        webhook_id: webhookId,
        use_case_type: useCase,
        ai_provider: provider,
      };
      const res = await onboardResource(payload);
      showToast(`Successfully onboarded AI Tool '${res.resource_name}'!`, 'success');
      if (onComplete) onComplete();
      onBack();
    } catch (err) {
      showToast('Onboarding failed: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Monitored Resources</span>
        </button>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-primary/40 shadow-xl space-y-6">
        {/* Title */}
        <div className="border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-brand font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <span>Onboard & Connect AI Tools & Chatbots</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure LLM API endpoints and webhooks to enable sub-15ms guardrail protection.
          </p>
        </div>

        {/* Preset Card */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-primary dark:text-accent-cyan uppercase tracking-wider">
            Target Service Provider Preset
          </div>
          <div
            onClick={handleSelectPreset}
            className="p-4 rounded-2xl border-2 border-primary bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 transition-all cursor-pointer flex items-center gap-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md">
              ⚡
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">Botpress Connector</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Botpress Chatbot API & Webhook Integration</div>
            </div>
            <div className="ml-auto">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                ✅ Active Connector
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account / Workspace Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Botpress Production Workspace"
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resource / Chatbot Name
              </label>
              <input
                type="text"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                placeholder="e.g. Customer Support Assistant"
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Botpress Webhook ID / Endpoint Pattern
              </label>
              <input
                type="text"
                value={webhookId}
                onChange={(e) => setWebhookId(e.target.value)}
                placeholder="e.g. 5e89a2b1-4f1c-490b-928d-318e860bc904"
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Use Case & Security Category
              </label>
              <select
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary"
              >
                <option value="customer_support">Customer Support Bot (High PII Guardrail)</option>
                <option value="internal_copilot">Internal Employee Copilot (Secret Redaction)</option>
                <option value="decision_support">Regulated Decision Support (Strict Injection Blocking)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/25 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Connecting...' : '🚀 Save & Onboard Botpress Resource'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
