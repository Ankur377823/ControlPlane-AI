import React, { useState, useEffect } from 'react';
import { fetchPolicy, updatePolicy } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Sliders, Save, Shield } from 'lucide-react';

export function PoliciesView() {
  const [enforcementMode, setEnforcementMode] = useState('block');
  const [piiSensitivity, setPiiSensitivity] = useState('high');
  const [promptInjectionAction, setPromptInjectionAction] = useState('block');
  const [maxTokens, setMaxTokens] = useState('2048');
  const [region, setRegion] = useState('GLOBAL_DEFAULT');
  const [hallucinationThreshold, setHallucinationThreshold] = useState(0.65);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadPolicy() {
      try {
        const policy = await fetchPolicy('res_demo');
        if (policy) {
          if (policy.enforcement_mode) setEnforcementMode(policy.enforcement_mode);
          if (policy.pii_sensitivity) setPiiSensitivity(policy.pii_sensitivity);
          if (policy.prompt_injection_action) setPromptInjectionAction(policy.prompt_injection_action);
          if (policy.max_tokens_limit) setMaxTokens(String(policy.max_tokens_limit));
          if (policy.hallucination_threshold !== undefined) {
            setHallucinationThreshold(policy.hallucination_threshold);
          }
        }
      } catch (err) {
        console.warn('Failed to load policy:', err);
      }
    }
    loadPolicy();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        enforcement_mode: enforcementMode,
        pii_redaction_enabled: true,
        pii_sensitivity: piiSensitivity,
        prompt_injection_action: promptInjectionAction,
        hallucination_threshold: parseFloat(hallucinationThreshold),
        max_tokens_limit: parseInt(maxTokens, 10),
        require_human_review_below: 0.75,
      };

      await updatePolicy('res_demo', payload);
      showToast('Policy rules updated and enforced across all active AI guardrails', 'success');
    } catch (err) {
      showToast('Failed to save policy: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary dark:text-primary-light">
          <Sliders className="w-5 h-5" />
          <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Security Policies & Guardrails</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure enforcement modes, PII redaction sensitivity, prompt injection defense, and regulatory compliance frameworks.
        </p>
      </div>

      {/* Configurator Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 className="font-brand font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>Policy & Enforcement Rules Configurator</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time safety guardrail policies, PII redaction sensitivity, and sub-15ms fast-path rules.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Enforcement Action Mode
              </label>
              <select
                value={enforcementMode}
                onChange={(e) => setEnforcementMode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 font-medium shadow-sm"
              >
                <option value="block">BLOCK — Halt prompt submission immediately on threat</option>
                <option value="mask">MASK — Auto-redact PII and secrets before sending to bot</option>
                <option value="monitor">MONITOR — Audit and log to Risk Findings without blocking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                PII Redaction Sensitivity Level
              </label>
              <select
                value={piiSensitivity}
                onChange={(e) => setPiiSensitivity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 font-medium shadow-sm"
              >
                <option value="high">HIGH — Redact Emails, Phones, Credit Cards, Dates, SSNs</option>
                <option value="medium">MEDIUM — Redact Emails and Credit Cards only</option>
                <option value="low">LOW — Flag PII without automatic redaction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Prompt Injection Action Mode
              </label>
              <select
                value={promptInjectionAction}
                onChange={(e) => setPromptInjectionAction(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 font-medium shadow-sm"
              >
                <option value="block">BLOCK — Immediately terminate adversarial prompt</option>
                <option value="flag">FLAG — Mark risk score and notify security center</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Tokens Limit per Request
              </label>
              <select
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 font-medium shadow-sm"
              >
                <option value="2048">2,048 Tokens (Standard Support Bot)</option>
                <option value="4096">4,096 Tokens (Copilot Agent)</option>
                <option value="8192">8,192 Tokens (Extended Context)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Geographic Regulatory Compliance Framework
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 font-medium shadow-sm"
              >
                <option value="GLOBAL_DEFAULT">GLOBAL_DEFAULT — Baseline Safety & Privacy Rules</option>
                <option value="EU_GDPR">EU_GDPR — European Union GDPR Strict Data Protection</option>
                <option value="US_HIPAA">US_HIPAA — Health Insurance Portability & Privacy (HIPAA)</option>
              </select>
            </div>
          </div>

          {/* Hallucination Slider */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-dark-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hallucination Factuality Threshold (0.00 to 1.00)
              </label>
              <span className="text-sm font-bold text-primary font-mono">{hallucinationThreshold}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={hallucinationThreshold}
              onChange={(e) => setHallucinationThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-dark-800 rounded-sm appearance-none cursor-pointer accent-primary"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Responses with factuality scores below this threshold will trigger secondary RAG grounding verification or HITL review.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/25 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save & Enforce Policy Rules</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
