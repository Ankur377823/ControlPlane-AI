import React, { useState, useEffect } from 'react';
import { fetchFindings, fetchFindingById, submitReviewDecision, submitFindingFeedback } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, ShieldCheck, RefreshCw, ThumbsUp, ThumbsDown, Bot, AlertTriangle, CheckCircle2, Lock, Ban } from 'lucide-react';

export function EventOverviewModal({ eventId, sessionId, isOpen, onClose }) {
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const { showToast } = useToast();

  const loadEventData = async () => {
    if (!isOpen) return;
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
    loadEventData();
  }, [isOpen, eventId, sessionId]);

  if (!isOpen) return null;

  const handleReviewAction = async (decision) => {
    if (!activeEvent) return;
    try {
      await submitReviewDecision(activeEvent.id, decision, reviewerNotes);
      showToast(`Review decision recorded: ${decision.toUpperCase()}`, 'success');
      loadEventData();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-dark-900/80 backdrop-blur-md animate-fade-in transition-colors">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-400/30 dark:shadow-black/80 flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-dark-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/25 flex items-center justify-center text-primary dark:text-primary-light">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                Event Telemetry & Session Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Deep-dive telemetry, intercepted payloads & HITL controls.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              Loading security telemetry...
            </div>
          ) : !activeEvent ? (
            <div className="text-center py-12 text-slate-500 text-sm">No event telemetry found.</div>
          ) : (
            <>
              {/* Event Banner */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${sevColor(activeEvent.severity)}`}>
                      {activeEvent.severity || 'HIGH'}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold flex items-center gap-1">
                      <Bot className="w-3 h-3 text-primary" />
                      <span>{activeEvent.source || 'Endpoint AI Bot'}</span>
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Session: <code className="text-primary dark:text-accent-cyan font-bold">{activeEvent.session_id || 'sess_default'}</code>
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{activeEvent.finding_title}</h4>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-4 pt-1">
                  <span>
                    Risk Code: <strong className="text-primary dark:text-accent-cyan font-mono">{activeEvent.finding_code}</strong>
                  </span>
                  <span>
                    Target: <strong className="text-slate-900 dark:text-white">{activeEvent.resource_name || 'Global Guardrail'}</strong>
                  </span>
                  <span>
                    Category: <strong className="text-amber-700 dark:text-amber-400 font-mono">{activeEvent.context}</strong>
                  </span>
                </div>
              </div>

              {/* Payload Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Raw Input Prompt (Captured)</span>
                  </div>
                  <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-black/40 p-3.5 rounded-xl border border-slate-200 dark:border-transparent overflow-x-auto whitespace-pre-wrap">
                    {activeEvent.prompt_text || activeEvent.evidence || 'No raw prompt logged'}
                  </pre>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Guardrail Masked / Sanitized Result</span>
                  </div>
                  <pre className="text-xs font-mono text-emerald-800 dark:text-emerald-200 bg-white dark:bg-black/40 p-3.5 rounded-xl border border-slate-200 dark:border-transparent overflow-x-auto whitespace-pre-wrap">
                    {activeEvent.masked_text || activeEvent.sanitized_prompt || '[Sanitized / Redacted]'}
                  </pre>
                </div>
              </div>

              {/* Verified Fact & Source Evidence (for Hallucination / Grounding Events) */}
              {(activeEvent.is_hallucination || activeEvent.correct_answer || activeEvent.source_link || (activeEvent.context && (activeEvent.context.includes('HALLUCINATION') || activeEvent.context.includes('GROUNDING')))) && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Verified Grounded Fact & Source Citation</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase">
                      Ground Truth
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Correct Answer / Factual Truth
                    </div>
                    <div className="text-xs font-medium text-slate-900 dark:text-emerald-100 bg-white dark:bg-dark-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                      {activeEvent.correct_answer || activeEvent.evidence_snippet || "Verified fact based on approved enterprise reference documentation."}
                    </div>

                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-1">
                      Knowledge Base Source Link
                    </div>
                    <div>
                      <a
                        href={activeEvent.source_link || "https://docs.controlplane.ai/knowledge-base/verified-sources"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-mono text-[11px] font-semibold transition-colors"
                      >
                        <span>🔗 {activeEvent.source_link || "https://docs.controlplane.ai/knowledge-base/verified-sources"}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Queue Actions */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Human-in-the-Loop (HITL) Reviewer Actions
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Enter audit notes or reviewer comments..."
                    className="flex-1 bg-white dark:bg-dark-850 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary shadow-sm"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleFeedback('CONFIRM_FP')}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1"
                      title="Mark False Positive"
                    >
                      <ThumbsDown className="w-3.5 h-3.5 text-rose-500" /> FP
                    </button>
                    <button
                      onClick={() => handleFeedback('CONFIRM_TP')}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1"
                      title="Confirm True Positive"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /> TP
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleReviewAction('approved')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                  >
                    Approve & Clear
                  </button>
                  <button
                    onClick={() => handleReviewAction('masked')}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold"
                  >
                    Auto-Mask PII
                  </button>
                  <button
                    onClick={() => handleReviewAction('blocked')}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold"
                  >
                    Halt & Block Session
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
