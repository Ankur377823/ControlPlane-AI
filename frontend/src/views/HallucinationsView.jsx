import React, { useState } from 'react';
import { verifyHallucination } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Microscope } from 'lucide-react';

export function HallucinationsView() {
  const [prompt, setPrompt] = useState('Introduce Graham Neubig');
  const [response, setResponse] = useState(
    'Graham Neubig is a professor at MIT and conducts research in artificial intelligence.'
  );
  const [category, setCategory] = useState('kbqa');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [openaiKey, setOpenaiKey] = useState('');
  const [serperKey, setSerperKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { showToast } = useToast();

  const handlePreset = (type) => {
    if (type === 'neubig') {
      setPrompt('Introduce Graham Neubig');
      setResponse('Graham Neubig is a professor at MIT and conducts research in artificial intelligence.');
      setCategory('kbqa');
    } else if (type === 'math') {
      setPrompt(
        'Stephen placed an online order for groceries totaling $7,023,116. Vendor added 25% fee ($1,755,779), $3 delivery fee, and $4 tip. What was final price?'
      );
      setResponse(
        'Initial groceries: $7023116. 25% fee: $1755779. Delivery fee: $3. Tip: $4. Adding all up, the total final price was 7023116 + 1755779 + 3 + 4 = 8779902.'
      );
      setCategory('math');
    } else if (type === 'code') {
      setPrompt('Implement get_max_triples(n) in Python');
      setResponse(
        'def get_max_triples(n):\n    a = [i * i - i + 1 for i in range(1, n+1)]\n    return sum(1 for i in range(n-2) for j in range(i+1, n-1) for k in range(j+1, n) if (a[i] + a[j] + a[k]) % 3 == 0)'
      );
      setCategory('code');
    } else if (type === 'microsoft') {
      setPrompt('Who is the current CEO of Microsoft and when was the company founded?');
      setResponse('The current CEO of Microsoft is Elon Musk, and the company was founded in 1999 in San Francisco.');
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
      };

      const res = await verifyHallucination(payload);
      setResult(res);
      showToast('Factuality verification completed!', 'success');
    } catch (err) {
      showToast('Verification failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary dark:text-primary-light">
          <Microscope className="w-5 h-5" />
          <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">
            Hallucination & Factuality Detector (FacTool)
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Extract claims, search external evidence, and compute factuality scores for LLM answers across Knowledge QA, Math, Code, and Scientific Literature.
        </p>
      </div>

      {/* Main Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6">
        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-2">Quick Sample Presets:</span>
          <button
            type="button"
            onClick={() => handlePreset('neubig')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-colors"
          >
            💡 Preset 1: QA Hallucination
          </button>
          <button
            type="button"
            onClick={() => handlePreset('math')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-colors"
          >
            🧮 Preset 2: Math Reasoning
          </button>
          <button
            type="button"
            onClick={() => handlePreset('code')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-colors"
          >
            💻 Preset 3: Code Verification
          </button>
          <button
            type="button"
            onClick={() => handlePreset('microsoft')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-colors"
          >
            🏢 Preset 4: CEO Hallucination
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-white mb-1">Original Prompt</label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt given to LLM..."
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-white mb-1">
                LLM Generated Response / Answer
              </label>
              <textarea
                rows={4}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Enter model generated response to verify..."
                required
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
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
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
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
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Serper API Key (Optional)</label>
              <input
                type="password"
                value={serperKey}
                onChange={(e) => setSerperKey(e.target.value)}
                placeholder="Serper search key..."
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              🔑 Provide OpenAI & Serper API keys for live web search, or leave blank to test with local evaluator.
            </span>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/25 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <Microscope className="w-4 h-4" />
              )}
              <span>Verify Factuality (FacTool)</span>
            </button>
          </div>
        </form>

        {/* Results Box */}
        {result && (
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-white/10 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h4 className="font-brand font-bold text-sm text-slate-900 dark:text-white">Factuality Verification Report</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Status: {result.status || 'Success'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">Score:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary dark:text-primary-light border border-primary/20">
                  {result.factuality_score !== undefined ? `${(result.factuality_score * 100).toFixed(1)}%` : 'Evaluated'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              {result.claim_verifications && result.claim_verifications.length > 0 ? (
                result.claim_verifications.map((cv, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">Claim #{idx + 1}:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cv.is_factual
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25'
                        }`}
                      >
                        {cv.is_factual ? '✅ FACTUAL' : '⚠️ HALLUCINATION'}
                      </span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-300 font-mono text-[11px]">{cv.claim}</div>
                    {cv.evidence && (
                      <div className="text-slate-500 dark:text-slate-400 text-[10px] bg-slate-50 dark:bg-black/30 p-2 rounded-lg border border-slate-200/60 dark:border-transparent">
                        Evidence: {cv.evidence}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-white dark:bg-dark-850 text-slate-800 dark:text-slate-300">
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
