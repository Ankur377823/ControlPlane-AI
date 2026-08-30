import React from 'react';
import { Shield, Zap, Filter, Scale, Eye, Cpu, Database, CheckCircle2, ArrowRight, Lock, Layers, Activity, FileText, Check, Chrome, Server, Webhook, UserCheck, Flame, Microscope } from 'lucide-react';

export function ArchitectureDoc() {
  return (
    <div className="space-y-10 animate-fade-in text-slate-800 dark:text-slate-200 font-sans leading-relaxed max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wider font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>CONTROLPLANE AI // TECHNICAL SPECIFICATIONS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          Multi-Tier Interception & End-to-End System Architecture
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl font-sans font-medium">
          ControlPlane AI is engineered with a sub-15ms fast-path pipeline combining deterministic pattern filters, RAG evidence-grounding, state-machine agent safety, and cryptographic audit persistence.
        </p>
      </div>

      {/* Visual System Architecture Diagram */}
      <section id="architecture-diagram" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <Activity className="w-5 h-5 text-primary" />
            <span>Interactive System Topology & Data Flow Diagram</span>
          </h2>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            SUB-15MS FAST-PATH PIPELINE
          </span>
        </div>

        {/* Styled Architecture Flow Diagram Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            
            {/* Stage 1: Ingress Layer */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase font-mono">
                <Chrome className="w-4 h-4" />
                <span>1. Ingress Layer</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  <div className="font-bold flex items-center gap-1.5"><Chrome className="w-3.5 h-3.5 text-blue-500" /> Chrome Extension</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">ChatGPT, Claude, Gemini, DeepSeek</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  <div className="font-bold flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-purple-500" /> REST AI Gateway</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">/v1/chat/completions proxy</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  <div className="font-bold flex items-center gap-1.5"><Webhook className="w-3.5 h-3.5 text-cyan-500" /> Botpress Webhooks</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Chatbot webhook listener</div>
                </div>
              </div>
            </div>

            {/* Stage 2: 4-Tier Threat Engine */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">
                <Zap className="w-4 h-4" />
                <span>2. 4-Tier Guardrail</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-medium">
                  <div className="font-bold text-[11px] font-mono">Tier 1 (&lt;2ms)</div>
                  <div className="text-[10px] opacity-90">Luhn Mod-10 & Unicode Stripper</div>
                </div>
                <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-900 dark:text-cyan-200 font-medium">
                  <div className="font-bold text-[11px] font-mono">Tier 2 (&lt;8ms)</div>
                  <div className="text-[10px] opacity-90">Vector N-Gram Classifier (134 Tax)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-medium">
                  <div className="font-bold text-[11px] font-mono">Tier 3 (&lt;12ms)</div>
                  <div className="text-[10px] opacity-90">Overlapping Window Chunking</div>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 font-medium">
                  <div className="font-bold text-[11px] font-mono">Tier 4 (~150ms)</div>
                  <div className="text-[10px] opacity-90">Secondary LLM Judge (On-Prem)</div>
                </div>
              </div>
            </div>

            {/* Stage 3: Studio Core & HITL */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase font-mono">
                <UserCheck className="w-4 h-4" />
                <span>3. Studio Core & HITL</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  <div className="font-bold flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-indigo-500" /> Policy Engine</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">5 Regulatory Presets & Rules</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  <div className="font-bold flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-amber-500" /> HITL Review Queue</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Human Approval & Resolution</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  <div className="font-bold flex items-center gap-1.5"><Microscope className="w-3.5 h-3.5 text-emerald-500" /> RAG Grounding</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Serper & Wikipedia verification</div>
                </div>
              </div>
            </div>

            {/* Stage 4: Storage & SHA-256 Chain */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase font-mono">
                <Lock className="w-4 h-4" />
                <span>4. Audit Persistence</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  <div className="font-bold flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-amber-500" /> SHA-256 Hash Chain</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Cryptographic tamper-evident log</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  <div className="font-bold flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-blue-500" /> Database ORM</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">PostgreSQL / SQLite Storage</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  <div className="font-bold flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-rose-500" /> Risk Findings Feed</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Session telemetry & audits</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 1. 4-TIER THREAT CASCADING INTERCEPTION ENGINE */}
      <section id="system-diagram" className="space-y-5 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <Layers className="w-5 h-5 text-emerald-500" />
            <span>[1] 4-Tier Threat Cascading Interception Engine</span>
          </h2>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
            LATENCY &lt; 15MS
          </span>
        </div>

        {/* Tier Cards Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tier 1 */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 uppercase font-mono">
                TIER 1 &lt; 2MS
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">DETERMINISTIC FAST-PATH</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
              Syntax & Unicode Anti-Evasion Stripper
            </h3>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 font-sans">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Strips zero-width formatting code points (<code className="font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-dark-800 px-1 py-0.5 rounded">'Cf'</code>, <code className="font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-dark-800 px-1 py-0.5 rounded">'Cs'</code>, <code className="font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-dark-800 px-1 py-0.5 rounded">'Cc'</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Sanitizes ChatML & Llama-3 instruction headers (<code className="font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-dark-800 px-1 py-0.5 rounded">&lt;|im_start|&gt;</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Validates credit card serials via Luhn Mod-10 algorithm.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Scans secret API keys via Shannon Information Entropy (<code className="font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-dark-800 px-1 py-0.5 rounded">H = -Σ p_i log2 p_i</code>).</span>
              </li>
            </ul>
          </div>

          {/* Tier 2 */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 uppercase font-mono">
                TIER 2 &lt; 8MS
              </span>
              <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 font-mono">VECTOR SPACE CLASSIFIER</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
              Universal Subword N-Gram Projections
            </h3>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 font-sans">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span>Projects prompt into continuous vector space (<code className="font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-dark-800 px-1 py-0.5 rounded">R^d</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span>Computes continuous Cosine Distance against 134 threat centroids.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span>Loads NIST AI RMF & Meta Llama Guard 3 policy taxonomies.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span>Zero-shot generalization across misspellings & multi-lingual inputs.</span>
              </li>
            </ul>
          </div>

          {/* Tier 3 */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 uppercase font-mono">
                TIER 3 &lt; 12MS
              </span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono">SLIDING WINDOW CHUNKING</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
              Overlapping Payload Chunking
            </h3>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 font-sans">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Slices long documents into 450-token overlapping windows.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>100-token stride prevents needle-in-a-haystack payload obfuscation.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Aggregates maximum vector threat distance across all windows.</span>
              </li>
            </ul>
          </div>

          {/* Tier 4 */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 uppercase font-mono">
                TIER 4 ~150MS
              </span>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 font-mono">SECONDARY LLM JUDGE</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
              Borderline Contextual Verdict
            </h3>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 font-sans">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>Invoked strictly for borderline scores (<code className="font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-dark-800 px-1 py-0.5 rounded">0.40 &lt;= Score &lt; 0.70</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>On-premise zero-shot intent reasoning via Ollama without cloud egress.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>Persists cryptographically signed SHA-256 hash chain audit record.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. 5-PHASE COMPREHENSIVE SCANNING PIPELINE */}
      <section id="scanning-pipeline" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <Activity className="w-5 h-5 text-cyan-500" />
            <span>[2] 5-Phase Real-Time Inspection Lifecycle</span>
          </h2>
          <span className="text-xs font-bold text-slate-500 uppercase font-mono">AUTOMATED PIPELINE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-sans">
          <div className="p-4 rounded-xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">PHASE 1</div>
            <div className="font-bold text-slate-900 dark:text-white font-sans">PII & Secrets</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Luhn Mod-10 card check, SSNs, API tokens, Shannon entropy calculation.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
            <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase font-mono">PHASE 2</div>
            <div className="font-bold text-slate-900 dark:text-white font-sans">Unicode Evasion</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Zero-width stripper, homoglyph normalization, ChatML delimiter sanitization.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase font-mono">PHASE 3</div>
            <div className="font-bold text-slate-900 dark:text-white font-sans">Vector Threat</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              N-gram subword frequency projection against 134 threat centroids.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
            <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase font-mono">PHASE 4</div>
            <div className="font-bold text-slate-900 dark:text-white font-sans">Content Safety</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Pediatric harm, pregnancy contraindications, toxic ingestion, DIY surgery.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
            <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase font-mono">PHASE 5</div>
            <div className="font-bold text-slate-900 dark:text-white font-sans">Session Risk</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Exponential risk decay formula tracking multi-turn privilege escalation.
            </div>
          </div>
        </div>
      </section>

      {/* 3. POLICY ARCHETYPES & COMPLIANCE RULES */}
      <section id="policy-frameworks" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <FileText className="w-5 h-5 text-amber-500" />
            <span>[3] Regulatory Policy Archetypes</span>
          </h2>
          <span className="text-xs font-bold text-slate-500 uppercase font-mono">5 PRESETS</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white font-mono">
                <th className="p-3 font-bold">Policy Archetype</th>
                <th className="p-3 font-bold">Action Mode</th>
                <th className="p-3 font-bold">Algorithmic Safeguard</th>
                <th className="p-3 font-bold">Core Threat Defenses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-3 font-bold text-slate-900 dark:text-white">Customer Support</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20 font-mono">MASK</span></td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">Luhn Mod-10 + RFC Regexes</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">Customer credit cards, phone numbers, competitor steering, DAN jailbreaks.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900 dark:text-white">Internal Copilot</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 font-mono">MASK + AUDIT</span></td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">Shannon Entropy + MNPI Cluster</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">Accidental API key leaks, database connection URIs, unreleased Q3 EBITDA margins.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900 dark:text-white">Healthcare HIPAA</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20 font-mono">BLOCK</span></td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">Universal Gestational & Medical Centroids</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">Bulk patient chart dumps, third-trimester Misoprostol dosage, pediatric opioid overdoses.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900 dark:text-white">Autonomous Agents</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20 font-mono">CONFIRM_REQUIRED</span></td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">State Machine Action Risk Matrix</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">Destructive OS commands (<code className="text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-dark-800 px-1 py-0.5 rounded font-mono">DROP TABLE</code>, <code className="text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-dark-800 px-1 py-0.5 rounded font-mono">sudo rm -rf /</code>), treasury wire transfers.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900 dark:text-white">Global GDPR Privacy</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 font-mono">REDACT</span></td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">Unicode NFKC Normalizer</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">International IBANs, passports, tax IDs, zero-width obfuscation, homoglyphs.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
