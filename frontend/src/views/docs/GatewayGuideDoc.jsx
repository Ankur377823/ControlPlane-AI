import React from 'react';

export function GatewayGuideDoc() {
  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-brand tracking-tight">
          AI Guardrail Interception & Integration
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
          Learn how to integrate ControlPlane AI into Python applications, agent workflows, and webhook proxy pipes.
        </p>
      </div>

      <section id="fastapi-integration" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-brand flex items-center gap-2">
          <span>Python Application Guardrail Interceptor</span>
          <span className="text-primary text-lg font-normal">#</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
          Call ControlPlane's <code>/api/v1/resources/&#123;resource_id&#125;/check</code> endpoint before submitting raw user prompts to OpenAI, Anthropic, or custom model endpoints:
        </p>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
          <pre className="text-xs font-mono text-slate-800 dark:text-cyan-300 p-3 bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-transparent whitespace-pre overflow-x-auto">
{`import requests
from openai import OpenAI

# 1. Evaluate prompt with ControlPlane Guardrail (<15ms)
cp_resp = requests.post(
    "http://localhost:8000/api/v1/resources/res_demo/check",
    json={
        "user_prompt": user_input,
        "tool_call": None
    },
    headers={"X-Tenant-ID": "ankur-tenant-1"}
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
