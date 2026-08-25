import React from 'react';

export function PlatformGuideDoc() {
  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-brand tracking-tight">
          Security Policies & Enforcement Rules
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
          ControlPlane AI enforces configurable safety guardrail rules, PII redaction sensitivity levels, and compliance frameworks across all monitored endpoints.
        </p>
      </div>

      <section id="policy-modes" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Enforcement Modes</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">BLOCK</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Immediately halts the user prompt or tool call submission upon identifying severe security threats (e.g. system prompt extraction, authorization bypass, dangerous wire transfer actions).
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">MASK</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Automatically sanitizes and replaces PII (credit card numbers, emails, phone numbers, SSNs, and passwords) with token placeholders before forwarding the cleaned prompt to the AI model.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">MONITOR</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Audits and logs telemetry records into the Risk Findings feed with full context without interrupting the user conversation.
            </div>
          </div>
        </div>
      </section>

      <section id="compliance-frameworks" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Regulatory Compliance Frameworks</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside leading-relaxed">
          <li><strong className="text-slate-900 dark:text-white">GLOBAL_DEFAULT:</strong> Baseline safety, injection shields, and standard credential masking.</li>
          <li><strong className="text-slate-900 dark:text-white">EU_GDPR:</strong> Strict personal data protection, mandatory right-to-be-forgotten redaction, and consent logging.</li>
          <li><strong className="text-slate-900 dark:text-white">US_HIPAA:</strong> Protected Health Information (PHI) shielding and patient identifier masking.</li>
        </ul>
      </section>
    </div>
  );
}
