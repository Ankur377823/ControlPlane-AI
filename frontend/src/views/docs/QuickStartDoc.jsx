import React from 'react';

export function QuickStartDoc() {
  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-brand tracking-tight">
          ControlPlane Quick Start Guide
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
          Follow these steps to launch the ControlPlane AI studio, onboard a Botpress chatbot or LLM endpoint, and verify prompt guardrails.
        </p>
      </div>

      <section id="docker-start" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>1. Launch ControlPlane with Docker</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
          <pre className="text-xs font-mono text-emerald-800 dark:text-emerald-300 overflow-x-auto whitespace-pre p-3 bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-transparent">
{`# 1. Start ControlPlane Docker container
docker-compose up --build

# 2. Access Studio in your web browser:
# http://localhost:8000/

# Authentication:
# Configure ADMIN_USERNAME and ADMIN_PASSWORD in your private .env file`}

          </pre>
        </div>
      </section>

      <section id="onboard-first-resource" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>2. Register a Monitored Chatbot or Endpoint</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside leading-relaxed">
          <li>Navigate to <strong className="text-slate-900 dark:text-white font-semibold">Monitored Resources</strong> in the left sidebar.</li>
          <li>Click <strong className="text-slate-900 dark:text-white font-semibold">Onboard New Resource</strong>.</li>
          <li>Select the <strong className="text-slate-900 dark:text-white font-semibold">Botpress Connector</strong> preset.</li>
          <li>Enter your Account Name, Bot Name, and Webhook ID (e.g. <code>5e89a2b1-4f1c-490b-928d-318e860bc904</code>).</li>
          <li>Click <strong className="text-slate-900 dark:text-white font-semibold">Save & Onboard Resource</strong>.</li>
        </ol>
      </section>

      <section id="run-red-team" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>3. Run Red Team Scanner & Download PDF Audit</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Open the <strong className="text-slate-900 dark:text-white font-semibold">AI Red Team Scanner</strong>, pick the <strong className="text-slate-900 dark:text-white font-semibold">System Prompt Extraction Suite</strong> or <strong className="text-slate-900 dark:text-white font-semibold">PII & Secret Disclosure Suite</strong>, and execute the audit scan. Click <strong className="text-slate-900 dark:text-white font-semibold">Export PDF Report</strong> to save the compliance document.
        </p>
      </section>

      <section id="extension-install" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>4. Chrome Extension Client-Side Guarding</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside leading-relaxed">
          <li>Generate an activation token under <strong className="text-slate-900 dark:text-white font-semibold">Enrollment Tokens</strong>.</li>
          <li>Load the unpacked extension from <code>frontend/extension/</code> into Chrome.</li>
          <li>Click <strong className="text-slate-900 dark:text-white font-semibold">Auto-Enroll Extension</strong> in the extension popup to start active protection.</li>
        </ol>
      </section>
    </div>
  );
}
