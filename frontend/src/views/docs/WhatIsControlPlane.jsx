import React from 'react';

export function WhatIsControlPlane() {
  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-brand tracking-tight">
          What is ControlPlane AI?
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
          ControlPlane AI is an enterprise-grade <strong className="text-slate-900 dark:text-white font-semibold">Responsible AI (RAI) Governance Control Plane</strong>, real-time guardrail shield, and security monitoring studio. It provides a deterministic, sub-15ms interface to evaluate, audit, sanitize, and intercept LLM interactions, Botpress chatbots, agent tool executions, and endpoint AI chats.
        </p>
      </div>

      <section id="the-problem" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>The Security Challenge</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          As enterprise applications integrate autonomous LLM agents and chatbots into production, organizations face severe security and compliance challenges:
        </p>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-slate-900 dark:text-white font-semibold">Prompt Injection & Jailbreaks:</strong> Adversarial prompts manipulating system instructions, bypassing authorization checks, or extracting confidential system prompts.
          </li>
          <li>
            <strong className="text-slate-900 dark:text-white font-semibold">PII & Secret Leaks:</strong> Credit card numbers, emails, phone numbers, passwords, and API keys inadvertently submitted into foundation models.
          </li>
          <li>
            <strong className="text-slate-900 dark:text-white font-semibold">Autonomous Tool Misuse:</strong> AI agents calling destructive functions (e.g. wire transfers, file deletion, unauthorized broadcast emails) without human confirmation.
          </li>
          <li>
            <strong className="text-slate-900 dark:text-white font-semibold">Multi-Turn Social Engineering:</strong> Gradual adversarial probing across continuous chat turns to bypass one-shot filters.
          </li>
          <li>
            <strong className="text-slate-900 dark:text-white font-semibold">Audit Integrity:</strong> Inability to prove that security logs have not been altered or deleted after a breach.
          </li>
        </ul>
      </section>

      <section id="core-capabilities" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Core System Modules</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Sub-15ms Fast-Path Guardrail</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Deterministic regex and pattern evaluators in <code>pii.py</code>, <code>injection.py</code>, <code>bias_safety.py</code>, and <code>cost.py</code> executing under 15ms with zero model latency penalty.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Action Risk Tiers (LOW to CRITICAL)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              State-machine tool interception classifying agent execution into LOW (ALLOW), MEDIUM (MONITOR), HIGH (CONFIRM_REQUIRED), and CRITICAL (BLOCK).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">FacTool Factuality & Grounding</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Automated claim extraction and live search verification across Knowledge QA, Math, Code, and Scientific Literature with confidence scoring.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">SHA-256 Tamper-Evident Audit Chain</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cryptographically linked hash chain connecting every intercepted payload and decision, ensuring forensic logs cannot be modified post-hoc.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-deploys" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Supported Integration Modes</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            <strong className="text-slate-900 dark:text-white">1. REST API Guardrail Endpoint:</strong> Intercept and sanitize user prompts before sending them to your LLM backends via <code>/api/v1/resources/&#123;id&#125;/check</code>.
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">2. Botpress Connector:</strong> Direct webhook validation, probe auditing, and runtime monitoring for Botpress Cloud bots.
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">3. Chrome Manifest V3 Extension:</strong> Zero-configuration client-side prompt interception for ChatGPT, Claude, Gemini, DeepSeek, and Kimi.
          </p>
        </div>
      </section>
    </div>
  );
}
