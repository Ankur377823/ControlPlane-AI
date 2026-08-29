import React, { useState } from 'react';
import { runCheck } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Bot, Play, Shield, Activity } from 'lucide-react';

export function AgentRuntimeView() {
  const [prompt, setPrompt] = useState('');
  const [toolAction, setToolAction] = useState('delete_file');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { showToast } = useToast();

  const handlePreset = (type) => {
    if (type === 'delete_file') {
      setPrompt('Find suspicious email and delete it permanently');
      setToolAction('delete_file');
    } else if (type === 'search_web') {
      setPrompt('Search current market trends for generative AI compliance tools');
      setToolAction('search_web');
    } else if (type === 'transfer_money') {
      setPrompt('Transfer $50,000 from company treasury account to overseas vendor');
      setToolAction('transfer_money');
    } else if (type === 'send_email') {
      setPrompt('Send broadcast newsletter email to 500 customers with product update');
      setToolAction('send_email');
    }
    showToast('Applied sample agent preset', 'cyan');
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    try {
      let toolCall = null;
      if (toolAction && toolAction !== 'none') {
        toolCall = { name: toolAction, parameters: { intent: prompt } };
      }
      const res = await runCheck('res_demo', prompt, toolCall);
      setResult(res);
      showToast(`Agent Action Evaluated: ${res.action}`, 'cyan');
    } catch (err) {
      showToast('Sandbox evaluation failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const actionColor = (act) => {
    return 'text-orange-700 dark:text-orange-300 border-orange-500/30 bg-orange-500/10';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary dark:text-primary-light">
          <Bot className="w-5 h-5" />
          <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Secure AI Agent Runtime</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure and test real-time tool execution policies, Action Risk Tiers, and Human-in-the-Loop approvals for autonomous AI agents.
        </p>
      </div>

      {/* Sandbox Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 className="font-brand font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>AI Agent Action Risk & Tool Call Interception Sandbox</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate multi-step compounding risk and test Action Risk Tiers (LOW, MEDIUM, HIGH, CRITICAL) for agent executions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-2">Sample Presets:</span>
          <button
            type="button"
            onClick={() => handlePreset('delete_file')}
            className="px-3 py-2 rounded-md bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30 text-xs font-semibold transition-colors shadow-sm"
          >
            Preset 1: Delete Email (HIGH Risk)
          </button>
          <button
            type="button"
            onClick={() => handlePreset('search_web')}
            className="px-3 py-2 rounded-md bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30 text-xs font-semibold transition-colors shadow-sm"
          >
            Preset 2: Web Search (LOW Risk)
          </button>
          <button
            type="button"
            onClick={() => handlePreset('transfer_money')}
            className="px-3 py-2 rounded-md bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30 text-xs font-semibold transition-colors shadow-sm"
          >
            Preset 3: Wire Transfer (CRITICAL)
          </button>
          <button
            type="button"
            onClick={() => handlePreset('send_email')}
            className="px-3 py-2 rounded-md bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30 text-xs font-semibold transition-colors shadow-sm"
          >
            Preset 4: Broadcast Email (MEDIUM)
          </button>
        </div>

        <form onSubmit={handleEvaluate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agent Prompt / User Instruction
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Find suspicious email and delete it permanently (or click a sample preset above)..."
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Simulated Agent Tool Call Action
              </label>
              <select
                value={toolAction}
                onChange={(e) => setToolAction(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary shadow-sm"
              >
                <option value="search_web">search_web (LOW Risk -&gt; ALLOW)</option>
                <option value="send_email">send_email (MEDIUM Risk -&gt; MONITOR)</option>
                <option value="delete_file">delete_file / delete_email (HIGH Risk -&gt; CONFIRM_REQUIRED)</option>
                <option value="transfer_money">transfer_money (CRITICAL Risk -&gt; BLOCK)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-[#e4e4e7] active:bg-[#d4d4d8] text-black text-xs font-bold font-mono tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
              ) : (
                <Play className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              )}
              <span>Evaluate Agent Tool Call Interception</span>
            </button>
          </div>
        </form>

        {/* Output Box */}
        {result && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-900/80 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">Enforcement Action:</span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${actionColor(result.action)}`}>
                  {result.action}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">Action Risk Tier:</span>
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-bold bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/30"
                >
                  {result.action_risk_tier || 'LOW'}
                </span>
              </div>

              <span className="text-xs text-primary dark:text-accent-cyan font-mono font-bold">
                {result.latency_ms} ms
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-primary dark:text-primary-light mb-1">
                Sanitized Prompt Passed to LLM:
              </div>
              <pre className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap">
                {result.sanitized_prompt || '—'}
              </pre>
            </div>

            <div>
              <div className="text-xs font-bold text-orange-700 dark:text-orange-300 mb-1">
                Triggered Security Rules & Findings:
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                {result.triggered_rules && result.triggered_rules.length > 0 ? (
                  result.triggered_rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-orange-500">•</span>
                      <span>{rule}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-orange-700 dark:text-orange-300 font-medium">
                    None (Clean Query passed all guardrails)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
