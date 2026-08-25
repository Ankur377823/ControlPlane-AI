import React, { useState, useEffect } from 'react';
import { fetchFindings, fetchFindingById, submitReviewDecision, submitFindingFeedback } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShieldAlert, ArrowLeft, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';

export function EventOverviewView({ eventId, sessionId, onBack }) {
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      let ev = null;
      if (eventId) {
        try {
          ev = await fetchFindingById(eventId);
        } catch (e) {}
      }

      if (!ev) {
        const all = await fetchFindings({ limit: 100 });
        if (eventId) {
          ev = all.find((f) => f.id === eventId);
        } else if (sessionId) {
          ev = all.find((f) => f.session_id === sessionId);
        }
        if (!ev && all.length > 0) ev = all[0];
      }

      setActiveEvent(ev);
    } catch (err) {
      showToast('Error loading event telemetry: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId, sessionId]);

  const handleReviewAction = async (decision) => {
    if (!activeEvent) return;
    try {
      await submitReviewDecision(activeEvent.id, decision, reviewerNotes);
      showToast(`Review decision recorded: ${decision.toUpperCase()}`, 'success');
      loadData();
    } catch (err) {
      showToast('Action failed: ' + err.message, 'error');
    }
  };

  const handleFeedback = async (type) => {
    if (!activeEvent) return;
    try {
      await submitFindingFeedback(activeEvent.id, type, reviewerNotes);
      showToast(`Feedback logged: ${type}`, 'cyan');
    } catch (err) {
      showToast('Feedback error: ' + err.message, 'error');
    }
  };

  const sevColor = (sev) => {
    switch ((sev || '').toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25';
      case 'MEDIUM':
        return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25';
      default:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25';
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center text-slate-500 dark:text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
        <p className="text-sm font-medium">Loading security event telemetry and session registries...</p>
      </div>
    );
  }

  if (!activeEvent) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Security Events or Session Telemetry Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Select a risk finding from the findings grid to inspect.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/20"
        >
          ← Back to Risk Findings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Findings Grid</span>
        </button>

        <button
          onClick={loadData}
          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-300 rounded-xl transition-colors text-xs inline-flex items-center gap-1.5 font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Banner */}
      <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-primary space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${sevColor(activeEvent.severity)}`}>
              {activeEvent.severity || 'HIGH'}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light font-mono font-bold">
              🤖 {activeEvent.source || 'Endpoint AI Bot'}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Session: <code className="text-primary dark:text-accent-cyan font-bold">{activeEvent.session_id || 'sess_8f3a92b1'}</code>
          </span>
        </div>

        <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">{activeEvent.finding_title}</h2>
        <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-4 pt-1">
          <span>
            Risk Code: <strong className="text-primary dark:text-accent-cyan font-mono">{activeEvent.finding_code}</strong>
          </span>
          <span>
            Target Resource: <strong className="text-slate-900 dark:text-white">{activeEvent.resource_name || 'Global Guardrail'}</strong>
          </span>
          <span>
            Context Category: <strong className="text-amber-700 dark:text-amber-400">{activeEvent.context}</strong>
          </span>
        </div>
      </div>

      {/* Raw vs Sanitized Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-3xl space-y-2">
          <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚠️</span>
            <span>Intercepted Raw User Prompt</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap min-h-[140px]">
            {activeEvent.prompt_text || activeEvent.evidence || 'No prompt content logged'}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl space-y-2">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Sanitized Guardrail Prompt Passed to LLM</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-white/10 text-xs font-mono text-emerald-800 dark:text-emerald-300 whitespace-pre-wrap min-h-[140px]">
            {activeEvent.masked_text || activeEvent.sanitized_prompt || '[Sanitized / Redacted]'}
          </div>
        </div>
      </div>

      {/* HITL Review Queue Controls */}
      <div className="glass-panel p-6 rounded-3xl border border-primary/25 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
            Human-in-the-Loop (HITL) Reviewer Workspace
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Feedback auto-tunes policy thresholds</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            placeholder="Add reviewer notes or reason for approval / override..."
            className="flex-1 bg-white dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleFeedback('CONFIRM_FP')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5"
              title="Flag as False Positive"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>False Positive</span>
            </button>
            <button
              onClick={() => handleFeedback('CONFIRM_TP')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5"
              title="Confirm True Positive"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>True Threat</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          <button
            onClick={() => handleReviewAction('approved')}
            className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
          >
            ✅ Approve & Clear Session
          </button>
          <button
            onClick={() => handleReviewAction('masked')}
            className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors"
          >
            🔒 Enforce PII Masking
          </button>
          <button
            onClick={() => handleReviewAction('blocked')}
            className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
          >
            🚫 Block & Terminate Session
          </button>
        </div>
      </div>
    </div>
  );
}
