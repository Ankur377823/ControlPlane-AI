import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { BrandLogo } from '../components/common/BrandLogo';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Home,
  Sun,
  Moon,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';

// Modular doc components
import { WhatIsControlPlane } from './docs/WhatIsControlPlane';
import { ArchitectureDoc } from './docs/ArchitectureDoc';
import { QuickStartDoc } from './docs/QuickStartDoc';
import { DeploymentModelsDoc } from './docs/DeploymentModelsDoc';
import { PlatformGuideDoc } from './docs/PlatformGuideDoc';
import { GatewayGuideDoc } from './docs/GatewayGuideDoc';
import { ApiReferenceDoc } from './docs/ApiReferenceDoc';
import { TroubleshootingDoc } from './docs/TroubleshootingDoc';
import { FaqDoc } from './docs/FaqDoc';

const DOC_NAV_GROUPS = [
  {
    title: 'Getting Started',
    id: 'getting-started',
    items: [
      { id: 'what-is-controlplane', label: 'What is ControlPlane AI?' },
      { id: 'architecture', label: 'Architecture & Pipeline' },
      { id: 'quick-start', label: 'Quick Start' },
      { id: 'deployment-models', label: 'Deployment Topologies' },
    ],
  },
  {
    title: 'Platform Guide',
    id: 'platform-guide',
    items: [
      { id: 'platform-policies', label: 'Policy & Guardrail Rules' },
    ],
  },
  {
    title: 'AI Gateway Guide',
    id: 'gateway-guide',
    items: [
      { id: 'gateway-overview', label: 'Guardrail Interceptor Setup' },
    ],
  },
  {
    title: 'API Reference',
    id: 'api-reference',
    items: [
      { id: 'rest-api', label: 'REST API & Recipes' },
    ],
  },
  {
    title: 'Errors & Troubleshooting',
    id: 'troubleshooting',
    items: [
      { id: 'common-errors', label: 'Common Issues & Solutions' },
    ],
  },
  {
    title: 'FAQ',
    id: 'faq',
    items: [
      { id: 'general-faq', label: 'Frequently Asked Questions' },
    ],
  },
];

export function DocumentationView({ onBackToStudio }) {
  const { isDark, toggleTheme } = useTheme();
  const [activeDocId, setActiveDocId] = useState('what-is-controlplane');
  const [expandedGroups, setExpandedGroups] = useState({
    'getting-started': true,
    'platform-guide': true,
    'gateway-guide': true,
    'api-reference': true,
    'troubleshooting': true,
    'faq': true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const getDocBreadcrumb = () => {
    for (const group of DOC_NAV_GROUPS) {
      const found = group.items.find((item) => item.id === activeDocId);
      if (found) {
        return [group.title, found.label];
      }
    }
    return ['Getting Started', 'What is ControlPlane AI?'];
  };

  const [groupTitle, pageTitle] = getDocBreadcrumb();

  const renderActiveDocContent = () => {
    switch (activeDocId) {
      case 'what-is-controlplane':
        return <WhatIsControlPlane />;
      case 'architecture':
        return <ArchitectureDoc />;
      case 'quick-start':
        return <QuickStartDoc />;
      case 'deployment-models':
        return <DeploymentModelsDoc />;
      case 'platform-policies':
        return <PlatformGuideDoc />;
      case 'gateway-overview':
        return <GatewayGuideDoc />;
      case 'rest-api':
        return <ApiReferenceDoc />;
      case 'common-errors':
        return <TroubleshootingDoc />;
      case 'general-faq':
        return <FaqDoc />;
      default:
        return <WhatIsControlPlane />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white flex flex-col font-sans selection:bg-primary/20 selection:text-primary transition-colors">
      {/* Standalone Top Documentation Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-850/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Section Tabs */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <BrandLogo className="w-8 h-8 rounded-xl shadow-sm" />
              <span className="font-brand font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                ControlPlane Docs
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <button
                onClick={() => setActiveDocId('what-is-controlplane')}
                className={`transition-colors ${
                  activeDocId === 'what-is-controlplane' || activeDocId === 'architecture' || activeDocId === 'quick-start'
                    ? 'text-primary dark:text-primary-light font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Getting Started
              </button>
              <button
                onClick={() => setActiveDocId('platform-policies')}
                className={`transition-colors ${
                  activeDocId === 'platform-policies'
                    ? 'text-primary dark:text-primary-light font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Platform Guide
              </button>
              <button
                onClick={() => setActiveDocId('gateway-overview')}
                className={`transition-colors ${
                  activeDocId === 'gateway-overview'
                    ? 'text-primary dark:text-primary-light font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Gateway
              </button>
              <button
                onClick={() => setActiveDocId('rest-api')}
                className={`transition-colors ${
                  activeDocId === 'rest-api'
                    ? 'text-primary dark:text-primary-light font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                API Reference
              </button>
            </nav>
          </div>

          {/* Right Controls: Search, Theme Toggle, Back to Studio */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search docs (Ctrl + K)..."
                className="w-48 lg:w-64 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-8 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <kbd className="absolute right-2.5 top-2 px-1 py-0.5 text-[9px] font-mono text-slate-400 bg-white dark:bg-dark-800 rounded border border-slate-200 dark:border-slate-700">
                ctrl k
              </kbd>
            </div>

            {/* Standalone Symbol-Only Theme Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Return to Security Studio Button */}
            {onBackToStudio ? (
              <button
                onClick={onBackToStudio}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm shadow-primary/25 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open Security Studio</span>
                <span className="sm:hidden">Studio</span>
              </button>
            ) : (
              <a
                href="#/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm shadow-primary/25 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open Security Studio</span>
                <span className="sm:hidden">Studio</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Documentation Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Documentation Tree Sidebar */}
          <aside className="lg:col-span-3 space-y-4 sticky top-24">
            <div className="space-y-1 bg-white dark:bg-dark-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {DOC_NAV_GROUPS.map((group) => {
                const isExpanded = !!expandedGroups[group.id];
                return (
                  <div key={group.id} className="space-y-1">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between py-2 px-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider text-left transition-colors"
                    >
                      <span>{group.title}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="space-y-0.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                        {group.items.map((item) => {
                          const isActive = activeDocId === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setActiveDocId(item.id)}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isActive
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-900'
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Center Article Content */}
          <article className="lg:col-span-7 bg-white dark:bg-dark-850 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 min-h-[70vh]">
            {/* Breadcrumb Header */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
              <span>{groupTitle}</span>
              <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold">
                {pageTitle}
              </span>
            </div>

            {/* Modular Document Content */}
            <div className="pt-2">{renderActiveDocContent()}</div>
          </article>

          {/* Right On-Page Table of Contents */}
          <div className="hidden lg:block lg:col-span-2 space-y-3 sticky top-24">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              On this page
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
              <a href="#the-problem" className="block hover:text-primary transition-colors">
                The Security Challenge
              </a>
              <a href="#core-capabilities" className="block hover:text-primary transition-colors">
                Core System Modules
              </a>
              <a href="#how-it-deploys" className="block hover:text-primary transition-colors">
                Supported Integrations
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
