import React from 'react';
import { Shield, Zap, Filter, Scale, Eye, Cpu, Database, CheckCircle2, AlertTriangle, XCircle, ArrowDown, ArrowRight, RefreshCw, Lock } from 'lucide-react';

export function ArchitectureDoc() {
  return (
    <div className="space-y-10 animate-fade-in text-slate-800 dark:text-slate-200 font-reading leading-relaxed">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5" />
          <span>System Design & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-brand tracking-tight">
          Multi-Tier Interception & Decision Architecture
        </h1>
        <p className="text-[16px] sm:text-[17px] text-slate-700 dark:text-slate-200 leading-relaxed max-w-3xl font-normal">
          ControlPlane AI is engineered with a sub-15ms fast-path pipeline combining deterministic pattern filters, RAG evidence-grounding, state-machine agent safety, and cryptographic audit persistence.
        </p>
      </div>

      {/* VISUAL FLOWCHART 1: End-to-End Decision Pipeline */}
      <section id="pipeline-flowchart" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
            <span>Visual Pipeline & Interception Flowchart</span>
            <span className="text-primary text-lg font-normal">#</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">End-to-End Decision Lifecycle</span>
        </div>

        {/* Interactive Flowchart Container */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          {/* Step 1: Ingestion Node */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-lg p-4 rounded-xl bg-white dark:bg-dark-850 border-2 border-primary/40 shadow-sm text-center space-y-1.5">
              <div className="text-[11px] font-mono font-bold text-primary uppercase tracking-wider">STAGE 1: Ingestion & Identification</div>
              <div className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <span>User Prompt / Chatbot Response / Agent Tool Call</span>
              </div>
              <div className="text-[13px] text-slate-600 dark:text-slate-400">Chrome Extension (Capture Phase) or FastAPI REST Gateway</div>
            </div>
            <ArrowDown className="w-5 h-5 text-primary my-2 animate-bounce" />
          </div>

          {/* Step 2: Sub-15ms Fast-Path Layer */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl p-5 rounded-xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-brand uppercase tracking-wider">
                    STAGE 2: Sub-15ms Deterministic Fast-Path Layer
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  LATENCY &lt; 15ms
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-[13px] text-slate-900 dark:text-white">1. PII & Secrets</div>
                  <div className="text-[12px] text-slate-600 dark:text-slate-400">Luhn cards, SSNs, PHI, API keys (`sk-...`)</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-[13px] text-slate-900 dark:text-white">2. Prompt Injection</div>
                  <div className="text-[12px] text-slate-600 dark:text-slate-400">L1 Regex + L2 Indicator Scoring</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-[13px] text-slate-900 dark:text-white">3. Zero-LLM Guardian</div>
                  <div className="text-[12px] text-slate-600 dark:text-slate-400">7 checks: Shell (`rm -rf`), SQL Drop</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-[13px] text-slate-900 dark:text-white">4. Token Budget</div>
                  <div className="text-[12px] text-slate-600 dark:text-slate-400">Max token enforcement (2k-8k)</div>
                </div>
              </div>
            </div>
            <ArrowDown className="w-5 h-5 text-primary my-2" />
          </div>

          {/* Step 3: Deep Verification & State Tracking Layer */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl p-5 rounded-xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-brand uppercase tracking-wider">
                    STAGE 3: Deep Context, Trajectory & Secondary Judge Layer
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Contextual Verification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3.5 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-1">
                  <div className="font-bold text-[13.5px] text-blue-700 dark:text-blue-300">RAG Context Grounding</div>
                  <div className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">Atomic claim extraction & reference document overlap verification.</div>
                </div>
                <div className="p-3.5 rounded-lg bg-purple-500/5 border border-purple-500/20 space-y-1">
                  <div className="font-bold text-[13.5px] text-purple-700 dark:text-purple-300">Multi-Turn Decay Tracker</div>
                  <div className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">Rolling session accumulator (alpha = 0.85) to stop salami-slicing attacks.</div>
                </div>
                <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1">
                  <div className="font-bold text-[13.5px] text-amber-700 dark:text-amber-300">AI-as-a-Judge Tier</div>
                  <div className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">Invoked only on ambiguous scores (0.40 - 0.70) to evaluate nuance.</div>
                </div>
              </div>
            </div>
            <ArrowDown className="w-5 h-5 text-primary my-2" />
          </div>

          {/* Step 4: Decision Matrix */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">STAGE 4: Automated Policy Decision Routing</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full max-w-3xl">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase font-mono">ALLOW</div>
                <p className="text-[12px] text-slate-700 dark:text-slate-300">Clean prompt passes straight to LLM with 0 delay.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center space-y-1">
                <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase font-mono">MASK / REDACT</div>
                <p className="text-[12px] text-slate-700 dark:text-slate-300">Auto-redacts PII/keys to `[REDACTED_...]` and sends safely.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                <div className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase font-mono">CONFIRM (HITL)</div>
                <p className="text-[12px] text-slate-700 dark:text-slate-300">Routes to Human Review Queue for explicit sign-off.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center space-y-1">
                <div className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase font-mono">BLOCK</div>
                <p className="text-[12px] text-slate-700 dark:text-slate-300">Hard-halts prompt. Prevents data egress.</p>
              </div>
            </div>
            <ArrowDown className="w-5 h-5 text-primary my-2" />
          </div>

          {/* Step 5: Audit & Closed Loop Feedback */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl p-4 rounded-xl bg-white dark:bg-dark-850 border border-emerald-500/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <span className="font-bold text-[13.5px] text-slate-900 dark:text-white">STAGE 5: Cryptographic Audit & Feedback Auto-Tuning</span>
                  <p className="text-[12px] text-slate-600 dark:text-slate-400">Every interception is linked into a SHA-256 tamper-evident hash chain and updates the Trust Index.</p>
                </div>
              </div>
              <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded font-bold whitespace-nowrap">
                SHA-256 Chained
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Specifications Table */}
      <section id="technology-stack" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Core Technology Components</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Component</th>
                <th className="py-3.5 px-4">File Path</th>
                <th className="py-3.5 px-4">Technical Responsibilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 text-[13px]">
              <tr>
                <td className="py-3.5 px-4 font-bold text-primary dark:text-primary-light">Master Orchestrator</td>
                <td className="py-3.5 px-4 font-mono text-[12px]">backend/app/connector/guardrail.py</td>
                <td className="py-3.5 px-4">Coordinates the 9 evaluator modules and computes composite P/C/R scores</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-primary dark:text-primary-light">PII & Secret Engine</td>
                <td className="py-3.5 px-4 font-mono text-[12px]">backend/app/connector/evaluators/pii.py</td>
                <td className="py-3.5 px-4">Luhn validation, regex redaction, and API token sanitization</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-primary dark:text-primary-light">RAG Grounding Engine</td>
                <td className="py-3.5 px-4 font-mono text-[12px]">backend/app/connector/evaluators/grounding.py</td>
                <td className="py-3.5 px-4">Atomic claim extraction, context-faithfulness evaluation, and Google Serper API fallback</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-primary dark:text-primary-light">Zero-LLM Guardian</td>
                <td className="py-3.5 px-4 font-mono text-[12px]">backend/app/connector/evaluators/guardian.py</td>
                <td className="py-3.5 px-4">7 deterministic security checks and SHA-256 cryptographic hash chaining</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-primary dark:text-primary-light">HITL Review Queue</td>
                <td className="py-3.5 px-4 font-mono text-[12px]">backend/app/models/db/reviews.py</td>
                <td className="py-3.5 px-4">Human review decision persistence and closed-loop feedback threshold auto-tuning</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-primary dark:text-primary-light">Chrome Extension Shield</td>
                <td className="py-3.5 px-4 font-mono text-[12px]">frontend/extension/content.js</td>
                <td className="py-3.5 px-4">Client-side form interception across ChatGPT, Claude, Gemini, Copilot, and DeepSeek</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
