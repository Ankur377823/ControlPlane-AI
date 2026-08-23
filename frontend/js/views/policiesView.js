/**
 * ControlPlane AI — Security Policy Configurator View Controller
 */

import { fetchPolicy, updatePolicy } from '../api.js';
import { showToast } from '../toast.js';

export async function initPoliciesView() {
  try {
    const policy = await fetchPolicy('res_demo');
    if (policy) {
      const modeEl = document.getElementById('pol-mode');
      const piiEl = document.getElementById('pol-pii-sens');
      const injEl = document.getElementById('pol-inj-act');
      const tokEl = document.getElementById('pol-tokens');
      const halEl = document.getElementById('pol-hal');
      const halValEl = document.getElementById('pol-hal-val');

      if (modeEl && policy.enforcement_mode) modeEl.value = policy.enforcement_mode;
      if (piiEl && policy.pii_sensitivity) piiEl.value = policy.pii_sensitivity;
      if (injEl && policy.prompt_injection_action) injEl.value = policy.prompt_injection_action;
      if (tokEl && policy.max_tokens_limit) tokEl.value = String(policy.max_tokens_limit);
      if (halEl && policy.hallucination_threshold !== undefined) {
        halEl.value = policy.hallucination_threshold;
        if (halValEl) halValEl.innerText = policy.hallucination_threshold;
      }
    }
  } catch (err) {
    console.warn('Failed to load initial policy config:', err);
  }
}

export async function handlePolicySubmit(e) {
  e.preventDefault();
  const mode = document.getElementById('pol-mode')?.value || 'block';
  const piiSens = document.getElementById('pol-pii-sens')?.value || 'high';
  const injAct = document.getElementById('pol-inj-act')?.value || 'block';
  const maxTokens = parseInt(document.getElementById('pol-tokens')?.value || '2048', 10);
  const hal = parseFloat(document.getElementById('pol-hal')?.value || '0.65');

  const policyPayload = {
    enforcement_mode: mode,
    pii_redaction_enabled: true,
    pii_sensitivity: piiSens,
    prompt_injection_action: injAct,
    hallucination_threshold: hal,
    max_tokens_limit: maxTokens,
    require_human_review_below: 0.75,
  };

  try {
    await updatePolicy('res_demo', policyPayload);
    showToast('Policy rules updated & enforced across all active AI guardrails!', 'success');
  } catch (err) {
    showToast('Failed to save policy: ' + err.message, 'error');
  }
}
