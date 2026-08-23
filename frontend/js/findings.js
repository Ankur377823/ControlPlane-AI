/**
 * ControlPlane AI — Risk Findings View & Inspection Drawer Module
 */

import { fetchFindings, updateFindingStatus } from './api.js';
import { updateQueryParams } from './router.js';

let filterSource = 'All';
let filterSeverity = 'All severities';
let searchTerm = '';
let cachedFindings = [];

export function initFindingsUI(queryParams) {
  if (queryParams.has('source')) filterSource = queryParams.get('source');
  if (queryParams.has('severity')) filterSeverity = queryParams.get('severity');
  if (queryParams.has('q')) searchTerm = queryParams.get('q');

  updateRFFilterUI();
  loadFindingsPage();
}

export function updateRFFilterUI() {
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    if (btn.innerText.trim().toLowerCase() === filterSource.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const sevSel = document.getElementById('rf-sev-filter');
  if (sevSel) sevSel.value = filterSeverity;

  const sInp = document.getElementById('rf-search-input');
  if (sInp && sInp.value !== searchTerm) sInp.value = searchTerm;
}

export function setRFFilter(type, val) {
  if (type === 'source') filterSource = val;
  if (type === 'severity') filterSeverity = val;

  updateQueryParams({ source: filterSource, severity: filterSeverity, q: searchTerm });
  loadFindingsPage();
}

export function onRFSearchInput(val) {
  searchTerm = val;
  updateQueryParams({ source: filterSource, severity: filterSeverity, q: searchTerm });
  loadFindingsPage();
}

export async function loadFindingsPage() {
  const tbody = document.getElementById('rf-table-body');
  if (!tbody) return;

  try {
    const data = await fetchFindings({
      source: filterSource,
      severity: filterSeverity,
      search: searchTerm,
    });
    cachedFindings = data;

    const countEl = document.getElementById('rf-total-count');
    if (countEl) countEl.innerText = `${data.length} findings`;

    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No risk findings match current filters.</td></tr>`;
      return;
    }

    data.forEach((item, idx) => {
      const sevClass = (item.severity || 'HIGH').toLowerCase();
      const dateStr = formatRelativeTime(item.timestamp);

      tbody.innerHTML += `
        <tr data-idx="${idx}">
          <td><span class="sev-chip sev-chip-${sevClass}">${item.severity || 'HIGH'}</span></td>
          <td>
            <div style="font-weight:700; color:#fff;">${item.finding_title || 'PII Detected in User Input'}</div>
            <div style="font-size:0.75rem; color:var(--text-subtle);">${item.finding_code || 'PII-INPUT-001'}</div>
          </td>
          <td><span class="source-tag">${item.source || 'Endpoint'}</span></td>
          <td><span class="context-code">${item.context || 'EMAIL_ADDRESS'}</span></td>
          <td><span class="status-badge">🟢 ${item.status || 'open'}</span></td>
          <td><span style="color:var(--text-muted); font-size:0.82rem;">${dateStr}</span></td>
        </tr>
      `;
    });

    // Attach row click listeners
    tbody.querySelectorAll('tr[data-idx]').forEach(tr => {
      tr.addEventListener('click', () => {
        const idx = parseInt(tr.getAttribute('data-idx'));
        openRFModal(idx);
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger);">Failed to load findings: ${err.message}</td></tr>`;
  }
}

export function openRFModal(idx) {
  const item = cachedFindings[idx];
  if (!item) return;

  const titleEl = document.getElementById('modal-rf-title');
  if (titleEl) titleEl.innerText = `${item.finding_title} (${item.finding_code})`;

  const body = document.getElementById('modal-rf-body');
  if (!body) return;

  body.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:1.25rem;">
      <div style="background:var(--bg-input); padding:10px; border-radius:8px; text-align:center;">
        <div style="font-size:0.7rem; color:var(--text-muted);">SEVERITY</div>
        <div style="font-weight:800; color:var(--primary);">${item.severity}</div>
      </div>
      <div style="background:var(--bg-input); padding:10px; border-radius:8px; text-align:center;">
        <div style="font-size:0.7rem; color:var(--text-muted);">SOURCE</div>
        <div style="font-weight:800; color:var(--warning);">${item.source}</div>
      </div>
      <div style="background:var(--bg-input); padding:10px; border-radius:8px; text-align:center;">
        <div style="font-size:0.7rem; color:var(--text-muted);">STATUS</div>
        <div style="font-weight:800; color:var(--success);">${item.status}</div>
      </div>
    </div>

    <div style="margin-bottom:1rem;">
      <label>Full User Prompt</label>
      <div style="background:var(--bg-input); padding:10px; border-radius:8px; font-family:var(--font-mono); font-size:0.85rem; color:#f8fafc;">
        ${escapeHtml(item.user_prompt)}
      </div>
    </div>

    <div style="margin-bottom:1rem;">
      <label>Risk Findings & Snippets</label>
      <pre style="background:var(--bg-input); padding:10px; border-radius:8px; font-family:var(--font-mono); font-size:0.82rem; color:#fdba74; white-space:pre-wrap;">${JSON.stringify(item.risk_findings || [], null, 2)}</pre>
    </div>

    <div style="display:flex; justify-space-between; align-items:center; margin-top:1.5rem;">
      <div>
        <label style="display:inline; margin-right:10px;">Update Status:</label>
        <button class="btn-secondary" id="btn-status-resolved">Mark Resolved</button>
        <button class="btn-secondary" id="btn-status-investigating">Mark Investigating</button>
      </div>
      <button class="btn-secondary" id="btn-close-modal">Close Inspector</button>
    </div>
  `;

  document.getElementById('rf-modal').style.display = 'flex';

  document.getElementById('btn-status-resolved').addEventListener('click', () => changeFindingStatus(item.id, 'resolved'));
  document.getElementById('btn-status-investigating').addEventListener('click', () => changeFindingStatus(item.id, 'investigating'));
  document.getElementById('btn-close-modal').addEventListener('click', closeRFModal);
}

export function closeRFModal() {
  document.getElementById('rf-modal').style.display = 'none';
}

async function changeFindingStatus(id, newStatus) {
  try {
    await updateFindingStatus(id, newStatus);
    closeRFModal();
    loadFindingsPage();
  } catch (err) {
    alert('Failed to update status: ' + err.message);
  }
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatRelativeTime(isoStr) {
  if (!isoStr) return 'a day ago';
  try {
    const now = Date.now();
    const past = new Date(isoStr).getTime();
    const diffHours = Math.round((now - past) / (1000 * 3600));

    if (diffHours <= 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'a day ago';
    return `${diffDays} days ago`;
  } catch (e) {
    return 'a day ago';
  }
}
