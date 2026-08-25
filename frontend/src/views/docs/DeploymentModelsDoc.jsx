import React from 'react';

export function DeploymentModelsDoc() {
  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-brand tracking-tight">
          Deployment Topologies & Database Modes
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
          ControlPlane AI supports dual persistence architectures for fast local prototyping and cloud production.
        </p>
      </div>

      <section id="database-modes" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Dual Database Architecture</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. SQLite Mode (Default Local)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Auto-selected when <code>DATABASE_URL</code> is unset. Stores state in <code>botpress_connector.db</code> with SQLite WAL mode for fast concurrency and zero external dependencies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. PostgreSQL Mode (Cloud Production)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enabled by supplying <code>DATABASE_URL</code> (e.g. Neon Cloud PostgreSQL). Uses connection pooling for high-throughput multi-tenant environments.
            </p>
          </div>
        </div>
      </section>

      <section id="docker-compose-deploy" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Docker Container Deployment</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          The <code>Dockerfile</code> packages both the FastAPI Python runtime and the compiled React SPA static assets into a single lightweight production container.
        </p>
      </section>
    </div>
  );
}
