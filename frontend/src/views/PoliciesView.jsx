import React, { useState, useEffect } from 'react';
import { fetchPolicy, updatePolicy } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Edit3,
  Trash2,
  Plus,
  Search,
  Zap,
  Lock,
  User,
  Sliders,
  Sparkles,
  ArrowRight,
  Code2,
  Play,
  X,
  Tag,
  AlertTriangle,
  Layers,
  Flame,
  CheckSquare,
  Square,
  Bot,
  Scale,
  Globe,
  FileCheck
} from 'lucide-react';
import { REGULATORY_PRESETS } from './PolicyDetailView';

const PRESET_ICONS = {
  'EU_AI_ACT': Scale,
  'US_HIPAA': Lock,
  'EU_GDPR': Globe,
  'FIN_ADVISORY': FileCheck,
  'BALANCED_COPILOT': Sparkles,
  'UNIFIED_ENTERPRISE_ALL': ShieldCheck,
};

function renderPolicyIcon(policyId, iconProp) {
  if (PRESET_ICONS[policyId]) {
    const Component = PRESET_ICONS[policyId];
    return <Component className="w-4.5 h-4.5" />;
  }
  if (typeof iconProp === 'function' || (typeof iconProp === 'object' && iconProp !== null && !Array.isArray(iconProp) && iconProp.$$typeof)) {
    const Component = iconProp;
    return <Component className="w-4.5 h-4.5" />;
  }
  if (iconProp === 'Lock') return <Lock className="w-4.5 h-4.5" />;
  if (iconProp === 'Scale') return <Scale className="w-4.5 h-4.5" />;
  if (iconProp === 'Globe') return <Globe className="w-4.5 h-4.5" />;
  if (iconProp === 'FileCheck') return <FileCheck className="w-4.5 h-4.5" />;
  if (iconProp === 'Sparkles') return <Sparkles className="w-4.5 h-4.5" />;
  if (iconProp === 'Bot') return <Bot className="w-4.5 h-4.5" />;
  if (iconProp === 'Flame') return <Flame className="w-4.5 h-4.5" />;
  if (iconProp === 'User') return <User className="w-4.5 h-4.5" />;
  if (iconProp === 'Layers') return <Layers className="w-4.5 h-4.5" />;
  if (iconProp === 'Sliders') return <Sliders className="w-4.5 h-4.5" />;
  return <Shield className="w-4.5 h-4.5" />;
}

// Standard 5 System-Defined Regulatory Frameworks from Git
const SYSTEM_DEFINED_POLICIES = REGULATORY_PRESETS.filter(p => !p.isMaster).map(preset => ({
  id: preset.id,
  name: preset.name,
  subtitle: preset.subtitle,
  type: 'system', // Core system-defined policy
  category: preset.badge,
  badge: preset.badge,
  description: preset.description,
  threatCategories: preset.threatCategories,
  icon: preset.id,
  color: preset.color,
  config: preset.config,
  rulesCount: preset.threatCategories?.length || 4,
  enabled: true,
}));

