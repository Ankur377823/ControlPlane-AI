import React from 'react';

export function FaqDoc() {
  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-brand tracking-tight">
          Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
          Answers to common questions regarding latency, data security, and evaluation tiers.
        </p>
      </div>

      <section id="faq-questions" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">How does ControlPlane achieve sub-15ms fast-path performance?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fast-path evaluators (PII regex matching, injection keyword heuristics, token budget counters) run purely deterministic code without calling external LLMs. Deep grounding or AI-as-a-Judge evaluators are invoked out-of-band or only when ambiguity scores require secondary verification.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">How does the SHA-256 tamper-evident log integrity work?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every intercepted telemetry record stores the SHA-256 hash of its contents combined with the hash of the preceding record (genesis hash for first entry). Any retroactive modification or deletion causes a hash mismatch in all subsequent nodes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
