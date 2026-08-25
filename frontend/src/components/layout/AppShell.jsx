import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell({ activeRoute, onNavigate, children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-slate-100 antialiased transition-colors">
      {/* Left Sidebar */}
      <Sidebar activeRoute={activeRoute} onNavigate={onNavigate} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header activeRoute={activeRoute} />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/70 dark:bg-gradient-to-b dark:from-dark-850/50 dark:to-dark-900/90 transition-colors">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
