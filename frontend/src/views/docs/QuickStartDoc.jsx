import React from 'react';

export function QuickStartDoc() {
  return (
    <div className="space-y-10 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-brand tracking-tight">
          ControlPlane Quick Start Guide
        </h1>
        <p className="text-[16px] sm:text-[17px] text-slate-700 dark:text-slate-200 mt-4 leading-relaxed font-normal">
          Follow these steps to launch ControlPlane AI with live Docker Watch, enforce regulatory compliance policies, and verify sub-15ms guardrails.
        </p>
      </div>

      <section id="docker-start" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>1. Launch ControlPlane with Docker (Live Hot-Reload / Watch Mode)</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
          <pre className="text-[13.5px] font-mono text-emerald-800 dark:text-emerald-300 overflow-x-auto whitespace-pre p-3 bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-transparent leading-normal">
{`# 1. Start ControlPlane Docker container with Live Watch Mode
docker compose up --build --watch

# 2. Access Studio in your web browser:
# http://localhost:8000/

# 3. Access Swagger REST API Documentation:
# http://localhost:8000/docs`}
          </pre>
        </div>
        <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
          The <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-primary font-mono text-[13px]">--watch</code> flag leverages Docker Compose File Watch to automatically synchronize changes to backend Python files and frontend React components directly into the container with zero manual rebuilds!
        </p>
      </section>

      <section id="policies-preset" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>2. Apply All-in-One Master Shield or Regional Presets</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <ol className="space-y-3 text-[15px] text-slate-700 dark:text-slate-300 list-decimal list-inside leading-relaxed pl-1">
          <li>Navigate to <strong className="text-slate-900 dark:text-white font-semibold">Security Center &rarr; Policies</strong>.</li>
          <li>Click <strong className="text-slate-900 dark:text-white font-semibold">Apply All-in-One Master Shield</strong> for Smart Hybrid Governance (auto-masks PII while hard-blocking attacks).</li>
          <li>Or choose individual frameworks: <strong className="text-slate-900 dark:text-white font-semibold">EU AI Act</strong>, <strong className="text-slate-900 dark:text-white font-semibold">US HIPAA</strong>, <strong className="text-slate-900 dark:text-white font-semibold">EU GDPR</strong>, or <strong className="text-slate-900 dark:text-white font-semibold">SEC Reg SCI</strong>.</li>
          <li>Click <strong className="text-slate-900 dark:text-white font-semibold">View Policy Details &rarr;</strong> to inspect exact prompt examples and legal mandates.</li>
        </ol>
      </section>

      <section id="extension-install" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>3. Connect Chrome Extension Network Shield</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <ol className="space-y-3 text-[15px] text-slate-700 dark:text-slate-300 list-decimal list-inside leading-relaxed pl-1">
          <li>Open <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-primary font-mono text-[13px]">chrome://extensions</code> in Google Chrome and enable <strong className="text-slate-900 dark:text-white font-semibold">Developer mode</strong>.</li>
          <li>Click <strong className="text-slate-900 dark:text-white font-semibold">Load unpacked</strong> and select the directory <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-primary font-mono text-[13px]">c:\ControlPlane\frontend\extension</code>.</li>
          <li>Open <a href="https://chatgpt.com" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">chatgpt.com</a> or <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">claude.ai</a> to see the active guardrail banner.</li>
        </ol>
      </section>

      <section id="run-red-team" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>4. Human-in-the-Loop Review Queue & Telemetry</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <p className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          Check the <strong className="text-slate-900 dark:text-white font-semibold">HITL Review Queue</strong> to approve or override flagged prompts. Reviewer feedback automatically updates the live <strong className="text-slate-900 dark:text-white font-semibold">Trustworthiness Index</strong> and false positive rates on the Dashboard.
        </p>
      </section>
    </div>
  );
}
