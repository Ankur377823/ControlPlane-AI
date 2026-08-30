import React, { useState, useEffect } from 'react';
import { fetchReviewQueue, submitReviewDecision, submitFindingFeedback, fetchTrustworthiness } from '../services/api';
import { useToast } from '../context/ToastContext';
import { UserCheck, CheckCircle2, XCircle, AlertTriangle, Shield, RefreshCw, Sparkles, Filter, Sliders } from 'lucide-react';

export function ReviewQueueView() {
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [useCaseFilter, setUseCaseFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [trustMetrics, setTrustMetrics] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, metrics] = await Promise.all([
        fetchReviewQueue({
          status: statusFilter,
          severity: severityFilter !== 'all' ? severityFilter : undefined,
          use_case_type: useCaseFilter !== 'all' ? useCaseFilter : undefined,
        }),
        fetchTrustworthiness(),
      ]);
      setQueueItems(items || []);
      setTrustMetrics(metrics || null);
      if (items && items.length > 0 && !selectedItem) {
        setSelectedItem(items[0]);
      }
    } catch (err) {
      console.error('Failed to load review queue:', err);
      showToast('Error loading review queue: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter, useCaseFilter]);

  const handleDecision = async (item, decision) => {
    setProcessingId(item.id);
    try {
      const res = await submitReviewDecision(item.id, decision, reviewerNotes, 'usr_admin');
      showToast(`Decision recorded: ${decision.toUpperCase()} on #${item.id}`, decision === 'approve' ? 'success' : 'warning');
      setReviewerNotes('');
      await loadData();
    } catch (err) {
      showToast('Failed to process review: ' + err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleFeedback = async (item, type) => {
    try {
      const res = await submitFindingFeedback(item.id, type, reviewerNotes);
      showToast(`Logged feedback: ${type}. Auto-tuned policy thresholds!`, 'cyan');
      await loadData();
    } catch (err) {
      showToast('Feedback failed: ' + err.message, 'error');
    }
  };

  const getSeverityBadge = (sev) => {
    switch ((sev || '').toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <UserCheck className="w-5 h-5 text-slate-900 dark:text-white stroke-[2.5]" />
            <h1 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">
              Human-in-the-Loop (HITL) Review Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit high-risk agent tool actions, ambiguous model outputs, and policy exceptions with active feedback auto-tuning.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold font-mono transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Trust & Auto-Tuning Banner */}
      {trustMetrics && (
        <div className="p-4 rounded-xl border border-slate-300 dark:border-[#22252c] bg-white dark:bg-[#0e1014] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#181b22] border border-slate-300 dark:border-[#2a2d36] text-slate-900 dark:text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-slate-900 dark:text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Active Self-Tuning Governance Engine</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Reviewer decisions continuously refine detection sensitivity, reducing alert fatigue while preventing false negatives.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">Trust Index</span>
              <span className="font-bold text-primary text-sm">{trustMetrics.trustworthiness_score}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Precision</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{trustMetrics.precision_percent}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Override Rate</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{trustMetrics.human_override_rate_percent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-primary"
          >
            <option value="pending">Status: Pending Review</option>
            <option value="approved">Status: Approved</option>
            <option value="rejected">Status: Rejected / Blocked</option>
            <option value="all">Status: All Statuses</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">Severity: All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={useCaseFilter}
            onChange={(e) => setUseCaseFilter(e.target.value)}
            className="bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">Use Case: All Profiles</option>
            <option value="customer_support">Customer Support Bot</option>
            <option value="internal_copilot">Internal Employee Copilot</option>
            <option value="decision_support">Regulated Decision Support</option>
            <option value="agent">Autonomous Agent Runtime</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing <span className="text-slate-900 dark:text-white font-bold">{queueItems.length}</span> items
        </div>
      </div>

      {/* Main Split View: Queue List + Detailed Review Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queue Items List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-1">
          {queueItems.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Review Queue is Clear</div>
              <p className="text-[11px] text-slate-400 mt-1">No items currently match the selected filter criteria.</p>
            </div>
          ) : (
            queueItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 space-y-2.5 ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                      {item.finding_code || item.id}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(item.severity)}`}>
                      {item.severity || 'HIGH'}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.finding_title || 'Action Confirmation Required'}
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 font-mono">
                    "{item.user_prompt}"
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span>{item.resource_name || 'Global AI Guardrail'}</span>
                    <span className="font-semibold text-primary">{item.action}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Item Review & Action Console (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedItem ? (
            <div className="glass-panel p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 space-y-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{selectedItem.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(selectedItem.severity)}`}>
                      {selectedItem.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-100 dark:bg-dark-900 px-2 py-0.5 rounded">
                      {selectedItem.use_case_type || 'customer_support'}
                    </span>
                  </div>
                  <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white mt-1">
                    {selectedItem.finding_title}
                  </h3>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono">
                  <div>Status: <strong className="text-slate-900 dark:text-white uppercase">{selectedItem.status}</strong></div>
                  <div>Source: {selectedItem.source || 'Endpoint'}</div>
                </div>
              </div>

              {/* Intercepted Prompt & Response Preview */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Original Prompt / Agent Request
                  </label>
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white whitespace-pre-wrap">
                    {selectedItem.user_prompt}
                  </div>
                </div>

                {selectedItem.sanitized_prompt && selectedItem.sanitized_prompt !== selectedItem.user_prompt && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1.5">
                      Sanitized & Redacted Payload (Mask Mode)
                    </label>
                    <div className="p-3.5 rounded-lg bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 text-xs font-mono text-cyan-900 dark:text-cyan-200 whitespace-pre-wrap">
                      {selectedItem.sanitized_prompt}
                    </div>
                  </div>
                )}

                {/* Triggered Policy Rules */}
                {selectedItem.triggered_rules && selectedItem.triggered_rules.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Triggered Security Signatures
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.triggered_rules.map((rule, rIdx) => (
                        <span key={rIdx} className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-mono font-semibold">
                          {rule}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reviewer Action Console */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-dark-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-primary" />
                  <span>Human-in-the-Loop Decision & Feedback Console</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Reviewer Notes / Compliance Justification (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="e.g. Approved exception for authorized staging migration test..."
                    className="w-full bg-white dark:bg-dark-850 border border-slate-300 dark:border-slate-700 rounded-md p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={processingId === selectedItem.id}
                      onClick={() => handleFeedback(selectedItem, 'false_positive')}
                      className="px-3 py-1.5 rounded-md bg-white dark:bg-dark-850 hover:bg-slate-100 dark:hover:bg-dark-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors"
                    >
                      Mark False Positive
                    </button>
                    <button
                      type="button"
                      disabled={processingId === selectedItem.id}
                      onClick={() => handleFeedback(selectedItem, 'true_positive')}
                      className="px-3 py-1.5 rounded-md bg-white dark:bg-dark-850 hover:bg-slate-100 dark:hover:bg-dark-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors"
                    >
                      Confirm True Positive
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={processingId === selectedItem.id}
                      onClick={() => handleDecision(selectedItem, 'reject')}
                      className="px-4 py-2 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject & Block</span>
                    </button>
                    <button
                      type="button"
                      disabled={processingId === selectedItem.id}
                      onClick={() => handleDecision(selectedItem, 'approve')}
                      className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Execute</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 text-slate-400">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50 text-primary" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">No Item Selected</div>
              <p className="text-[11px] text-slate-400 mt-1">Select an item from the queue list on the left to inspect telemetry and record a review decision.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
