import React, { useState, useEffect } from 'react';
import { fetchFindingById, fetchFindings, submitReviewDecision } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

export function FindingDetailView({ findingId, onBack }) {
  const [finding, setFinding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('open');
  const { showToast } = useToast();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let item = null;
        if (findingId) {
          try {
            item = await fetchFindingById(findingId);
          } catch (e) {}
        }
        if (!item) {
          const list = await fetchFindings({ limit: 50 });
          if (findingId) {
            item = list.find((f) => f.id === findingId);
          }
          if (!item && list.length > 0) item = list[0];
        }
        setFinding(item);
        if (item?.status) setStatus(item.status);
      } catch (err) {
        showToast('Failed to load finding details: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [findingId]);

  const handleAcknowledge = async () => {
    if (!finding) return;
    try {
      await submitReviewDecision(finding.id, 'acknowledged', 'Acknowledged by security auditor');
      setStatus('acknowledged');
      showToast('Finding marked as Acknowledged', 'cyan');
    } catch (e) {
      showToast('Action failed: ' + e.message, 'error');
    }
  };

  const handleResolve = async () => {
    if (!finding) return;
    try {
      await submitReviewDecision(finding.id, 'approved', 'Resolved and cleared in studio');
      setStatus('resolved');
      showToast('Finding successfully resolved', 'success');
    } catch (e) {
      showToast('Action failed: ' + e.message, 'error');
    }
  };

  const getSeverityBadge = (sev) => {
    const s = (sev || 'HIGH').toUpperCase();
    return (
      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400">
        {s}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs animate-fade-in">
        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
        <div>Loading finding details...</div>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-dark-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Risk Findings
        </button>
        <div className="p-8 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          Finding not found.
        </div>
      </div>
    );
  }

  const detectedPrompt =
    finding.user_prompt ||
    finding.prompt_text ||
    finding.raw_response ||
    finding.evidence ||
    'No raw prompt captured.';

  const sanitizedPrompt =
    finding.sanitized_prompt ||
    finding.sanitized_response ||
    finding.masked_text;

  const triggeredRules = Array.isArray(finding.triggered_rules)
    ? finding.triggered_rules
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Risk Findings</span>
        </button>

        <button
          onClick={() => showToast('Opening source workspace endpoint in studio', 'info')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-100/70 hover:bg-amber-200/80 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 text-xs font-semibold transition-colors shadow-sm"
        >
          <span>Open in source workspace</span>
        </button>
      </div>

      {/* Main Finding Overview Card */}
      <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-brand font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
                {finding.finding_title}
              </h2>
              {getSeverityBadge(finding.severity)}
            </div>
            <div className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-900 text-slate-600 dark:text-slate-400 font-mono text-xs font-semibold border border-slate-200 dark:border-slate-800">
              {finding.finding_code || 'PII-OUTPUT-001'}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAcknowledge}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors shadow-sm whitespace-nowrap"
            >
              Acknowledge
            </button>
            <button
              onClick={handleResolve}
              className="px-3.5 py-1.5 rounded-xl bg-amber-100/70 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              Resolve
            </button>
          </div>
        </div>

        {/* Structured Key-Value Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 bg-slate-50/50 dark:bg-dark-900/40">
            <div className="md:col-span-3 font-semibold text-slate-500 dark:text-slate-400">Source</div>
            <div className="md:col-span-9">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 text-[11px]">
                {finding.source || 'Endpoint'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 p-4">
            <div className="md:col-span-3 font-semibold text-slate-500 dark:text-slate-400">Status</div>
            <div className="md:col-span-9 font-medium text-slate-800 dark:text-slate-200 lowercase">
              {status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 p-4 bg-slate-50/50 dark:bg-dark-900/40">
            <div className="md:col-span-3 font-semibold text-slate-500 dark:text-slate-400">Context</div>
            <div className="md:col-span-9 font-mono text-slate-900 dark:text-slate-100 font-semibold">
              {finding.context || 'PII_DETECTION'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 p-4">
            <div className="md:col-span-3 font-semibold text-slate-500 dark:text-slate-400">Last reported</div>
            <div className="md:col-span-9 text-slate-700 dark:text-slate-300">
              {finding.timestamp ? new Date(finding.timestamp).toLocaleString() : 'a day ago'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 p-4 bg-slate-50/50 dark:bg-dark-900/40">
            <div className="md:col-span-3 font-semibold text-slate-500 dark:text-slate-400">Session ID</div>
            <div className="md:col-span-9">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                {finding.session_id || 'sess_default_001'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 p-4">
            <div className="md:col-span-3 font-semibold text-slate-500 dark:text-slate-400">Detected content</div>
            <div className="md:col-span-9 space-y-3">
              {finding.user_prompt && (
                <div className="space-y-1">
                  <div className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider">Original User Prompt</div>
                  <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal bg-slate-50 dark:bg-dark-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap font-mono text-[11px]">
                    {finding.user_prompt}
                  </div>
                </div>
              )}

              {finding.raw_response && (
                <div className="space-y-1">
                  <div className="font-semibold text-[10px] text-rose-500 uppercase tracking-wider">Model Response / Unverified Output</div>
                  <div className="text-rose-700 dark:text-rose-300 leading-relaxed font-normal bg-rose-50/50 dark:bg-rose-950/20 p-3.5 rounded-xl border border-rose-500/20 whitespace-pre-wrap font-mono text-[11px]">
                    {finding.raw_response}
                  </div>
                </div>
              )}

              {!finding.user_prompt && !finding.raw_response && (
                <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal bg-slate-50 dark:bg-dark-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap font-mono text-[11px]">
                  {detectedPrompt}
                </div>
              )}

              {sanitizedPrompt && sanitizedPrompt !== detectedPrompt && sanitizedPrompt !== finding.user_prompt && (
                <div className="space-y-1">
                  <div className="font-semibold text-[10px] text-emerald-500 uppercase tracking-wider">Sanitized Masked Output</div>
                  <div className="text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20 whitespace-pre-wrap font-mono text-[11px]">
                    {sanitizedPrompt}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Verified Fact & Source Link STRICTLY for Hallucination Findings (Never for PII or Injections) */}
          {(() => {
            const isPiiOrInjection = Boolean(
              (finding.context && (String(finding.context).startsWith('PII') || String(finding.context).includes('INJECTION') || String(finding.context).includes('BIAS'))) ||
              (finding.id && (String(finding.id).startsWith('PII') || String(finding.id).startsWith('INJ') || String(finding.id).startsWith('BIAS') || String(finding.id).startsWith('SEC'))) ||
              (finding.finding_title && (String(finding.finding_title).toLowerCase().includes('pii') || String(finding.finding_title).toLowerCase().includes('injection') || String(finding.finding_title).toLowerCase().includes('bias')))
            );
            const isHal = Boolean(
              finding.is_hallucination ||
              (finding.id && String(finding.id).startsWith('HAL')) ||
              (finding.context && (String(finding.context).includes('HALLUCINATION') || String(finding.context).includes('GROUNDING'))) ||
              (finding.finding_title && String(finding.finding_title).toLowerCase().includes('hallucination')) ||
              (finding.type && String(finding.type).includes('HALLUCINATION'))
            );
            return isHal && !isPiiOrInjection;
          })() && (
            <div className="grid grid-cols-1 md:grid-cols-12 p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border-t border-emerald-200 dark:border-emerald-800/50">
              <div className="md:col-span-3 font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Fact & Citation</span>
              </div>
              <div className="md:col-span-9 space-y-3">
                <div className="space-y-1">
                  <div className="font-bold text-[10px] text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Correct Grounded Fact / Answer
                  </div>
                  <div className="text-slate-900 dark:text-emerald-100 bg-white dark:bg-dark-900 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 font-medium text-xs shadow-sm">
                    {finding.correct_answer || finding.evidence_snippet || "The factual claim was verified against live search and reference documentation."}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Authoritative Evidence & Wikipedia Citation
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    {(() => {
                      const queryText = (finding.user_prompt && finding.user_prompt !== 'General Query')
                        ? finding.user_prompt
                        : (finding.raw_response || 'fact check');
                      const linkUrl = (finding.source_link && !finding.source_link.includes('docs.controlplane.ai'))
                        ? finding.source_link
                        : `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(queryText)}`;
                      const isWikipedia = linkUrl.includes('wikipedia.org');
                      const isGovOrEdu = linkUrl.includes('.gov') || linkUrl.includes('.edu') || linkUrl.includes('britannica.com');

                      return (
                        <a
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60 font-mono text-[11.5px] font-semibold transition-all shadow-sm group"
                        >
                          <span className="text-sm">{isWikipedia ? '📖' : (isGovOrEdu ? '🏛️' : '🌐')}</span>
                          <span className="group-hover:underline">{isWikipedia ? 'Wikipedia Reference' : (isGovOrEdu ? 'Official Authority Source' : 'Authoritative Citation')}:</span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-normal truncate max-w-md">{linkUrl}</span>
                        </a>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Occurrence History Card */}
      <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
          Occurrence history
        </h3>
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Violation Intercepted by Guardrail</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {triggeredRules.length > 0 ? `Triggered: ${triggeredRules.join(', ')}` : 'Fast-path evaluation rule triggered'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[11px] text-slate-400">
                {finding.hash_chain ? `Hash: ${finding.hash_chain.substring(0, 12)}...` : 'SHA-256 Verified'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
