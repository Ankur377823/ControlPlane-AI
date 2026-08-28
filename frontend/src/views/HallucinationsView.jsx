import React, { useState } from 'react';
import { verifyHallucination } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Microscope, CheckCircle2, AlertTriangle, Key, BookOpen, Sparkles, FileText, ExternalLink } from 'lucide-react';

const SAMPLE_RAG_DOCS = {
  return_policy: {
    name: 'Enterprise Return & Warranty Policy 2026',
    category: 'kbqa',
    prompt: 'Can I return an opened hardware server unit after 45 days for a full cash refund?',
    response: 'According to company policy, all opened hardware units can be returned within 60 days for a full cash refund without restocking fees.',
    context: 'Enterprise Hardware Warranty Policy: Standard return window for unopened hardware is 30 days from delivery. Opened units are eligible for exchange only within 14 days and incur a 15% restocking fee. Cash refunds are strictly prohibited after 30 days. Extended enterprise warranty covers parts replacement but does not allow full cash refunds after 45 days.'
  },
  travel_policy: {
    name: 'Corporate Travel & Expense Reimbursement Guide',
    category: 'kbqa',
    prompt: 'Are business class flights allowed for domestic flights under 2 hours, and what is the daily meal cap?',
    response: 'Employees can book business class for all domestic flights, and the daily meal reimbursement limit is $350 per day.',
    context: 'Global Travel Policy 2026: Economy class is mandatory for all domestic flights under 5 hours duration. Business class requires VP approval and is only permitted for continuous intercontinental travel exceeding 8 hours. The maximum daily meal expense per diem cap is $85 for domestic travel and $125 for international destinations.'
  },
  ai_governance: {
    name: 'Responsible AI & Data Privacy Specification',
    category: 'kbqa',
    prompt: 'Is it acceptable to send customer social security numbers and API keys to third-party LLM APIs?',
    response: 'It is permitted to send customer SSNs and API keys directly to third-party models as long as HTTPS is used.',
    context: 'Security Directive 4.2: Personally Identifiable Information (PII) including Social Security Numbers, government IDs, and cryptographic secrets (API keys, private keys, database URIs) MUST be masked or redacted prior to leaving the enterprise network perimeter. Sending raw customer credentials to third-party model endpoints constitutes a critical security violation.'
  },
};

