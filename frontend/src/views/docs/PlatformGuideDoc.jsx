import React from 'react';

export function PlatformGuideDoc() {
  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-brand tracking-tight">
          Security Policies & Enforcement Rules
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
          ControlPlane AI enforces adaptive safety guardrails, PII redaction sensitivity levels, and one-click regulatory compliance frameworks.
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
            <div className="font-bold text-slate-900 dark:text-white">MASK (Smart Redaction)</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Automatically sanitizes and replaces PII (credit cards, emails, phone numbers, SSNs, and API keys) with token placeholders like <code>[REDACTED_CREDIT_CARD]</code> before forwarding the cleaned prompt to the AI model.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">CONFIRM_REQUIRED (HITL Review)</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Routes ambiguous or high-risk tool actions (e.g. database deletes, external emails, wire transfers) to the Human-in-the-Loop review queue for explicit approval.
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
          <span>One-Click Regulatory Framework Presets</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-emerald-500/30 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white text-xs">All-in-One Enterprise Master Shield</div>
            <p className="text-[11px] text-slate-500">Smart Hybrid Defense: Auto-masks PII to prevent alert fatigue, while hard-blocking adversarial jailbreaks, malware, and destructive OS commands.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white text-xs">EU AI Act High-Risk Tier</div>
            <p className="text-[11px] text-slate-500">Articles 14 & 15 compliance: Continuous human oversight for scores &lt; 0.85, jailbreak blocking, system prompt extraction defense.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white text-xs">US HIPAA Safe Harbor</div>
            <p className="text-[11px] text-slate-500">Zero-tolerance 18-PHI identifier redaction, patient clinical claim verification, medical record protection.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white text-xs">EU GDPR Strict Privacy</div>
            <p className="text-[11px] text-slate-500">Article 22 automated decision defense, client-side token masking for PII, cryptographically hashed audit trails.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white text-xs">SEC Reg SCI Financial Advisory</div>
            <p className="text-[11px] text-slate-500">Strict arithmetic factuality, financial claims grounding, unauthorized wire transfer blocks.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white text-xs">Internal Copilot (Balanced)</div>
            <p className="text-[11px] text-slate-500">High throughput (4096 tokens), credential masking without halting employee productivity.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
