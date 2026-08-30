import React from 'react';
import { Server, Webhook, Zap, CheckCircle2, Code } from 'lucide-react';

export function GatewayGuideDoc() {
  return (
    <div className="space-y-10 animate-fade-in text-slate-800 dark:text-slate-200 font-sans leading-relaxed max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wider font-mono">
          <Server className="w-3.5 h-3.5" />
          <span>CONTROLPLANE AI // GATEWAY & CONNECTOR GUIDE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          AI Guardrail Interception & Webhook Connector Setup
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl font-sans font-medium">
          Step-by-step instructions to connect Botpress Cloud webhooks, FastAPI applications, and OpenAI-compatible proxy gates to ControlPlane AI.
        </p>
      </div>

      {/* 1. Botpress Webhook Setup Guide */}
      <section id="botpress-setup" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
            <Webhook className="w-5 h-5 text-cyan-500" />
            <span>1. Botpress Webhook Integration Guide (~5 Minutes)</span>
          </h2>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            ONE-TIME SETUP
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <ol className="list-decimal list-inside space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed pl-1">
            <li>
              Sign up at{' '}
              <a
                href="https://botpress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 underline font-bold"
              >
                https://botpress.com
              </a>{' '}
              and create a new bot in Botpress Studio.
            </li>
            <li>Give it a trivial flow (e.g. <em>"On Message → Send Text"</em> replying to anything the user says).</li>
            <li>Publish the bot.</li>
            <li>
              Navigate to <strong>Bot → Integrations</strong> → install and enable <strong>Chat</strong>.
            </li>
            <li>Copy the <strong>Webhook ID</strong> shown in the Chat integration config.</li>
            <li>
              Sanity check from a terminal:
              <div className="mt-2 p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-800 overflow-x-auto select-all">
                curl -s "https://chat.botpress.cloud/YOUR_WEBHOOK_ID/hello"
              </div>
              <span className="text-xs text-slate-500 mt-1 block">A non-error JSON response confirms the bot is reachable.</span>
            </li>
            <li>
              Enter this <strong>Webhook ID</strong> in ControlPlane AI under <strong>Monitored Resources → Onboard Monitored Resource</strong>.
            </li>
          </ol>
        </div>
      </section>

      {/* 2. Python SDK & API Interceptor */}
      <section id="fastapi-integration" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-500" />
          <span>2. Python Application Guardrail Interceptor</span>
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
          Call ControlPlane's <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-slate-900 dark:text-slate-100 font-mono text-xs border border-slate-200 dark:border-slate-700">/api/v1/resources/&#123;resource_id&#125;/check</code> endpoint before submitting raw user prompts to OpenAI, Anthropic, or custom LLM endpoints:
        </p>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm overflow-hidden">
          <pre className="text-xs sm:text-sm font-mono text-cyan-300 whitespace-pre overflow-x-auto leading-relaxed">
{`import requests
from openai import OpenAI

# 1. Evaluate prompt with ControlPlane Guardrail (<15ms)
cp_resp = requests.post(
    "http://localhost:8000/api/v1/resources/res_demo/check",
    json={
        "user_prompt": user_input,
        "tool_call": None
    },
    headers={"Authorization": "Bearer cp_live_default"}
).json()

if cp_resp["action"] == "BLOCK":
    print("Security Alert: Prompt blocked by ControlPlane!")
else:
    # 2. Send sanitized prompt to LLM
    clean_prompt = cp_resp.get("sanitized_prompt") or user_input
    client = OpenAI()
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": clean_prompt}]
    )`}
          </pre>
        </div>
      </section>
    </div>
  );
}