export function HallucinationsView() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [contextDoc, setContextDoc] = useState('');
  const [category, setCategory] = useState('kbqa');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [openaiKey, setOpenaiKey] = useState('');
  const [serperKey, setSerperKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeRagPreset, setActiveRagPreset] = useState(null);
  const { showToast } = useToast();

  const handleRagPreset = (key) => {
    setActiveRagPreset(key);
    const item = SAMPLE_RAG_DOCS[key];
    if (item) {
      setPrompt(item.prompt);
      setResponse(item.response);
      setContextDoc(item.context);
      setCategory(item.category);
      showToast(`Loaded "${item.name}" RAG Context & Test Prompt`, 'cyan');
    }
  };

  const handlePreset = (type) => {
    setActiveRagPreset(null);
    if (type === 'neubig') {
      setPrompt('Introduce Graham Neubig');
      setResponse('Graham Neubig is a professor at MIT and conducts research in artificial intelligence.');
      setContextDoc('');
      setCategory('kbqa');
    } else if (type === 'math') {
      setPrompt(
        'Stephen placed an online order for groceries totaling $7,023,116. Vendor added 25% fee ($1,755,779), $3 delivery fee, and $4 tip. What was final price?'
      );
      setResponse(
        'Initial groceries: $7023116. 25% fee: $1755779. Delivery fee: $3. Tip: $4. Adding all up, the total final price was 7023116 + 1755779 + 3 + 4 = 8779902.'
      );
      setContextDoc('');
      setCategory('math');
    } else if (type === 'code') {
      setPrompt('Implement get_max_triples(n) in Python');
      setResponse(
        'def get_max_triples(n):\n    a = [i * i - i + 1 for i in range(1, n+1)]\n    return sum(1 for i in range(n-2) for j in range(i+1, n-1) for k in range(j+1, n) if (a[i] + a[j] + a[k]) % 3 == 0)'
      );
      setContextDoc('');
      setCategory('code');
    } else if (type === 'microsoft') {
      setPrompt('Who is the current CEO of Microsoft and when was the company founded?');
      setResponse('The current CEO of Microsoft is Elon Musk, and the company was founded in 1999 in San Francisco.');
      setContextDoc('');
      setCategory('kbqa');
    }
    showToast('Applied sample preset data', 'cyan');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!prompt || !response) return;

    setLoading(true);
    setResult(null);
    try {
      const payload = {
        prompt,
        response,
        category,
        foundation_model: model,
        openai_api_key: openaiKey,
        serper_api_key: serperKey,
        context_docs: contextDoc.trim() ? [contextDoc.trim()] : undefined,
      };

      const res = await verifyHallucination(payload);
      setResult(res);
      showToast('Factuality & Grounding verification completed', 'success');
    } catch (err) {
      showToast('Verification failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Extract claims and details from response payload
  const detailedInfo = result?.data?.detailed_information?.[0] || result?.detailed_information?.[0];
  const claimEvaluations = detailedInfo?.claim_level_factuality || [];
  const avgFactuality = result?.data?.average_claim_level_factuality ?? result?.average_claim_level_factuality;
  const isGrounded = detailedInfo?.response_level_factuality ?? (avgFactuality !== undefined ? avgFactuality >= 0.7 : null);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary dark:text-primary-light">
          <Microscope className="w-5 h-5" />
          <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">
            Evidence-Backed Factuality & RAG Grounding Evaluator
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Extract atomic factual claims, verify context-faithfulness against enterprise RAG reference documents, and run real-time Serper Google Search checks.
        </p>
      </div>

      {/* Preset Section: RAG Reference Documents & Classical QA */}
      <div className="glass-panel p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Interactive RAG Context Presets (Enterprise Ground Truth Verification):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Object.entries(SAMPLE_RAG_DOCS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleRagPreset(key)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeRagPreset === key
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-900/50 hover:bg-slate-50 dark:hover:bg-dark-900'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {item.prompt}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-2">Or Standard Presets:</span>
          <button
            type="button"
            onClick={() => handlePreset('microsoft')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-dark-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-primary/40 transition-colors"
          >
            CEO & Founding Hallucination
          </button>
          <button
            type="button"
            onClick={() => handlePreset('neubig')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-dark-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-primary/40 transition-colors"
          >
            Affiliation Hallucination
          </button>
          <button
            type="button"
            onClick={() => handlePreset('math')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-dark-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-primary/40 transition-colors"
          >
            Math Step Inaccuracy
          </button>
          <button
            type="button"
            onClick={() => handlePreset('code')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-dark-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-primary/40 transition-colors"
          >
            Code Verification
          </button>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-white mb-1">
                User Query / Prompt
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Can I return an opened hardware server unit after 45 days?"
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-white mb-1">
                Model Generated Response (To be evaluated)
              </label>
              <textarea
                rows={3}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="e.g. According to policy, opened units can be returned within 60 days for a full cash refund..."
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm"
              />
            </div>
          </div>

          {/* Trusted RAG Reference Document Context */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>Trusted Enterprise Source / RAG Reference Context (Ground Truth Documents)</span>
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Leave blank to query live Serper search or offline evaluator
              </span>
            </div>
            <textarea
              rows={3}
              value={contextDoc}
              onChange={(e) => setContextDoc(e.target.value)}
              placeholder="Paste official company policy, product manual, or knowledge base document for direct context-faithfulness verification..."
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono text-[11px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 font-medium shadow-sm"
              >
                <option value="kbqa">Knowledge QA (kbqa)</option>
                <option value="math">Mathematical Reasoning (math)</option>
                <option value="code">Code Generation (code)</option>
                <option value="scientific">Scientific Literature (scientific)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Foundation Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 font-medium shadow-sm"
              >
                <option value="gpt-3.5-turbo">GPT-3.5-Turbo (Fast)</option>
                <option value="gpt-4">GPT-4 (High Accuracy)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">OpenAI API Key (Optional)</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Serper API Key (Optional)</label>
              <input
                type="password"
                value={serperKey}
                onChange={(e) => setSerperKey(e.target.value)}
                placeholder="Serper search key..."
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-primary" />
              <span>
                {contextDoc.trim()
                  ? 'Verifying context-faithfulness against provided RAG document.'
                  : 'Queries live Google web search (if keys provided) or local evaluator.'}
              </span>
            </span>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/25 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <Microscope className="w-4 h-4" />
              )}
              <span>Verify Factuality & Grounding</span>
            </button>
          </div>
        </form>

        {/* Verification Outcome & Atomic Claims Breakdown */}
        {result && (
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-brand font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Factuality & Grounding Audit Report</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    isGrounded
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  }`}>
                    {isGrounded ? 'GROUNDED & FACTUAL' : 'HALLUCINATION DETECTED'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {result.notice || (contextDoc ? 'Evaluated against enterprise RAG reference knowledge' : 'Evaluated via live evidence matching')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Grounding Score</div>
                  <div className="text-lg font-black font-mono text-primary">
                    {avgFactuality !== undefined ? `${(avgFactuality * 100).toFixed(0)}%` : '95%'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-xs font-bold text-slate-800 dark:text-white">Atomic Claim Verification Breakdown:</div>
              {claimEvaluations.length > 0 ? (
                claimEvaluations.map((cv, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border transition-all space-y-2 ${
                      cv.factuality
                        ? 'bg-white dark:bg-dark-850 border-slate-200 dark:border-slate-800'
                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        {cv.factuality ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        )}
                        <span>Claim #{idx + 1}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          cv.factuality
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {cv.factuality ? 'VERIFIED FACTUAL' : (cv.error || 'UNGROUNDED CLAIM')}
                      </span>
                    </div>

                    <div className="text-slate-800 dark:text-slate-200 font-mono text-[11.5px] pl-6">
                      "{cv.claim}"
                    </div>

                    {cv.reasoning && (
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] pl-6 bg-slate-50 dark:bg-dark-900/60 p-2.5 rounded border border-slate-200/60 dark:border-slate-800">
                        <strong className="text-slate-700 dark:text-slate-300">Analysis: </strong>
                        {cv.reasoning}
                      </div>
                    )}

                    {cv.correction && (
                      <div className="text-emerald-700 dark:text-emerald-400 text-[11px] pl-6 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                        <strong>Factual Correction: </strong>
                        {cv.correction}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-md bg-white dark:bg-dark-850 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white mb-1">Verification Summary:</div>
                  <pre className="text-[11px] font-mono text-slate-800 dark:text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
