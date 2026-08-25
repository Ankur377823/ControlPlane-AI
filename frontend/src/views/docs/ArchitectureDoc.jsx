import React from 'react';

export function ArchitectureDoc() {
  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-brand tracking-tight">
          ControlPlane AI System Architecture
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
          ControlPlane AI is engineered with a layered pipeline combining deterministic sub-15ms fast-path evaluators, RAG evidence grounding, agent action risk state-machines, and cryptographic audit persistence.
        </p>
      </div>

      <section id="pipeline-overview" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Interception & Decision Pipeline</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
          <pre className="text-xs font-mono text-slate-800 dark:text-cyan-200 overflow-x-auto whitespace-pre p-4 bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-transparent leading-relaxed">
{`[User Input / Agent Tool Call Request]
       │
       ▼
[Deterministic Fast-Path Shield (<15ms)]
 ├── PII Masking & Regex Redaction (pii.py)
 ├── Prompt Injection & Jailbreak Defense (injection.py)
 ├── Toxicity & Bias Filter (bias_safety.py)
 └── Token Budget Limits (cost.py)
       │
       ├──► [Compound Agent Action Risk (action_risk.py)] -> LOW | MED | HIGH | CRITICAL
       ├──► [Multi-Turn Time-Decayed Risk (multi_turn_risk.py)]
       └──► [FacTool Claim Grounding (grounding.py)]
       │
       ▼
[Master Orchestrator (guardrail.py)]
 └── Outputs Action: ALLOW | MASK | CONFIRM_REQUIRED | BLOCK | MONITOR
       │
       ├─► [SHA-256 Cryptographic Hash Chain (audit_hash.py)]
       └─► [Human-in-the-Loop Review Queue (reviews.py)]`}
          </pre>
        </div>
      </section>

      <section id="technology-stack" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Technology & Layer Specifications</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Component</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-3 px-4 font-bold text-primary dark:text-primary-light">FastAPI Backend</td>
                <td className="py-3 px-4 font-mono">backend/app/main.py</td>
                <td className="py-3 px-4">Asynchronous REST API running on port 8000</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-primary dark:text-primary-light">Evaluators Engine</td>
                <td className="py-3 px-4 font-mono">backend/app/connector/evaluators/</td>
                <td className="py-3 px-4">PII, Injection, Toxicity, Grounding, Action Risk, and Multi-turn Risk</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-primary dark:text-primary-light">Botpress Connector</td>
                <td className="py-3 px-4 font-mono">backend/app/connector/scanner.py</td>
                <td className="py-3 px-4">Adversarial probe execution and PDF audit generator</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-primary dark:text-primary-light">Storage Layer</td>
                <td className="py-3 px-4 font-mono">backend/app/models/db/</td>
                <td className="py-3 px-4">SQLite WAL mode (local) / PostgreSQL (cloud)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-primary dark:text-primary-light">React 18 SPA</td>
                <td className="py-3 px-4 font-mono">frontend/src/</td>
                <td className="py-3 px-4">Enterprise studio with real-time telemetry and HITL queue</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-primary dark:text-primary-light">Chrome Extension</td>
                <td className="py-3 px-4 font-mono">frontend/extension/</td>
                <td className="py-3 px-4">Manifest V3 endpoint prompt guarding across 5 platforms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
