import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

const DOC_SECTIONS = [
  { id: 'overview', title: '🏗️ 1. Architecture & Pipeline' },
  { id: 'dashboard', title: '📊 2. Dashboard & Trust Index' },
  { id: 'resources', title: '📦 3. Resources & Policies' },
  { id: 'runtime', title: '🤖 4. Agent Runtime & Tools' },
  { id: 'hitl', title: '👥 5. HITL Review Queue' },
  { id: 'multiturn', title: '📈 6. Multi-Turn Session Risk' },
  { id: 'aijudge', title: '⚖️ 7. AI-as-a-Judge Fallback' },
  { id: 'grounding', title: '🔬 8. RAG Factuality & Grounding' },
  { id: 'findings', title: '🛡️ 9. Risk Findings Grid' },
  { id: 'events', title: '🔍 10. Event Telemetry Log' },
  { id: 'redteam', title: '🎯 11. Red Team Scanner' },
  { id: 'extension', title: '🔌 12. Chrome Extension' },
  { id: 'security', title: '🔐 13. Evaluators & Hash Chain' },
  { id: 'api', title: '💻 14. REST API & Recipes' },
];

export function DocumentationView() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary dark:text-primary-light">
          <BookOpen className="w-5 h-5" />
          <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Documentation & Integration Guide</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Complete architectural guide, security evaluation pipeline, and REST API recipes for ControlPlane AI.
        </p>
      </div>

      {/* Main Doc Grid */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="space-y-1.5 lg:border-r lg:border-slate-200 lg:dark:border-white/10 lg:pr-6">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Sections</div>
          {DOC_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === sec.id
                  ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {sec.title}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="font-brand text-xl font-bold text-slate-900 dark:text-white">🏗️ 1. Architecture & Pipeline</h3>
              <p>
                <strong className="text-slate-900 dark:text-white">ControlPlane AI</strong> is an enterprise-grade Responsible AI Governance Control Plane and
                real-time security shield inserting a deterministic sub-15ms interception layer between users, autonomous
                agent runtimes, and LLM backends (Botpress, OpenAI GPT-4o, Claude 3.5, Gemini, DeepSeek).
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 space-y-2">
                <div className="text-xs font-bold text-primary dark:text-accent-cyan">Unified Interception Pipeline:</div>
                <pre className="text-[11px] font-mono text-slate-800 dark:text-cyan-200 overflow-x-auto whitespace-pre p-3 bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-transparent">
{`[Incoming User Prompt / Agent Tool Call]
       │
       ▼
[Fast-Path Deterministic Layer: PII, Injection Shield, Bias, Cost (<15ms)]
       │
   ┌───┴────────────────────────────────┐
   ▼                                    ▼
[Clear Result]             [Borderline / RAG Context Check]
   │                                    │
   │                         [Evidence Grounding / Context Faithfulness]
   │                                    │
   │                         [AI-as-a-Judge Secondary Fallback (0.4-0.7)]
   │                                    │
   └───┬────────────────────────────────┘
       ▼
[Decision Engine: ALLOW | MASK | CONFIRM_REQUIRED | BLOCK]
       │
       ├─► [SHA-256 Cryptographic Hash Chain Audit Trail]
       └─► [Human Review Queue & Feedback Threshold Auto-Tuning]`}
                </pre>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm pt-2">Technology Stack:</h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-dark-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-dark-800/90 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Component</th>
                      <th className="py-2.5 px-3">Technology</th>
                      <th className="py-2.5 px-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-primary dark:text-primary-light">Backend API</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200">Python 3.11+ / FastAPI / Uvicorn</td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">High-throughput asynchronous REST gateway</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-primary dark:text-primary-light">Dual Database</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200">SQLite / PostgreSQL</td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">Zero-config local DB + cloud persistent multi-tenant ORM</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-primary dark:text-primary-light">Frontend Studio</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200">React 18 + Vite + Tailwind CSS</td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">Componentized SPA with live telemetry & HITL controls</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-primary dark:text-primary-light">Browser Shield</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200">Chrome Manifest V3 Extension</td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">Client-side prompt interception & transparent PII masking</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <h3 className="font-brand text-xl font-bold text-slate-900 dark:text-white">📊 2. Executive Dashboard & Trust Index</h3>
              <p>
                The Executive Dashboard aggregates telemetry from all active resources, displaying real-time security
                velocity, governance scores, and automated trust metrics.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">Trustworthiness Index Formula:</div>
                <code className="text-primary dark:text-accent-cyan font-mono block p-2 bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-transparent font-bold">
                  Trust = (Precision × 0.6) + (Recall × 0.4)
                </code>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Calibrated by reviewer feedback in the Human-in-the-Loop review queue.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <h3 className="font-brand text-xl font-bold text-slate-900 dark:text-white">💻 14. REST API & Integration Recipes</h3>
              <p>Sample Python and cURL code snippets for interacting with the ControlPlane gateway:</p>

              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Python Fast-Check Recipe:</div>
                <pre className="text-[11px] font-mono text-emerald-800 dark:text-emerald-200 bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl border border-slate-200 dark:border-white/10 overflow-x-auto whitespace-pre">
{`import requests

url = "http://localhost:8000/api/v1/resources/res_demo/check"
payload = {
    "user_prompt": "My credit card is 4532-1234-5678-9010",
    "tool_call": None
}
headers = {"X-Tenant-ID": "ankur-tenant-1"}

res = requests.post(url, json=payload, headers=headers)
data = res.json()
print("Action:", data["action"]) # MASK or BLOCK
print("Sanitized Prompt:", data["sanitized_prompt"])`}
                </pre>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'dashboard' && activeTab !== 'api' && (
            <div className="space-y-4">
              <h3 className="font-brand text-xl font-bold text-slate-900 dark:text-white">
                {DOC_SECTIONS.find((s) => s.id === activeTab)?.title}
              </h3>
              <p>
                Detailed architectural specification and runtime guardrail protocols for {activeTab}.
                All evaluations run in sub-15ms with full SHA-256 tamper-evident hash chaining.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-xs">
                Refer to the <code className="text-primary dark:text-accent-cyan font-semibold">DESIGN.md</code> and{' '}
                <code className="text-primary dark:text-accent-cyan font-semibold">README.md</code> in the repository root for comprehensive implementation schemas and verification logs.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
