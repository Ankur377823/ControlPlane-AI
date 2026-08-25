import React, { useState } from 'react';
import { runCheck } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Bot, Play } from 'lucide-react';

export function AgentRuntimeView() {
  const [prompt, setPrompt] = useState('Find suspicious email and delete it permanently');
  const [toolAction, setToolAction] = useState('delete_file');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { showToast } = useToast();

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
    switch (act) {
      case 'BLOCK':
        return 'text-rose-700 dark:text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'CONFIRM_REQUIRED':
        return 'text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10';
      default:
        return 'text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    }
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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6">
        <div className="border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-brand font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span>⚡</span>
            <span>AI Agent Action Risk & Tool Call Interception Sandbox</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate multi-step compounding risk and test Action Risk Tiers (LOW, MEDIUM, HIGH, CRITICAL) for agent executions.
          </p>
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
                placeholder="Enter prompt given to agent..."
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Simulated Agent Tool Call Action
              </label>
              <select
                value={toolAction}
                onChange={(e) => setToolAction(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary"
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
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/25 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>Evaluate Agent Tool Call Interception</span>
            </button>
          </div>
        </form>

        {/* Output Box */}
        {result && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-900/80 border border-slate-200 dark:border-white/10 space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">Enforcement Action:</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${actionColor(result.action)}`}>
                  {result.action}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">Action Risk Tier:</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    result.action_risk_tier === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                      : result.action_risk_tier === 'HIGH'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {result.action_risk_tier || 'LOW'}
                </span>
              </div>

              <span className="text-xs text-primary dark:text-accent-cyan font-mono font-bold">
                ⚡ {result.latency_ms} ms
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-primary dark:text-primary-light mb-1">
                Sanitized Prompt Passed to LLM:
              </div>
              <pre className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 text-xs font-mono text-slate-900 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap">
                {result.sanitized_prompt || '—'}
              </pre>
            </div>

            <div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                Triggered Security Rules & Findings:
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                {result.triggered_rules && result.triggered_rules.length > 0 ? (
                  result.triggered_rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-amber-500">•</span>
                      <span>{rule}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
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
