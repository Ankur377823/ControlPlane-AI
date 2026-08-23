/**
 * ControlPlane AI — AI Agent Runtime & Tool Call Interception Sandbox
 */

import { runCheck } from '../api.js';

export async function handleSandboxSubmit(e) {
  e.preventDefault();
  const prompt = document.getElementById('sandbox-prompt').value;
  const resId = document.getElementById('sandbox-resource-id').value;
  const toolSelect = document.getElementById('sandbox-tool-select');
  const outBox = document.getElementById('sandbox-output');

  let toolCall = null;
  if (toolSelect && toolSelect.value !== 'none') {
    toolCall = { name: toolSelect.value, parameters: { intent: prompt } };
  }

  outBox.innerHTML = '<span style="color:var(--cyan);">⏳ Running live guardrail & agent action risk check...</span>';

  try {
    const res = await runCheck(resId, prompt, toolCall);
    const actionColor = res.action === 'BLOCK' ? 'var(--danger)' : (res.action === 'CONFIRM_REQUIRED' ? 'var(--warning)' : 'var(--cyan)');
    outBox.innerHTML = `
      <div style="margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <span class="status-badge" style="font-size:0.9rem;">Enforcement Action: <strong style="color:${actionColor};">${res.action}</strong></span>
        <span style="font-size:0.8rem; background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:6px; color:#fff; border:1px solid var(--border);">
          Agent Action Risk Tier: <strong style="color:${res.action_risk_tier === 'CRITICAL' ? 'var(--danger)' : (res.action_risk_tier === 'HIGH' ? 'var(--warning)' : 'var(--success)')};">${res.action_risk_tier || 'LOW'}</strong>
        </span>
        <span style="font-size:0.8rem; color:var(--text-muted);">Latency: ${res.latency_ms} ms</span>
      </div>

      <div style="font-weight:700; color:var(--primary); margin-top:8px;">Sanitized Prompt Passed to LLM:</div>
      <div style="background:var(--bg-dark); padding:8px 12px; border-radius:6px; font-family:var(--font-mono); font-size:0.85rem; color:#f8fafc; border:1px solid var(--border); margin-top:4px;">
        ${escapeHtml(res.sanitized_prompt)}
      </div>

      <div style="font-weight:700; color:var(--warning); margin-top:12px;">Triggered Security Rules & Risk Findings:</div>
      <div style="font-size:0.82rem; color:var(--text-subtle); margin-top:4px;">
        ${(res.triggered_rules || []).map(r => `• ${r}`).join('<br>') || 'None (Clean Query)'}
      </div>
    `;
  } catch (err) {
    outBox.innerHTML = `<span style="color:var(--danger);">Sandbox check failed: ${err.message}</span>`;
  }
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
