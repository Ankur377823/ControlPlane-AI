import React from 'react';

export function PlatformGuideDoc() {
  return (
    <div className="space-y-10 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-brand tracking-tight">
          Security Policies & Enforcement Rules
        </h1>
        <p className="text-[16px] sm:text-[17px] text-slate-700 dark:text-slate-200 mt-4 leading-relaxed font-normal">
          ControlPlane AI enforces adaptive safety guardrails, PII redaction sensitivity levels, and one-click regulatory compliance frameworks.
        </p>
      </div>

      <section id="policy-modes" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Enforcement Modes</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="space-y-3.5 text-slate-700 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white text-[15px]">BLOCK</div>
            <div className="text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Immediately halts the user prompt or tool call submission upon identifying severe security threats (e.g. system prompt extraction, authorization bypass, dangerous wire transfer actions).
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white text-[15px]">MASK (Smart Redaction)</div>
            <div className="text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Automatically sanitizes and replaces PII (credit cards, emails, phone numbers, SSNs, and API keys) with token placeholders like <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-primary font-mono text-[12.5px]">[REDACTED_CREDIT_CARD]</code> before forwarding the cleaned prompt to the AI model.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white text-[15px]">CONFIRM_REQUIRED (HITL Review)</div>
            <div className="text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Routes ambiguous or high-risk tool actions (e.g. database deletes, external emails, wire transfers) to the Human-in-the-Loop review queue for explicit approval.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white text-[15px]">MONITOR</div>
            <div className="text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Audits and logs telemetry records into the Risk Findings feed with full context without interrupting the user conversation.
            </div>
          </div>
        </div>
      </section>

      <section id="compliance-frameworks" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>One-Click Regulatory Framework Presets</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-slate-700 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-emerald-500/30 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white text-sm">All-in-One Enterprise Master Shield</div>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">Smart Hybrid Defense: Auto-masks PII to prevent alert fatigue, while hard-blocking adversarial jailbreaks, malware, and destructive OS commands.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white text-sm">EU AI Act High-Risk Tier</div>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">Articles 14 & 15 compliance: Continuous human oversight for scores &lt; 0.85, jailbreak blocking, system prompt extraction defense.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white text-sm">US HIPAA Safe Harbor</div>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">Zero-tolerance 18-PHI identifier redaction, patient clinical claim verification, medical record protection.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white text-sm">EU GDPR Strict Privacy</div>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">Article 22 automated decision defense, client-side token masking for PII, cryptographically hashed audit trails.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white text-sm">SEC Reg SCI Financial Advisory</div>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">Strict arithmetic factuality, financial claims grounding, unauthorized wire transfer blocks.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white text-sm">Internal Copilot (Balanced)</div>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">High throughput (4096 tokens), credential masking without halting employee productivity.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
