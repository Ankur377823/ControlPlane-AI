import React, { useState, useEffect } from 'react';
import { fetchPolicy, updatePolicy } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Sliders,
  Save,
  Shield,
  CheckCircle2,
  Scale,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Code2,
  Play,
  HelpCircle,
  X,
  AlertCircle,
  Tag
} from 'lucide-react';
import { REGULATORY_PRESETS } from './PolicyDetailView';

const DEFAULT_CUSTOM_RULES = [
  {
    id: 'cr_proj_apollo',
    name: 'Internal Project Codename',
    category: 'Corporate Secrets',
    pattern: '\\b(?:Project\\s+Apollo|Titan\\s+Blueprint)\\b',
    action: 'MASK',
    redaction: '[REDACTED_PROJECT_CODENAME]',
    enabled: true,
    description: 'Intercepts unreleased internal project codenames across all prompts and model outputs.',
  },
  {
    id: 'cr_custom_emp_id',
    name: 'Internal Employee Badge ID',
    category: 'Confidential PII',
    pattern: '\\bEMP-[0-9]{5,6}\\b',
    action: 'MASK',
    redaction: '[REDACTED_EMP_ID]',
    enabled: true,
    description: 'Masks corporate internal employee badge numbers (e.g. EMP-99482).',
  },
  {
    id: 'cr_competitor_exfil',
    name: 'Proprietary Core Vault Exfil',
    category: 'Adversarial Injection',
    pattern: '\\b(?:dump_core_vault|extract_raw_master_keys)\\b',
    action: 'BLOCK',
    redaction: '[BLOCKED_EXFIL_PAYLOAD]',
    enabled: true,
    description: 'Hard-blocks prompt attacks attempting to call unauthorized internal debug routines.',
  },
  {
    id: 'cr_cust_internal_sku',
    name: 'Confidential Cost Margin SKU',
    category: 'Financial & Tax',
    pattern: '\\bSKU-[A-Z]{2}-[0-9]{4}-COST\\b',
    action: 'MASK',
    redaction: '[REDACTED_INTERNAL_COST_SKU]',
    enabled: true,
    description: 'Prevents leakage of wholesale margin calculations and internal pricing structures.',
  },
];

