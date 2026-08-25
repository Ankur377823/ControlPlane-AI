import React from 'react';

export function TroubleshootingDoc() {
  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-brand tracking-tight">
          Errors & Troubleshooting
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
          Diagnosis steps and resolutions for common integration issues in ControlPlane AI.
        </p>
      </div>

      <section id="common-errors" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Common Issues & Solutions</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Botpress Webhook Validation Failed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ensure the Webhook ID matches the UUID provided in your Botpress Cloud dashboard (e.g. <code>5e89a2b1-4f1c-490b-928d-318e860bc904</code>). ControlPlane sends a test handshake ping to verify connectivity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Extension Connection Error</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Verify that the ControlPlane server is running on <code>http://localhost:8000/</code> and that your activation token created under Enrollment Tokens has not been revoked.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
