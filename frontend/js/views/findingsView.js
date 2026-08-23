/**
 * ControlPlane AI — Risk Findings Table View Controller
 * Renders live findings with Chatbot Name, Session ID, and navigation to Event Overview page.
 */

import { fetchFindings } from '../api.js';
import { navigate, updateQueryParams } from '../router.js';

let filterSource = 'All';
let filterSeverity = 'All severities';
let searchTerm = '';
let cachedFindings = [];

export function initFindingsView(queryParams) {
  if (queryParams.has('source')) filterSource = queryParams.get('source');
  if (queryParams.has('severity')) filterSeverity = queryParams.get('severity');
  if (queryParams.has('q')) searchTerm = queryParams.get('q');

  updateRFFilterUI();
  renderFindingsTable();
}

export function updateRFFilterUI() {
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    if (btn.innerText.trim().toLowerCase().includes(filterSource.toLowerCase())) {
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
  renderFindingsTable();
}

export function onRFSearchInput(val) {
  searchTerm = val;
  updateQueryParams({ source: filterSource, severity: filterSeverity, q: searchTerm });
  renderFindingsTable();
}

export async function renderFindingsTable() {
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

    // Render Summary Metrics Cards
    const criticalCount = data.filter(f => (f.severity || '').toUpperCase() === 'CRITICAL' || (f.severity || '').toUpperCase() === 'HIGH').length;
    const avgLatency = data.length ? Math.round(data.reduce((sum, f) => sum + (f.latency_ms || 0), 0) / data.length) : 0;
    const uniqueBots = new Set(data.map(f => f.source || 'Endpoint AI Bot')).size;

    const metricsEl = document.getElementById('rf-summary-metrics');
    if (metricsEl) {
      metricsEl.innerHTML = `
        <div class="card" style="margin-bottom:0; border-left:4px solid var(--primary); padding:1rem 1.25rem;">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">TOTAL INTERCEPTIONS</div>
          <div style="font-size:1.8rem; font-weight:800; color:#fff; margin-top:4px;">${data.length}</div>
          <div style="font-size:0.72rem; color:var(--text-subtle); margin-top:2px;">Across all active channels</div>
        </div>
        <div class="card" style="margin-bottom:0; border-left:4px solid var(--danger); padding:1rem 1.25rem;">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">CRITICAL & HIGH RISKS</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--danger); margin-top:4px;">${criticalCount}</div>
          <div style="font-size:0.72rem; color:var(--text-subtle); margin-top:2px;">Immediate action recommended</div>
        </div>
        <div class="card" style="margin-bottom:0; border-left:4px solid var(--cyan); padding:1rem 1.25rem;">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">AVERAGE LATENCY</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--cyan); margin-top:4px;">${avgLatency} ms</div>
          <div style="font-size:0.72rem; color:var(--text-subtle); margin-top:2px;">Sub-15ms compliance threshold</div>
        </div>
        <div class="card" style="margin-bottom:0; border-left:4px solid var(--success); padding:1rem 1.25rem;">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">MONITORED CHANNELS</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--success); margin-top:4px;">${uniqueBots}</div>
          <div style="font-size:0.72rem; color:var(--text-subtle); margin-top:2px;">Connected agent frameworks</div>
        </div>
      `;
    }

    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <div style="font-size: 1.4rem; margin-bottom: 0.5rem;">🔍 No Active Risk Findings</div>
            <p style="font-size: 0.85rem;">Risk findings will appear dynamically when user prompt checks or extension interceptions occur.</p>
          </td>
        </tr>`;
      return;
    }

    data.forEach((item) => {
      const sevClass = (item.severity || 'HIGH').toLowerCase();
      const dateStr = formatRelativeTime(item.timestamp);
      const botName = item.resource_name || 'Global Support Bot';
      const chatbotLabel = item.source || 'Endpoint AI Bot';
      const sessId = item.session_id || 'sess_8f3a92b1';

      tbody.innerHTML += `
        <tr onclick="navigate('#/security-center/event-overview?id=${item.id}&session_id=${sessId}')" style="cursor:pointer;">
          <td><span class="sev-chip sev-chip-${sevClass}">${item.severity || 'HIGH'}</span></td>
          <td>
            <div style="font-weight:700; color:#fff;">${item.finding_title || 'PII Detected in User Input'}</div>
            <div style="font-size:0.75rem; color:var(--cyan); font-family:var(--font-mono);">${item.context || 'EMAIL_ADDRESS'} (${item.finding_code})</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">⏱️ ${dateStr}</div>
          </td>
          <td>
            <div style="font-weight:700; color:var(--text-main); display:flex; align-items:center; gap:6px;">
              <span>🤖</span> <span>${chatbotLabel}</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-subtle); margin-top:2px;">${botName}</div>
          </td>
          <td>
            <span class="session-badge" onclick="event.stopPropagation(); navigate('#/security-center/event-overview?id=${item.id}&session_id=${sessId}');" style="cursor:pointer; background:rgba(99, 102, 241, 0.15); color:var(--primary); padding:4px 10px; border-radius:6px; font-family:var(--font-mono); font-size:0.8rem; font-weight:700; border:1px solid rgba(99, 102, 241, 0.3); display:inline-flex; align-items:center; gap:4px; transition:all 0.2s;" title="Click to view event telemetry for session ${sessId}">
              🔗 ${sessId}
            </span>
          </td>
          <td>
            <span class="status-badge">🟢 ${item.status || 'open'}</span>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:3px;">${dateStr}</div>
          </td>
          <td>
            <button class="btn-secondary" style="font-size:0.75rem; padding:4px 10px;" onclick="event.stopPropagation(); navigate('#/security-center/event-overview?id=${item.id}&session_id=${sessId}');">Inspect Event →</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger);">Failed to load findings: ${err.message}</td></tr>`;
  }
}

export function formatRelativeTime(isoStr) {
  if (!isoStr) return 'Just now';
  try {
    let dateObj = new Date(isoStr);
    if (isNaN(dateObj.getTime())) {
      const num = Number(isoStr);
      if (!isNaN(num)) {
        dateObj = new Date(num > 10000000000 ? num : num * 1000);
      } else {
        return isoStr || 'Just now';
      }
    }
    const now = Date.now();
    const past = dateObj.getTime();
    const diffSec = Math.max(0, Math.floor((now - past) / 1000));

    if (diffSec < 45) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  } catch (e) {
    return 'Just now';
  }
}