export function PoliciesView({ onViewPolicyDetail }) {
  const [enforcedPresetId, setEnforcedPresetId] = useState(() => {
    return localStorage.getItem('cp_enforced_preset') || 'UNIFIED_ENTERPRISE_ALL';
  });

  // User-defined custom policies state (Clean & empty by default)
  const [userPolicies, setUserPolicies] = useState(() => {
    const saved = localStorage.getItem('cp_user_policies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [filterTab, setFilterTab] = useState('All'); // 'All', 'System defined', 'User defined', 'Active'
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Edit / Create Modal State for User-Defined Policies
  const [editingGroup, setEditingGroup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Modal Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Custom Security');
  const [formDescription, setFormDescription] = useState('');
  const [formRules, setFormRules] = useState([]);
  
  // Rule Add in Modal
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleAction, setNewRuleAction] = useState('MASK');
  const [newRuleRedaction, setNewRuleRedaction] = useState('');
  const [testText, setTestText] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    async function loadPolicy() {
      try {
        const policy = await fetchPolicy('res_demo');
        if (policy && policy.custom_regex_rules && policy.custom_regex_rules.length > 0) {
          // Sync custom regex rules if saved
        }
      } catch (err) {
        console.warn('Failed to load remote policy:', err);
      }
    }
    loadPolicy();
  }, []);

  // Save User Policies to localStorage & sync custom regex rules to backend
  const saveUserPoliciesState = async (updatedUserPolicies) => {
    setUserPolicies(updatedUserPolicies);
    localStorage.setItem('cp_user_policies', JSON.stringify(updatedUserPolicies));

    // Extract all active custom regex rules across user policies
    const allActiveRules = [];
    updatedUserPolicies.forEach(up => {
      if (up.enabled && up.rules) {
        up.rules.forEach(r => {
          if (r.pattern) {
            allActiveRules.push({
              id: r.id || `cr_${Date.now()}`,
              name: r.name || up.name,
              category: up.category || 'Custom Security',
              pattern: r.pattern,
              action: r.action || 'MASK',
              redaction: r.redaction || `[REDACTED_${(r.name || 'CUSTOM').toUpperCase().replace(/\s+/g, '_')}]`,
              enabled: true,
            });
          }
        });
      }
    });

    try {
      await updatePolicy('res_demo', {
        custom_regex_rules: allActiveRules,
      });
    } catch (e) {
      console.warn('Error syncing custom rules to backend:', e);
    }
  };

  // Toggle user policy
  const handleToggleUserPolicy = async (id) => {
    const updated = userPolicies.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
    await saveUserPoliciesState(updated);
    const target = updated.find(p => p.id === id);
    showToast(`Policy '${target.name}' is now ${target.enabled ? 'ACTIVE' : 'DISABLED'}`, target.enabled ? 'success' : 'info');
  };

  // Duplicate policy into a User defined copy
  const handleDuplicatePolicy = async (policy) => {
    const cloned = {
      id: `usr_pol_${Date.now()}`,
      name: `${policy.name} (copy)`,
      subtitle: policy.subtitle || 'User-defined customized policy copy',
      type: 'user',
      category: policy.category || 'Custom Security',
      badge: 'USER DEFINED',
      description: policy.description,
      threatCategories: policy.threatCategories ? [...policy.threatCategories] : ['Custom Security Rules'],
      rulesCount: policy.rules?.length || policy.threatCategories?.length || 1,
      enabled: true,
      icon: Shield,
      rules: policy.rules ? JSON.parse(JSON.stringify(policy.rules)) : [],
    };
    const updated = [...userPolicies, cloned];
    await saveUserPoliciesState(updated);
    showToast(`Duplicated '${policy.name}' as a new User-defined policy!`, 'success');
  };

  // Delete User policy
  const handleDeleteUserPolicy = async (id) => {
    const target = userPolicies.find(p => p.id === id);
    const updated = userPolicies.filter(p => p.id !== id);
    await saveUserPoliciesState(updated);
    showToast(`Deleted custom policy '${target?.name || id}'`, 'info');
  };

  // Open Edit Modal (User defined only)
  const handleOpenEditModal = (policy) => {
    setEditingGroup(policy);
    setIsCreatingNew(false);
    setFormName(policy.name);
    setFormCategory(policy.category || 'Custom Security');
    setFormDescription(policy.description);
    setFormRules(policy.rules ? [...policy.rules] : []);
    setNewRuleName('');
    setNewRulePattern('');
    setNewRuleRedaction('');
    setTestText('');
    setIsModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    setIsCreatingNew(true);
    setFormName('');
    setFormCategory('Custom Security');
    setFormDescription('');
    setFormRules([]);
    setNewRuleName('');
    setNewRulePattern('');
    setNewRuleRedaction('');
    setTestText('');
    setIsModalOpen(true);
  };

  // Add rule inside modal
  const handleAddRuleToForm = (e) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRulePattern.trim()) {
      showToast('Rule Name and Pattern are required', 'error');
      return;
    }
    try {
      new RegExp(newRulePattern);
    } catch (err) {
      showToast('Invalid Regex Syntax: ' + err.message, 'error');
      return;
    }

    const newRuleItem = {
      id: `r_${Date.now()}`,
      name: newRuleName.trim(),
      pattern: newRulePattern.trim(),
      action: newRuleAction,
      redaction: newRuleRedaction.trim() || `[REDACTED_${newRuleName.trim().toUpperCase().replace(/\s+/g, '_')}]`,
    };

    setFormRules([...formRules, newRuleItem]);
    setNewRuleName('');
    setNewRulePattern('');
    setNewRuleRedaction('');
    setTestText('');
    showToast(`Added custom regex rule '${newRuleItem.name}'`, 'success');
  };

  const handleRemoveRuleFromForm = (ruleId) => {
    setFormRules(formRules.filter(r => r.id !== ruleId));
  };

  // Save Modal Form
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Policy Name is required', 'error');
      return;
    }

    let updatedUserPolicies = [];
    if (isCreatingNew) {
      const newPolicy = {
        id: `usr_pol_${Date.now()}`,
        name: formName.trim(),
        subtitle: 'User-defined custom guardrail policy',
        type: 'user',
        category: formCategory,
        badge: 'USER DEFINED',
        description: formDescription.trim() || 'Custom user-defined security guardrail policy.',
        threatCategories: formRules.length > 0 ? formRules.map(r => r.name) : ['Custom Regex Threat Rules'],
        rulesCount: formRules.length || 1,
        enabled: true,
        icon: Shield,
        rules: formRules,
      };
      updatedUserPolicies = [...userPolicies, newPolicy];
      showToast(`Created custom policy '${newPolicy.name}'!`, 'success');
    } else {
      updatedUserPolicies = userPolicies.map(p => {
        if (p.id === editingGroup.id) {
          return {
            ...p,
            name: formName.trim(),
            category: formCategory,
            description: formDescription.trim(),
            threatCategories: formRules.length > 0 ? formRules.map(r => r.name) : p.threatCategories,
            rulesCount: formRules.length,
            rules: formRules,
          };
        }
        return p;
      });
      showToast(`Updated custom policy '${formName.trim()}'!`, 'success');
    }

    await saveUserPoliciesState(updatedUserPolicies);
    setIsModalOpen(false);
  };

  // Enforce Preset Handler (One-Click)
  const handleOneClickEnforce = async (preset) => {
    setLoadingId(preset.id);
    try {
      const allActiveRules = [];
      userPolicies.forEach(up => {
        if (up.enabled && up.rules) {
          up.rules.forEach(r => {
            if (r.pattern) {
              allActiveRules.push({
                id: r.id || `cr_${Date.now()}`,
                name: r.name || up.name,
                category: up.category || 'Custom Security',
                pattern: r.pattern,
                action: r.action || 'MASK',
                redaction: r.redaction || `[REDACTED_${(r.name || 'CUSTOM').toUpperCase().replace(/\s+/g, '_')}]`,
                enabled: true,
              });
            }
          });
        }
      });

      const payload = {
        enforcement_mode: preset.config?.enforcementMode || 'mask',
        pii_redaction_enabled: true,
        pii_sensitivity: preset.config?.piiSensitivity || 'critical',
        prompt_injection_action: preset.config?.promptInjectionAction || 'block',
        hallucination_threshold: preset.config?.hallucinationThreshold || 0.85,
        max_tokens_limit: parseInt(preset.config?.maxTokens || '4096', 10),
        require_human_review_below: preset.config?.requireHumanReviewBelow || 0.85,
        custom_regex_rules: allActiveRules,
      };

      await updatePolicy('res_demo', payload);
      setEnforcedPresetId(preset.id);
      localStorage.setItem('cp_enforced_preset', preset.id);

      showToast(`Activated and enforced ${preset.name}!`, 'success');
    } catch (err) {
      showToast('Failed to enforce policy: ' + err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  // Live tester inside modal
  const getTestEvaluation = () => {
    if (!newRulePattern.trim() || !testText.trim()) return { matches: [], sanitized: testText, valid: true };
    try {
      const rx = new RegExp(newRulePattern, 'gi');
      const matches = Array.from(testText.matchAll(rx)).map(m => m[0]);
      const red = newRuleRedaction.trim() || `[REDACTED_${(newRuleName.trim() || 'CUSTOM').toUpperCase().replace(/\s+/g, '_')}]`;
      const sanitized = testText.replace(rx, red);
      return { matches, sanitized, valid: true };
    } catch (e) {
      return { matches: [], sanitized: testText, valid: false, error: e.message };
    }
  };

  const testEval = getTestEvaluation();

  // Combine system-defined policies + user-defined policies
  const allPolicies = [...SYSTEM_DEFINED_POLICIES, ...userPolicies];

  // Filtering
  const filteredPolicies = allPolicies.filter(p => {
    if (filterTab === 'System defined' && p.type !== 'system') return false;
    if (filterTab === 'User defined' && p.type !== 'user') return false;
    if (filterTab === 'Active' && !p.enabled) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const masterPreset = REGULATORY_PRESETS.find((p) => p.isMaster) || REGULATORY_PRESETS[0];
  const systemCount = SYSTEM_DEFINED_POLICIES.length;
  const userCount = userPolicies.length;
  const activeCount = allPolicies.filter(p => p.enabled).length;

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
            Enforce standard regulatory compliance frameworks and define custom user-defined policy groups with live regex testing.
          </p>
        </div>

        {/* Top Controls: Live Connected Counter & Create Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div className="text-xs font-bold text-slate-800 dark:text-white font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{activeCount} Policies Active</span>
              <span className="text-slate-400 font-sans font-normal text-[11px] ml-1.5">
                ({systemCount} System + {userCount} Custom Connected)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-white text-xs font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Policy Group</span>
          </button>
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
                  {activeCount} Policies Active & Connected
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
                <span>Currently Enforcing ({activeCount})</span>
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
          {userPolicies.filter(p => p.enabled).length > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span className="truncate">+{userPolicies.filter(p => p.enabled).length} Custom User Policies Active</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. FILTER TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: 'All', count: allPolicies.length },
            { label: 'System defined', count: systemCount },
            { label: 'User defined', count: userCount },
            { label: 'Active', count: activeCount },
          ].map(tab => {
            const isSelected = filterTab === tab.label;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setFilterTab(tab.label)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-dark-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold ${
                  isSelected ? 'bg-white/20 dark:bg-slate-900/20 text-current' : 'bg-slate-100 dark:bg-dark-800 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies..."
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary font-medium"
          />
        </div>
      </div>

      {/* 3. POLICY CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPolicies.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-dark-850/50 space-y-3">
            <Shield className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              No policies match your filter.
            </div>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
            >
              + Create Policy Group
            </button>
          </div>
        ) : (
          filteredPolicies.map((policy) => {
            const isSystem = policy.type === 'system';
            const isCurrentlyEnforced = enforcedPresetId === policy.id;
            const isLoading = loadingId === policy.id;

            return (
              <div
                key={policy.id}
                className={`glass-panel p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isCurrentlyEnforced
                    ? 'border-primary dark:border-primary/80 bg-primary/5 dark:bg-primary/10 shadow-md ring-1 ring-primary/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                        {renderPolicyIcon(policy.id, policy.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-brand truncate">
                          {policy.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{policy.subtitle}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* System vs User Tag */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isSystem
                          ? 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}>
                        {isSystem ? 'System defined' : 'User defined'}
                      </span>

                      {/* Regulatory Badge */}
                      {policy.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border font-mono bg-slate-50 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                          {policy.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal min-h-[36px]">
                    {policy.description}
                  </p>

                  {/* Threat Tags Preview */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {policy.threatCategories?.slice(0, 2).map((tc, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        &bull; {tc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  {isSystem ? (
                    // System-defined cards: View Policy Details & Enforce
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (onViewPolicyDetail) onViewPolicyDetail(policy.id);
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
                          onClick={() => handleOneClickEnforce(policy)}
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
                    </>
                  ) : (
                    // User-defined cards: Edit, Duplicate, Delete, and Toggle Checkbox
                    <>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(policy)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicatePolicy(policy)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                          title="Duplicate as User-defined copy"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUserPolicy(policy.id)}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-all"
                          title="Delete custom policy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleUserPolicy(policy.id)}
                        className="text-primary hover:text-primary-hover transition-colors"
                        title={policy.enabled ? 'Click to disable' : 'Click to enable'}
                      >
                        {policy.enabled ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. MODAL FOR CREATING / EDITING USER-DEFINED POLICIES */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-850 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-3xl w-full p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-brand">
                    {isCreatingNew ? 'Create New User-Defined Policy' : `Edit Policy: ${editingGroup?.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Define custom regex rules and test patterns live before saving.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Policy Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Secret-Scan or Competitor Defense"
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="Custom Security">Custom Security</option>
                    <option value="Corporate Secrets">Corporate Secrets</option>
                    <option value="Confidential PII">Confidential PII</option>
                    <option value="Adversarial Injection">Adversarial Injection</option>
                    <option value="Financial & Tax">Financial & Tax</option>
                    <option value="Competitor detection">Competitor detection</option>
                    <option value="Multi-turn detection">Multi-turn detection</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Scan prompts and responses for specific internal project codes and secrets."
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>

              {/* Rules List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Custom Regex Rules ({formRules.length})
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formRules.length === 0 ? (
                    <div className="text-xs text-slate-400 p-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      No custom regex rules added yet. Add one below!
                    </div>
                  ) : (
                    formRules.map(rule => (
                      <div key={rule.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="font-bold text-slate-800 dark:text-white truncate">{rule.name}</div>
                          <div className="font-mono text-[10px] text-primary truncate">{rule.pattern}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-mono">
                            {rule.action || 'MASK'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRuleFromForm(rule.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add New Rule Box */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-dark-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>Add Regex Pattern</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Rule Name (e.g. Project Zeus)"
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      className="w-full bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Regex Pattern (e.g. \bZEUS-[0-9]{4}\b)"
                      value={newRulePattern}
                      onChange={(e) => setNewRulePattern(e.target.value)}
                      className="w-full bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-mono text-xs text-primary dark:text-orange-400 focus:outline-none focus:border-primary font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={newRuleAction}
                    onChange={(e) => setNewRuleAction(e.target.value)}
                    className="w-full bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="MASK">MASK — Auto-redact matched tokens</option>
                    <option value="BLOCK">BLOCK — Hard block prompt immediately</option>
                    <option value="CONFIRM_REQUIRED">CONFIRM_REQUIRED — Human Approval</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Redaction Mask: [REDACTED_ZEUS]"
                    value={newRuleRedaction}
                    onChange={(e) => setNewRuleRedaction(e.target.value)}
                    className="w-full bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                {/* Live Tester */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Tester:</span>
                    {!testText.trim() ? (
                      <span className="text-[10px] text-slate-400">Ready to test</span>
                    ) : testEval.valid ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Valid Regex ({testEval.matches.length} matches)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-500">Invalid Regex</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Type sample text to test matching live..."
                    className="w-full bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-sans"
                  />
                  {testEval.matches.length > 0 && (
                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[11px]">
                      Preview: {testEval.sanitized}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddRuleToForm}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Pattern to Policy</span>
                  </button>
                </div>
              </div>

              {/* Modal Save Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Policy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
