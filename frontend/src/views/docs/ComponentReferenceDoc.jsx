import React from 'react';
import {
  LayoutDashboard,
  Shield,
  Bot,
  Activity,
  UserCheck,
  ShieldAlert,
  FileCheck,
  Key,
  Flame,
  Microscope,
  Chrome,
  Server,
  Webhook,
  Cpu,
  Lock,
  Layers,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export function ComponentReferenceDoc() {
  const components = [
    {
      id: 'dashboard',
      name: '1. Executive Dashboard',
      category: 'UI / Governance Studio',
      icon: LayoutDashboard,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      description: 'Central real-time governance dashboard displaying live security metrics, threat velocity, channel health, and violation distribution across all connected AI workloads.',
      features: [
        'Real-time prompt interception counter & latency monitor (<15ms compliance)',
        'Threat cascade distribution chart across 134 security taxonomies',
        'Channel activity breakdown (Chrome Extension, REST Gateway, Botpress Webhooks)',
        'Live system health status and active tenant workspace switcher'
      ]
    },
    {
      id: 'inventory',
      name: '2. Monitored Resources & Inventory',
      category: 'Resource Management',
      icon: Bot,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      description: 'Inventory management registry tracking all registered AI chatbots, autonomous agents, external LLM API endpoints, and webhook connectors.',
      features: [
        'Multi-channel resource onboarding wizard',
        'Custom policy association per resource endpoint',
        'Resource health tracking and telemetry heartbeat',
        'Bearer token key generation and enrollment binding'
      ]
    },
    {
      id: 'agent-runtime',
      name: '3. AI Agent Runtime Interceptor',
      category: 'Agentic Execution Shield',
      icon: Cpu,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      description: 'State-machine execution interceptor that monitors autonomous AI agent tool calls in real time, preventing unauthorized OS commands, file deletions, or database mutations.',
      features: [
        '4-Tier Action Risk Matrix (LOW, MEDIUM, HIGH, CRITICAL)',
        'Automatic interception of destructive bash/SQL commands (e.g., DROP TABLE, sudo rm -rf)',
        'Human-In-The-Loop (HITL) approval pause triggers for high-impact actions',
        'Cryptographically logged tool parameters and execution timestamps'
      ]
    },
    {
      id: 'security-center',
      name: '4. Security Center Overview',
      category: 'Threat Intelligence',
      icon: Shield,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      description: 'High-level posture analysis center mapping security violations against NIST AI RMF, Meta Llama Guard 3, and OWASP Top 10 for LLMs.',
      features: [
        'Security posture trustworthiness score (0-100%)',
        'Categorized threat breakdowns: PII, Prompt Injections, Toxic Harm, Hallucinations',
        'Risk trend comparison velocity metrics',
        'Direct navigation to review queue and active policy rules'
      ]
    },
    {
      id: 'review-queue',
      name: '5. HITL Review Queue',
      category: 'Human-in-the-Loop',
      icon: UserCheck,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      description: 'Human-in-the-loop review interface allowing security officers to inspect, approve, acknowledge, or override flagged prompt submissions and agent execution requests.',
      features: [
        'Interactive pending approval queue with severity badges',
        'Detailed prompt vs. sanitized text comparison viewer',
        'One-click Acknowledge & Resolve auditor workflows',
        'Auditor rationale annotation logging'
      ]
    },
    {
      id: 'risk-findings',
      name: '6. Risk Findings & Telemetry',
      category: 'Audit & Telemetry',
      icon: ShieldAlert,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      description: 'Granular security violation feed listing intercepted prompts, masked outputs, session IDs, and context details with multi-channel filtering.',
      features: [
        'Source filter buttons (All, Browser Extension, Botpress Webhooks, REST AI Gateway, Agent Runtime)',
        'Severity drop-down filters (CRITICAL, HIGH, MEDIUM, LOW)',
        'Deep-dive finding inspector with original prompt vs. model response diffs',
        'Session-level telemetry tracking for multi-turn social engineering'
      ]
    },
    {
      id: 'policy-engine',
      name: '7. Policy Engine & Rules',
      category: 'Governance Engine',
      icon: FileCheck,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      description: 'Deterministic and vector-space policy engine containing system presets and user-configured regex rules, Shannon entropy limits, and action modes.',
      features: [
        '5 Regulatory Presets: Customer Support, Internal Copilot, Healthcare HIPAA, Autonomous Agents, Global GDPR Privacy',
        'Luhn Mod-10 credit card serial validation',
        'Shannon Information Entropy calculation for API key detection',
        'Flexible action modes: BLOCK, MASK, CONFIRM_REQUIRED, AUDIT'
      ]
    },
    {
      id: 'enrollment-tokens',
      name: '8. Enrollment Tokens & Devices',
      category: 'Device Authorization',
      icon: Key,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
      description: 'Authentication token management center for enrolling browser extension endpoints, enterprise workstations, and background connectors.',
      features: [
        'Cryptographic token generation with expiration rules',
        'Enrolled device registry tracking browser platform, device name, and IP address',
        'Instant token revocation capability',
        'One-click enrollment token copy helper'
      ]
    },
    {
      id: 'red-team-scanner',
      name: '9. AI Red Team Scanner',
      category: 'Adversarial Testing',
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      description: 'Automated adversarial testing suite that executes prompt injection, roleplay bypass, and jailbreak probes against target resources.',
      features: [
        'Preset probe catalog: DAN Jailbreak, System Prompt Extraction, Tool Abuse, PII Harvesting',
        'Custom adversarial payload input tester',
        'Vulnerability & defense status classification (VULNERABLE vs. DEFENDED)',
        'Exportable PDF and JSON security audit reports'
      ]
    },
    {
      id: 'rag-grounding',
      name: '10. Hallucination & RAG Grounding Evaluator',
      category: 'Factuality & Grounding',
      icon: Microscope,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      borderColor: 'border-emerald-400/20',
      description: 'Evidence-backed factuality checker extracting atomic claims and verifying context-faithfulness against RAG reference documents and Google Search.',
      features: [
        'Atomic claim decomposition and individual factuality scoring',
        'Context-faithfulness evaluation against enterprise reference manuals',
        'Real-time Serper Google Search & Wikipedia citation verification',
        'Support for Knowledge QA, Math, Code, and Scientific Literature categories'
      ]
    },
    {
      id: 'chrome-extension',
      name: '11. Chrome Extension (Manifest V3)',
      category: 'Client Endpoint Ingress',
      icon: Chrome,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20',
      description: 'Client-side Chrome extension providing synchronous prompt interception across all major web AI portals with zero inline script footprint.',
      features: [
        'Multi-portal support: ChatGPT, Claude, Gemini, DeepSeek, Kimi, Perplexity, Copilot, Poe, Botpress',
        'Synchronous event interception stopping prompt submissions prior to network egress',
        'Sub-15ms fast-path evaluation via local pattern matching and backend sync',
        'Non-intrusive in-page alert toasts and status indicator banner'
      ]
    },
    {
      id: 'rest-gateway',
      name: '12. REST AI Gateway Proxy',
      category: 'Network Ingress',
      icon: Server,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/20',
      description: 'OpenAI-compatible reverse proxy sitting between application backends and foundation model providers (OpenAI, Anthropic, Ollama).',
      features: [
        'Drop-in replacement endpoint (/v1/chat/completions)',
        'Header-based compliance injection (X-ControlPlane-Score, X-ControlPlane-Action)',
        'Automatic PII masking on prompt ingress and LLM output egress',
        'API key authentication and tenant rate limiting'
      ]
    },
    {
      id: 'botpress-connector',
      name: '13. Botpress & Webhook Connector',
      category: 'Chatbot Integration',
      icon: Webhook,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
      borderColor: 'border-cyan-400/20',
      description: 'Dedicated connector handling incoming webhooks from Botpress Cloud and enterprise chatbot frameworks.',
      features: [
        'Native webhook endpoint (/api/botpress/webhook)',
        'Automated user prompt and bot response evaluation',
        'Async callback decision triggers',
        'Botpress session telemetry tracking'
      ]
    },
    {
      id: 'fastapi-backend',
      name: '14. FastAPI Backend Core',
      category: 'Backend Infrastructure',
      icon: Layers,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      description: 'High-performance Python async engine handling API routing, security evaluations, database persistence, and evaluation pipelines.',
      features: [
        'FastAPI async architecture with sub-15ms fast-path routes',
        'Modular evaluator pipeline (pii.py, injection.py, bias_safety.py, cost.py, grounding.py)',
        'Database ORM support for PostgreSQL and SQLite',
        'CORS governance and JWT session management'
      ]
    },
    {
      id: 'audit-chain',
      name: '15. SHA-256 Cryptographic Audit Chain',
      category: 'Forensic Integrity',
      icon: Lock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      borderColor: 'border-amber-400/20',
      description: 'Tamper-evident cryptographic ledger linking every security finding into a sequential SHA-256 hash chain.',
      features: [
        'Sequential hash calculation: Hash_N = SHA256(Hash_{N-1} + Payload_N)',
        'Guaranteed forensic integrity for SOC 2, ISO 27001, and HIPAA compliance',
        'Automated hash chain verification check in audit views',
        'Exportable cryptographic audit proof'
      ]
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in text-slate-800 dark:text-slate-200 font-sans leading-relaxed max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wider font-mono">
          <Layers className="w-3.5 h-3.5" />
          <span>CONTROLPLANE AI // COMPONENT REFERENCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          Complete System Architecture & Component Inventory
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl font-sans font-medium">
          Comprehensive documentation of all 15 core components comprising the ControlPlane AI governance platform, guardrail engine, client connectors, and storage layer.
        </p>
      </div>

      {/* Component Grid */}
      <div className="space-y-6">
        {components.map((comp) => {
          const Icon = comp.icon;
          return (
            <div
              key={comp.id}
              id={comp.id}
              className="p-6 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${comp.bgColor} ${comp.borderColor} border flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${comp.color}`} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sans">
                      {comp.name}
                    </h2>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                      {comp.category}
                    </span>
                  </div>
                </div>

                <span className="self-start sm:self-auto px-2.5 py-1 rounded-md bg-slate-100 dark:bg-dark-900 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold border border-slate-200 dark:border-slate-800">
                  id: {comp.id}
                </span>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                {comp.description}
              </p>

              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Key Capabilities & Specifications:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 font-sans">
                  {comp.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-dark-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
