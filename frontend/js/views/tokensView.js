/**
 * ControlPlane AI — Enrollment Tokens View Module
 * Creation & revocation of activation tokens with default 48-day active validity.
 */

import { fetchTokens, createToken, revokeToken } from '../api.js';
import { showToast } from '../toast.js';

export async function renderTokensPage() {
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
          <td><code style="color:var(--primary); font-size:0.82rem;">${tok.token_key}</code></td>
          <td><span style="font-size:0.8rem; color:var(--text-muted);">${formatDate(tok.created_at)}</span></td>
          <td><span style="font-size:0.8rem; color:var(--text-muted);">${formatDate(tok.expires_at)}</span></td>
          <td><span style="font-weight:700; color:var(--cyan);">${tok.days_remaining} days</span></td>
          <td><span class="sev-chip ${badgeClass}">${tok.status.toUpperCase()}</span></td>
          <td>
            <button class="btn-secondary copy-btn" data-key="${tok.token_key}">📋 Copy Key</button>
            ${isAct ? `<button class="btn-secondary revoke-btn" data-id="${tok.id}" style="color:var(--danger);">Revoke</button>` : ''}
          </td>
        </tr>
      `;
    });

    tbody.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        navigator.clipboard.writeText(key);
        showToast('Copied enrollment token key to clipboard!', 'cyan');
      });
    });

    tbody.querySelectorAll('.revoke-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to revoke this enrollment token?')) {
          await revokeToken(id);
          showToast('Enrollment token revoked successfully', 'info');
          renderTokensPage();
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger);">Error loading tokens: ${err.message}</td></tr>`;
  }
}

export async function handleCreateTokenSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('tok-title').value;
  const resId = document.getElementById('tok-resource-id').value || 'res_demo';
  const daysValid = parseInt(document.getElementById('tok-days-valid').value) || 48;

  try {
    const tok = await createToken(title, resId, daysValid);
    showToast(`Generated token '${tok.name}' valid for ${tok.days_valid} days! Key: ${tok.token_key}`, 'success', 5000);
    document.getElementById('tok-title').value = '';
    renderTokensPage();
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
