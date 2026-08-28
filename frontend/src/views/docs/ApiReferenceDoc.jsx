import React from 'react';

export function ApiReferenceDoc() {
  return (
    <div className="space-y-10 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-brand tracking-tight">
          ControlPlane REST API Reference
        </h1>
        <p className="text-[16px] sm:text-[17px] text-slate-700 dark:text-slate-200 mt-4 leading-relaxed font-normal">
          High-performance REST API endpoints for real-time prompt checking, scan execution, and policy configuration.
        </p>
      </div>

      <section id="check-endpoint" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>POST /api/v1/resources/&#123;resource_id&#125;/check</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <p className="text-[15px] text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
          Executes deterministic sub-15ms guardrail evaluation and agent action risk classification.
        </p>

        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Request Body</div>
          <pre className="text-[13.5px] font-mono text-slate-800 dark:text-emerald-300 bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-pre leading-normal">
{`{
  "user_prompt": "My credit card is 4532-1234-5678-9010",
  "tool_call": {
    "name": "delete_file",
    "parameters": {"path": "/var/log/audit.log"}
  },
  "session_id": "sess_10293847"
}`}
          </pre>
        </div>

        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Response Body</div>
          <pre className="text-[13.5px] font-mono text-slate-800 dark:text-emerald-300 bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-pre leading-normal">
{`{
  "action": "CONFIRM_REQUIRED",
  "sanitized_prompt": "My credit card is [CREDIT_CARD_REDACTED]",
  "action_risk_tier": "HIGH",
  "latency_ms": 3.8,
  "triggered_rules": ["PII_CREDIT_CARD", "DESTRUCTIVE_FILE_ACTION"],
  "hash_chain": "a8fbc7304918e..."
}`}
          </pre>
        </div>
      </section>

      <section id="scan-endpoint" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>POST /api/v1/resources/&#123;resource_id&#125;/scan</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <p className="text-[15px] text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
          Executes automated adversarial vulnerability probes against target Botpress webhooks.
        </p>
      </section>

      <section id="hallucination-endpoint" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>POST /api/v1/hallucination/verify</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <p className="text-[15px] text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
          Performs FacTool atomic claim extraction and factuality verification across QA, Math, Code, and Scientific categories.
        </p>
      </section>
    </div>
  );
}