const CATEGORIES = [
  'All',
  'Corporate Secrets',
  'Confidential PII',
  'Adversarial Injection',
  'Financial & Tax',
  'Safety / Harm',
  'Custom Security'
];

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

  // Custom Regex Rules State
  const [customRules, setCustomRules] = useState(() => {
    const saved = localStorage.getItem('cp_custom_rules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_CUSTOM_RULES;
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Rule Form & Live Tester State
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Corporate Secrets');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleAction, setNewRuleAction] = useState('MASK');
  const [newRuleRedaction, setNewRuleRedaction] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [testText, setTestText] = useState('Contact our internal lead on Project Apollo regarding badge EMP-88219.');

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
          if (policy.custom_regex_rules && policy.custom_regex_rules.length > 0) {
            setCustomRules(policy.custom_regex_rules);
            localStorage.setItem('cp_custom_rules', JSON.stringify(policy.custom_regex_rules));
          }
        }
      } catch (err) {
        console.warn('Failed to load policy:', err);
      }
    }
    loadPolicy();
  }, []);

  // Save custom rules whenever modified
  const updateCustomRulesState = async (updated) => {
    setCustomRules(updated);
    localStorage.setItem('cp_custom_rules', JSON.stringify(updated));
    try {
      await updatePolicy('res_demo', {
        custom_regex_rules: updated,
      });
    } catch (e) {
      console.warn('Could not sync custom rules to server:', e);
    }
  };

  const handleToggleRule = (id) => {
    const updated = customRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    updateCustomRulesState(updated);
    showToast('Updated custom rule status', 'info');
  };

  const handleDeleteRule = (id) => {
    const updated = customRules.filter(r => r.id !== id);
    updateCustomRulesState(updated);
    showToast('Custom rule removed', 'info');
  };

  const handleToggleAll = (enableAll) => {
    const updated = customRules.map(r => ({ ...r, enabled: enableAll }));
    updateCustomRulesState(updated);
    showToast(enableAll ? 'Applied and enabled ALL custom regex rules!' : 'Disabled all custom regex rules.', 'success');
  };

  // Add new custom rule handler
  const handleCreateRule = (e) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRulePattern.trim()) {
      showToast('Rule Name and Regex Pattern are required', 'error');
      return;
    }

    try {
      new RegExp(newRulePattern);
    } catch (err) {
      showToast('Invalid Regex Syntax: ' + err.message, 'error');
      return;
    }

    const createdRule = {
      id: 'cr_' + Date.now(),
      name: newRuleName.trim(),
      category: newRuleCategory,
      pattern: newRulePattern.trim(),
      action: newRuleAction,
      redaction: newRuleRedaction.trim() || `[REDACTED_${newRuleName.trim().toUpperCase().replace(/\s+/g, '_')}]`,
      description: newRuleDesc.trim() || 'Custom user-defined security and policy pattern.',
      enabled: true,
    };

    const updated = [createdRule, ...customRules];
    updateCustomRulesState(updated);
    setIsAddModalOpen(false);

    // Reset Form
    setNewRuleName('');
    setNewRulePattern('');
    setNewRuleRedaction('');
    setNewRuleDesc('');
    showToast(`Added custom rule '${createdRule.name}' and synced to active guardrail policy!`, 'success');
  };

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
        custom_regex_rules: customRules,
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

      showToast(`Activated and enforced ${preset.name} with ${customRules.filter(r => r.enabled).length} custom regex rules!`, 'success');
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
        custom_regex_rules: customRules,
      };

      await updatePolicy('res_demo', payload);
      showToast('Custom policy rules and regex patterns saved and enforced across all active AI guardrails', 'success');
    } catch (err) {
      showToast('Failed to save policy: ' + err.message, 'error');
    } finally {
      setSavingManual(false);
    }
  };

  // Helper for live tester in modal
  const getTestEvaluation = () => {
    if (!newRulePattern.trim() || !testText) return { matches: [], sanitized: testText, valid: true };
    try {
      const rx = new RegExp(newRulePattern, 'gi');
      const matches = Array.from(testText.matchAll(rx)).map(m => m[0]);
      const redaction = newRuleRedaction.trim() || `[REDACTED_${(newRuleName.trim() || 'CUSTOM').toUpperCase().replace(/\s+/g, '_')}]`;
      const sanitized = testText.replace(rx, redaction);
      return { matches, sanitized, valid: true };
    } catch (e) {
      return { matches: [], sanitized: testText, valid: false, error: e.message };
    }
  };

  const testEval = getTestEvaluation();
  const filteredRules = selectedCategory === 'All'
    ? customRules
    : customRules.filter(r => r.category === selectedCategory);

  const allActive = customRules.length > 0 && customRules.every(r => r.enabled);
  const activeCount = customRules.filter(r => r.enabled).length;

  const masterPreset = REGULATORY_PRESETS.find((p) => p.isMaster) || REGULATORY_PRESETS[0];
  const standardPresets = REGULATORY_PRESETS.filter((p) => !p.isMaster);
  const activeEnforcedPreset = REGULATORY_PRESETS.find((p) => p.id === enforcedPresetId) || REGULATORY_PRESETS[0];

  return (
    <div className="max-w-6xl mx-auto space-y-7 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-brand text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Security Guardrail Policies
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enforce comprehensive regulatory standards, custom regex patterns, and deterministic security boundaries across all connected AI models.
          </p>
        </div>

        {/* Current Active Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Policy</div>
            <div className="text-xs font-bold text-slate-800 dark:text-white font-brand">
              {activeEnforcedPreset.name}
            </div>
          </div>
        </div>
      </div>

      {/* 1. MASTER SHIELD (Featured Top Card) */}
      <div className="glass-panel relative rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 sm:p-7 shadow-lg shadow-emerald-500/5 space-y-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 flex-shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-500 text-white uppercase tracking-wider">
                  Recommended Master Shield
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                  Multi-Regulation Unified Guard
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-brand">
                {masterPreset.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                {masterPreset.description}
              </p>
            </div>
          </div>

          {/* Enforce Master Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onViewPolicyDetail) onViewPolicyDetail(masterPreset.id);
              }}
              className="px-4 py-2.5 rounded-xl border border-emerald-600/30 bg-white/80 dark:bg-dark-900/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>View Policy Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {enforcedPresetId === masterPreset.id ? (
              <div className="px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Currently Enforcing</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={loadingId === masterPreset.id}
                onClick={() => handleOneClickEnforce(masterPreset)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loadingId === masterPreset.id ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Activate Master Shield</span>
              </button>
            )}
          </div>
        </div>

        {/* Master Threat Vectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-emerald-500/20">
          {masterPreset.threatCategories.map((tc, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-dark-900/60 border border-emerald-500/15 text-[11px] font-medium text-slate-700 dark:text-slate-300 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span className="truncate">{tc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. STANDARD REGULATORY PRESET CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-brand">
            Individual Regulatory Compliance Frameworks
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {standardPresets.length} Specific Policies Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {standardPresets.map((preset) => {
            const Icon = preset.icon;
            const isCurrentlyEnforced = enforcedPresetId === preset.id;
            const isLoading = loadingId === preset.id;

            return (
              <div
                key={preset.id}
                className={`glass-panel p-5 rounded-2xl border transition-all duration-200 space-y-4 flex flex-col justify-between ${
                  isCurrentlyEnforced
                    ? 'border-primary dark:border-primary/80 bg-primary/5 dark:bg-primary/10 shadow-md ring-1 ring-primary/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-brand truncate">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{preset.subtitle}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border whitespace-nowrap flex-shrink-0 ${preset.color}`}>
                      {preset.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {preset.description}
                  </p>
                </div>

                {/* Threat Tags Preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {preset.threatCategories.slice(0, 2).map((tc, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      &bull; {tc}
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover dark:text-orange-400 hover:underline"
                  >
                    <span>View Policy Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {isCurrentlyEnforced ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Enforcing</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleOneClickEnforce(preset)}
                      className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
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

      {/* 3. CUSTOM REGEX PATTERNS & POLICY GROUPS (User Customization Center) */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-primary flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-brand">
                Custom Regex Rules & Policy Groups
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add bespoke enterprise regex rules (custom project codenames, custom employee IDs, confidential SKUs) and include them across all enforcement presets.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleToggleAll(!allActive)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {allActive ? <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> : <Square className="w-3.5 h-3.5" />}
              <span>{allActive ? 'Disable All Custom' : 'Apply / Enable All'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Regex Rule</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => {
            const count = cat === 'All' ? customRules.length : customRules.filter(r => r.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-700'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-white/20 dark:bg-slate-900/20 text-current' : 'bg-slate-200 dark:bg-dark-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredRules.length === 0 ? (
            <div className="md:col-span-2 text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
              No custom regex rules found in '{selectedCategory}'. Click <strong>"Add Custom Regex Rule"</strong> above to create one.
            </div>
          ) : (
            filteredRules.map(rule => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  rule.enabled
                    ? 'bg-slate-50/60 dark:bg-dark-900/60 border-slate-300 dark:border-slate-700/80 shadow-sm'
                    : 'bg-slate-50/20 dark:bg-dark-900/20 border-slate-200 dark:border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleRule(rule.id)}
                      className="mt-0.5 text-primary hover:text-primary-hover transition-colors"
                      title={rule.enabled ? 'Click to disable' : 'Click to enable'}
                    >
                      {rule.enabled ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-slate-400" />}
                    </button>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white font-brand">
                        {rule.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {rule.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border font-mono ${
                      rule.action === 'BLOCK'
                        ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                    }`}>
                      {rule.action}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pattern & Redaction Token Badge */}
                <div className="p-2 rounded-lg bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800/80 space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">Regex Pattern:</span>
                    <span className="text-primary font-bold">{rule.pattern}</span>
                  </div>
                  {rule.action === 'MASK' && (
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">Redaction Mask:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{rule.redaction}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. OPTIONAL COLLAPSIBLE ADVANCED CUSTOM TUNING DRAWER */}
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

      {/* 5. ADD CUSTOM REGEX RULE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-850 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-2xl w-full p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-brand">
                    Create Custom Regex Security Rule
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Define custom regex patterns and test them live in real-time.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Internal Project Zeus"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Policy Group / Category
                  </label>
                  <select
                    value={newRuleCategory}
                    onChange={(e) => setNewRuleCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Regex Pattern *</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">e.g. \bPROJ-[0-9]&#123;4&#125;\b</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="\b(?:Project\s+Zeus|Titan\s+Blueprint)\b"
                  value={newRulePattern}
                  onChange={(e) => setNewRulePattern(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs text-primary dark:text-orange-400 focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enforcement Action
                  </label>
                  <select
                    value={newRuleAction}
                    onChange={(e) => setNewRuleAction(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="MASK">MASK — Auto-redact matched tokens</option>
                    <option value="BLOCK">BLOCK — Hard block prompt immediately</option>
                    <option value="CONFIRM_REQUIRED">CONFIRM_REQUIRED — Trigger Human Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Redaction Placeholder (for MASK action)
                  </label>
                  <input
                    type="text"
                    placeholder="[REDACTED_CUSTOM_TOKEN]"
                    value={newRuleRedaction}
                    onChange={(e) => setNewRuleRedaction(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Context (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Intercepts confidential roadmap codenames before sending to external LLMs."
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>

              {/* LIVE REGEX TESTER WIDGET */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                    <Play className="w-3.5 h-3.5 text-primary" />
                    <span>Interactive Live Regex Tester</span>
                  </div>
                  {testEval.valid ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Valid Regex ({testEval.matches.length} matches)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      Invalid Regex Syntax
                    </span>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Type sample prompt here to test matching..."
                  className="w-full bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary font-sans"
                />

                {testEval.matches.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Live Output Preview ({newRuleAction}):
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono text-[11px]">
                      {testEval.sanitized}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save & Apply Rule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
