import React from 'react';

export function FaqDoc() {
  return (
    <div className="space-y-10 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-brand tracking-tight">
          Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-[16px] sm:text-[17px] text-slate-700 dark:text-slate-200 mt-4 leading-relaxed font-normal">
          Answers to common questions regarding latency, data security, and evaluation tiers.
        </p>
      </div>

      <section id="faq-questions" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
            <h3 className="font-bold text-[15px] sm:text-[16px] text-slate-900 dark:text-white font-brand">How does ControlPlane achieve sub-15ms fast-path performance?</h3>
            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Fast-path evaluators (PII regex matching, injection keyword heuristics, token budget counters) run purely deterministic code without calling external LLMs. Deep grounding or AI-as-a-Judge evaluators are invoked out-of-band or only when ambiguity scores require secondary verification.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
            <h3 className="font-bold text-[15px] sm:text-[16px] text-slate-900 dark:text-white font-brand">How does the SHA-256 tamper-evident log integrity work?</h3>
            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Every intercepted telemetry record stores the SHA-256 hash of its contents combined with the hash of the preceding record (genesis hash for first entry). Any retroactive modification or deletion causes a hash mismatch in all subsequent nodes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
