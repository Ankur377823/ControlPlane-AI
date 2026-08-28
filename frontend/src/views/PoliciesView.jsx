import React, { useState, useEffect } from 'react';
import { fetchPolicy, updatePolicy } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Sliders, Save, Shield, CheckCircle2, Scale, Sparkles, ArrowRight, ChevronDown, ChevronUp, ShieldCheck, Zap } from 'lucide-react';
import { REGULATORY_PRESETS } from './PolicyDetailView';

export function PoliciesView({ onViewPolicyDetail }) {
  const [enforcedPresetId, setEnforcedPresetId] = useState(() => {
    return localStorage.getItem('cp_enforced_preset') || 'UNIFIED_ENTERPRISE_ALL';
  });

  // State for optional advanced tuning form (collapsed by default)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [enforcementMode, setEnforcementMode] = useState('block');
  const [piiSensitivity, setPiiSensitivity] = useState('critical');
  const [promptInjectionAction, setPromptInjectionAction] = useState('block');
  const [maxTokens, setMaxTokens] = useState('4096');
  const [region, setRegion] = useState('GLOBAL_UNIFIED_ALL');
  const [hallucinationThreshold, setHallucinationThreshold] = useState(0.85);
  const [humanReviewThreshold, setHumanReviewThreshold] = useState(0.85);

  const [loadingId, setLoadingId] = useState(null);
  const [savingManual, setSavingManual] = useState(false);
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
          if (policy.require_human_review_below !== undefined) {
            setHumanReviewThreshold(policy.require_human_review_below);
          }
        }
      } catch (err) {
        console.warn('Failed to load policy:', err);
      }
    }
    loadPolicy();
  }, []);

  // One-click activation: applies all preset parameters and saves automatically
  const handleOneClickEnforce = async (preset) => {
    setLoadingId(preset.id);
    try {
      const payload = {
        enforcement_mode: preset.config.enforcementMode,
        pii_redaction_enabled: true,
        pii_sensitivity: preset.config.piiSensitivity,
        prompt_injection_action: preset.config.promptInjectionAction,
        hallucination_threshold: preset.config.hallucinationThreshold,
        max_tokens_limit: parseInt(preset.config.maxTokens, 10),
        require_human_review_below: preset.config.requireHumanReviewBelow,
      };

      await updatePolicy('res_demo', payload);
      setEnforcedPresetId(preset.id);
      localStorage.setItem('cp_enforced_preset', preset.id);

      // Sync form fields
      setEnforcementMode(preset.config.enforcementMode);
      setPiiSensitivity(preset.config.piiSensitivity);
      setPromptInjectionAction(preset.config.promptInjectionAction);
      setHallucinationThreshold(preset.config.hallucinationThreshold);
      setMaxTokens(preset.config.maxTokens);
      setRegion(preset.config.region);
      setHumanReviewThreshold(preset.config.requireHumanReviewBelow);

      showToast(`Activated and enforced ${preset.name} across all AI guardrails!`, 'success');
    } catch (err) {
      showToast('Failed to enforce policy: ' + err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleManualSave = async (e) => {
    e.preventDefault();
    setSavingManual(true);
    try {
      const payload = {
        enforcement_mode: enforcementMode,
        pii_redaction_enabled: true,
        pii_sensitivity: piiSensitivity,
        prompt_injection_action: promptInjectionAction,
        hallucination_threshold: parseFloat(hallucinationThreshold),
        max_tokens_limit: parseInt(maxTokens, 10),
        require_human_review_below: parseFloat(humanReviewThreshold),
      };

      await updatePolicy('res_demo', payload);
      showToast('Custom policy rules updated and enforced across all active AI guardrails', 'success');
    } catch (err) {
      showToast('Failed to save policy: ' + err.message, 'error');
    } finally {
      setSavingManual(false);
    }
  };

  const masterPreset = REGULATORY_PRESETS.find((p) => p.isMaster) || REGULATORY_PRESETS[0];
  const standardPresets = REGULATORY_PRESETS.filter((p) => !p.isMaster);
  const activeEnforcedPreset = REGULATORY_PRESETS.find((p) => p.id === enforcedPresetId) || REGULATORY_PRESETS[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary dark:text-primary-light">
            <Sliders className="w-5 h-5" />
            <h1 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Security Policies & Guardrails</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Apply the unified All-in-One Enterprise Shield or choose a dedicated regulatory standard with one click.
          </p>
        </div>

        {/* Live Enforced Status Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>CURRENTLY ENFORCED: <strong>{activeEnforcedPreset.name}</strong></span>
        </div>
      </div>

      {/* FEATURED: ALL-IN-ONE MASTER SHIELD BANNER */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent shadow-lg space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                  {masterPreset.name}
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider shadow-sm">
                  ★ RECOMMENDED ALL-IN-ONE
                </span>
                {enforcedPresetId === masterPreset.id && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                    ✓ ACTIVE IN PRODUCTION
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {masterPreset.description}
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
            {enforcedPresetId === masterPreset.id ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All-in-One Enforced</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={loadingId === masterPreset.id}
                onClick={() => handleOneClickEnforce(masterPreset)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2"
              >
                {loadingId === masterPreset.id ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>Apply All-in-One Master Shield</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (onViewPolicyDetail) onViewPolicyDetail(masterPreset.id);
              }}
              className="text-[11px] font-bold text-primary dark:text-primary-light hover:underline flex items-center gap-1 mt-1"
            >
              <span>Inspect All-in-One Coverage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Threat tags included in all-in-one */}
        <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Included Defenses:</span>
          {masterPreset.threatCategories.map((tc, idx) => (
            <span key={idx} className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white dark:bg-dark-850 border border-emerald-500/20 text-slate-700 dark:text-slate-300 font-semibold">
              ✓ {tc}
            </span>
          ))}
        </div>
      </div>

      {/* Individual Framework Presets Grid */}
      <div className="glass-panel p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <h2 className="font-brand font-bold text-base text-slate-900 dark:text-white">
              Or Choose Individual Framework Profiles
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Click "Activate & Enforce" to switch to a specific regional policy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {standardPresets.map((preset) => {
            const Icon = preset.icon;
            const isCurrentlyEnforced = enforcedPresetId === preset.id;
            const isLoading = loadingId === preset.id;

            return (
              <div
                key={preset.id}
                className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-4 relative ${
                  isCurrentlyEnforced
                    ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-md ring-1 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Active Ribbon */}
                {isCurrentlyEnforced && (
                  <div className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Active in Production</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{preset.subtitle}</div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${preset.color}`}>
                      {preset.badge}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                {/* Threat Tags Preview */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {preset.threatCategories.slice(0, 2).map((tc, idx) => (
                    <span key={idx} className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      • {tc}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onViewPolicyDetail) onViewPolicyDetail(preset.id);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary dark:text-primary-light hover:underline"
                  >
                    <span>View Policy Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {isCurrentlyEnforced ? (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Enforcing</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleOneClickEnforce(preset)}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      <span>Activate & Enforce</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Collapsible Advanced Custom Tuning Drawer */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Advanced Custom Thresholds (Optional Manual Overrides)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Only needed if you want to override standard presets with bespoke token limits or custom thresholds.
              </div>
            </div>
          </div>
          <div className="p-1 rounded bg-slate-100 dark:bg-dark-800 text-slate-500">
            {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isAdvancedOpen && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-6 animate-fade-in">
            <form onSubmit={handleManualSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Enforcement Action Mode
                  </label>
                  <select
                    value={enforcementMode}
                    onChange={(e) => setEnforcementMode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="block">BLOCK — Halt prompt submission immediately on threat</option>
                    <option value="mask">MASK — Auto-redact PII and secrets before sending to bot</option>
                    <option value="monitor">MONITOR — Audit and log to Risk Findings without blocking</option>
                    <option value="confirm_required">CONFIRM_REQUIRED — Require explicit Human Approval (HITL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    PII Redaction Sensitivity Level
                  </label>
                  <select
                    value={piiSensitivity}
                    onChange={(e) => setPiiSensitivity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="critical">CRITICAL — Redact All PII, Keys, Tokens, DB Strings, SSNs, PHI</option>
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
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
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
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="2048">2,048 Tokens (Standard Support Bot)</option>
                    <option value="4096">4,096 Tokens (Copilot Agent)</option>
                    <option value="8192">8,192 Tokens (Extended Context)</option>
                  </select>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Grounding & Factuality Threshold
                    </label>
                    <span className="text-sm font-bold text-primary font-mono">{hallucinationThreshold.toFixed(2)}</span>
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
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      HITL Review Threshold
                    </label>
                    <span className="text-sm font-bold text-amber-500 font-mono">{humanReviewThreshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={humanReviewThreshold}
                    onChange={(e) => setHumanReviewThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-dark-800 rounded-sm appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingManual}
                  className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/25 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {savingManual ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Custom Override Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
