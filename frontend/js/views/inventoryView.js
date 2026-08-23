/**
 * ControlPlane AI — Inventory & AI Tools Onboarding Hub View Module
 */

import { fetchResources, onboardResource, validateResource } from '../api.js';
import { navigate } from '../router.js';
import { showToast } from '../toast.js';

const PROVIDER_BADGES = {
  botpress: '⚡ Botpress Connector',
  custom: '⚡ Botpress Webhook',
};

export async function renderInventoryPage() {
  const tbody = document.getElementById('inventory-table-body');
  if (!tbody) return;

  try {
    const items = await fetchResources();
    tbody.innerHTML = '';
    items.forEach(r => {
      const providerLabel = PROVIDER_BADGES[r.ai_provider || 'botpress'] || '⚡ Botpress Connector';
      tbody.innerHTML += `
        <tr>
          <td><strong>${r.resource_name}</strong></td>
          <td><span style="font-weight:700; color:var(--cyan); font-size:0.82rem;">${providerLabel}</span></td>
          <td>${r.account_name}</td>
          <td><span class="source-tag">${r.use_case_type}</span></td>
          <td><code>${r.webhook_id_redacted}</code></td>
          <td><span class="status-badge">🟢 ${r.validation_status}</span></td>
          <td><button class="btn-secondary validate-btn" data-id="${r.id}">Validate</button></td>
        </tr>
      `;
    });

    tbody.querySelectorAll('.validate-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          const data = await validateResource(id);
          const isOk = data.valid;
          showToast(`Target Botpress Validation: ${data.validation_status.toUpperCase()}`, isOk ? 'success' : 'error');
          renderInventoryPage();
        } catch (err) {
          showToast('Validation failed: ' + err.message, 'error');
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger);">Error loading inventory: ${err.message}</td></tr>`;
  }

  setupPresetCards();
}

function setupPresetCards() {
  const cards = document.querySelectorAll('.ai-preset-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => {
        c.style.border = '1px solid var(--border)';
        c.style.background = 'var(--bg-card)';
      });
      card.style.border = '2px solid var(--primary)';
      card.style.background = 'rgba(99, 102, 241, 0.15)';

      const provider = card.getAttribute('data-provider');
      const name = card.getAttribute('data-name');
      const account = card.getAttribute('data-account');
      const webhook = card.getAttribute('data-webhook');
      const usecase = card.getAttribute('data-usecase');

      if (document.getElementById('onboard-provider')) document.getElementById('onboard-provider').value = provider;
      if (document.getElementById('onboard-name')) document.getElementById('onboard-name').value = name;
      if (document.getElementById('onboard-account')) document.getElementById('onboard-account').value = account;
      if (document.getElementById('onboard-webhook')) document.getElementById('onboard-webhook').value = webhook;
      if (document.getElementById('onboard-usecase')) document.getElementById('onboard-usecase').value = usecase;

      showToast(`Selected AI Tool Preset: ${name}`, 'info');
    });
  });
}

export async function handleOnboardSubmit(e, onSuccess) {
  e.preventDefault();
  const payload = {
    account_name: document.getElementById('onboard-account').value,
    resource_name: document.getElementById('onboard-name').value,
    webhook_id: document.getElementById('onboard-webhook').value,
    use_case_type: document.getElementById('onboard-usecase').value,
    ai_provider: document.getElementById('onboard-provider')?.value || 'custom',
  };
  try {
    const res = await onboardResource(payload);
    showToast(`Successfully onboarded AI Tool '${res.resource_name}'!`, 'success');
    if (onSuccess) await onSuccess();
    navigate('#/inventory');
  } catch (err) {
    showToast('Onboarding failed: ' + err.message, 'error');
  }
}
