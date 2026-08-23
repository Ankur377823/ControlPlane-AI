/**
 * ControlPlane AI — Enrollment Tokens Management Module (Default 48 Days Expiration)
 */

import { fetchTokens, createToken, revokeToken } from './api.js';
import { showToast } from './toast.js';

export async function loadTokensPage() {
  const tbody = document.getElementById('tokens-table-body');
  if (!tbody) return;

  try {
    const tokens = await fetchTokens();

    tbody.innerHTML = '';
    if (tokens.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No enrollment tokens created yet. Use form above to generate token.</td></tr>`;
      return;
    }

    tokens.forEach(tok => {
      const isAct = tok.status === 'active';
      const badgeClass = isAct ? 'sev-chip-low' : (tok.status === 'expired' ? 'sev-chip-medium' : 'sev-chip-critical');

      tbody.innerHTML += `
        <tr>
          <td><strong>${tok.name}</strong></td>
          <td><code style="background:rgba(99,102,241,0.15); color:var(--cyan); padding:4px 10px; border-radius:6px; font-family:var(--font-mono); font-size:0.85rem; font-weight:700; border:1px solid rgba(99,102,241,0.3); display:inline-block;">${tok.token_key}</code></td>
          <td><span style="font-size:0.8rem; color:var(--text-muted);">${formatDate(tok.created_at)}</span></td>
          <td><span style="font-size:0.8rem; color:var(--text-muted);">${formatDate(tok.expires_at)}</span></td>
          <td><span style="font-weight:700; color:var(--primary);">${tok.days_remaining} days</span></td>
          <td><span class="sev-chip ${badgeClass}">🟢 ${tok.status.toUpperCase()}</span></td>
          <td>
            <button class="btn-secondary copy-btn" data-key="${tok.token_key}" style="font-size:0.75rem; padding:4px 10px;">📋 Copy Token</button>
            ${isAct ? `<button class="btn-secondary revoke-btn" data-id="${tok.id}" style="color:var(--danger); font-size:0.75rem; padding:4px 10px; margin-left:4px;">Revoke</button>` : ''}
          </td>
        </tr>
      `;
    });

    // Attach event listeners to copy and revoke buttons
    tbody.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        navigator.clipboard.writeText(key);
        showToast('Copied extension enrollment token: ' + key, 'success');
      });
    });

    tbody.querySelectorAll('.revoke-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to revoke this enrollment token?')) {
          await revokeToken(id);
          showToast('Enrollment token revoked', 'warning');
          loadTokensPage();
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger);">Error loading tokens: ${err.message}</td></tr>`;
  }
}

export async function handleCreateToken(e) {
  e.preventDefault();
  const title = document.getElementById('tok-title').value;
  const resId = document.getElementById('tok-resource-id').value || 'res_demo';
  const daysValid = parseInt(document.getElementById('tok-days-valid').value) || 48;

  try {
    const tok = await createToken(title, resId, daysValid);
    showToast(`Generated enrollment token '${tok.name}' key: ${tok.token_key}`, 'success');
    document.getElementById('tok-title').value = '';
    loadTokensPage();
  } catch (err) {
    showToast('Failed to generate token: ' + err.message, 'error');
  }
}

function formatDate(isoStr) {
  if (!isoStr) return '--';
  try {
    return new Date(isoStr).toLocaleDateString();
  } catch (e) {
    return isoStr;
  }
}
