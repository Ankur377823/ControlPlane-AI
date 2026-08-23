/**
 * ControlPlane AI — Event Overview View Controller & Modal Popup
 * Deep-dive telemetry for specific risk finding events & LLM Chat Sessions Table Modal Popup
 */

import { fetchFindings, fetchFindingById, updateFindingStatus } from '../api.js';
import { formatRelativeTime } from './findingsView.js';

let sessionSearchTerm = '';

export async function openEventOverviewModal(eventId = null, sessionId = null) {
  const modal = document.getElementById('event-overview-modal');
  const container = document.getElementById('modal-event-overview-content');
  if (!modal || !container) return;

  modal.style.display = 'flex';
  container.innerHTML = `
    <div class="card" style="text-align:center; padding:3rem; color:var(--text-muted);">
      <div style="font-size:1.4rem; margin-bottom:0.5rem;">🔍 Loading Security Event & Session Telemetry...</div>
      <p style="font-size:0.85rem;">Retrieving prompt interactions and session registries across LLM chatbots.</p>
    </div>`;

  await renderModalTelemetryContent(container, eventId, sessionId);
}

export function closeEventOverviewModal() {
  const modal = document.getElementById('event-overview-modal');
  if (modal) modal.style.display = 'none';
}

window.openEventOverviewModal = openEventOverviewModal;
window.closeEventOverviewModal = closeEventOverviewModal;

export async function renderEventOverviewPage(queryParams) {
  const container = document.getElementById('event-overview-container');
  if (!container) return;

  const eventId = queryParams?.get('id');
  const targetSessionId = queryParams?.get('session_id');

  container.innerHTML = `
    <div class="card" style="text-align:center; padding:3rem; color:var(--text-muted);">
      <div style="font-size:1.4rem; margin-bottom:0.5rem;">🔍 Loading Security Event & Session Telemetry...</div>
      <p style="font-size:0.85rem;">Retrieving prompt interactions and session registries across LLM chatbots.</p>
    </div>`;

  await renderModalTelemetryContent(container, eventId, targetSessionId);
}

async function renderModalTelemetryContent(container, eventId, targetSessionId) {
  try {
    const allFindings = await fetchFindings({ limit: 100 });
    
    let activeEvent = null;
    if (eventId) {
      activeEvent = allFindings.find(f => f.id === eventId);
      if (!activeEvent) {
        try {
          activeEvent = await fetchFindingById(eventId);
        } catch (e) {}
      }
    }
    
    if (!activeEvent && targetSessionId) {
      activeEvent = allFindings.find(f => f.session_id === targetSessionId);
    }
    
    if (!activeEvent && allFindings.length > 0) {
      activeEvent = allFindings[0];
    }

    if (!activeEvent) {
      container.innerHTML = `
        <div class="card" style="text-align:center; padding:3rem;">
          <h3 style="color:var(--text-muted); margin-bottom:1rem;">No Security Events or Session Telemetry Found</h3>
          <button class="btn" onclick="navigate('#/security-center/risk-findings')">← Back to Findings</button>
        </div>`;
      return;
    }

    const ev = activeEvent;
    const sevClass = (ev.severity || 'HIGH').toLowerCase();
    const chatbotName = ev.source || 'Endpoint AI Bot';
    const resourceTitle = ev.resource_name || 'Global AI Guardrail';

    let html = `
      <!-- EVENT BANNER -->
      <div class="card" style="border-left: 4px solid var(--primary); margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
              <span class="sev-chip sev-chip-${sevClass}">${ev.severity || 'HIGH'}</span>
              <span class="source-tag" style="background:rgba(99, 102, 241, 0.2); color:var(--primary); font-weight:700;">🤖 ${chatbotName}</span>
              <span style="font-size:0.8rem; color:var(--text-muted); font-family:var(--font-mono);">⏱️ ${formatRelativeTime(ev.timestamp)} (${ev.timestamp})</span>
            </div>
            <h2 style="font-family:var(--font-brand); font-size:1.5rem; color:#fff; margin-bottom:4px;">${ev.finding_title}</h2>
            <div style="font-size:0.85rem; color:var(--text-muted);">
              Risk Code: <code style="color:var(--cyan); font-weight:700;">${ev.finding_code}</code> | Target Resource: <strong style="color:#fff;">${resourceTitle}</strong> | Context: <strong style="color:var(--warning);">${ev.context}</strong>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <button class="btn" onclick="navigate('#/security-center/risk-findings')" style="font-weight:700;">← Back to Findings</button>
            <button class="btn-secondary" id="btn-ev-modal-resolve">Mark Resolved</button>
            <button class="btn-secondary" id="btn-ev-modal-investigate">Mark Investigating</button>
          </div>
        </div>
      </div>

      <!-- CHATBOT TARGET & SESSION METRICS -->
      <div class="grid-4" style="margin-bottom: 1.5rem;">
        <div class="card" style="margin-bottom:0; border: 1px solid var(--border);">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">TARGET CHATBOT</div>
          <div style="font-size:1.15rem; font-weight:800; color:#fff; margin-top:4px; display:flex; align-items:center; gap:6px;">
            <span>🤖</span> <span>${chatbotName}</span>
          </div>
          <div style="font-size:0.75rem; color:var(--text-subtle); margin-top:2px;">${resourceTitle} (${ev.account_name || 'Demo Account'})</div>
        </div>

        <div class="card" style="margin-bottom:0; border: 1px solid var(--primary); background: rgba(99, 102, 241, 0.05);">
          <div style="font-size:0.75rem; color:var(--primary); font-weight:700; text-transform:uppercase;">ACTIVE CHAT SESSION ID</div>
          <div style="font-size:1.05rem; font-weight:800; color:var(--primary); font-family:var(--font-mono); margin-top:4px;">${ev.session_id || 'sess_8f3a92b1'}</div>
          <div style="font-size:0.75rem; color:var(--text-subtle); margin-top:2px;">Unique Session Payload</div>
        </div>

        <div class="card" style="margin-bottom:0; border: 1px solid var(--border);">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">ENFORCEMENT ACTION</div>
          <div style="font-size:1.15rem; font-weight:800; color:var(--cyan); margin-top:4px;">${ev.action} (${(ev.enforcement_mode || 'block').toUpperCase()})</div>
          <div style="font-size:0.75rem; color:var(--text-subtle); margin-top:2px;">Evaluation Latency: ${ev.latency_ms} ms</div>
        </div>

        <div class="card" style="margin-bottom:0; border: 1px solid var(--border);">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">GOVERNANCE SCORES (P / C / R)</div>
          <div style="font-size:1.05rem; font-weight:800; color:var(--success); margin-top:4px;">P: ${ev.performance_score}% | C: $${ev.cost_score}% | R: ${ev.responsibility_score}%</div>
          <div style="font-size:0.75rem; color:var(--text-subtle); margin-top:2px;">Finding Status: 🟢 ${ev.status}</div>
        </div>
      </div>

      <!-- PROMPT VS SANITIZED PROMPT TELEMETRY -->
      <div class="grid-2" style="margin-bottom: 1.5rem;">
        <div class="card">
          <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
            <span>User Input Prompt (Raw Interception)</span>
            <span style="font-size:0.75rem; color:var(--warning);">Raw Incoming Payload</span>
          </div>
          <div style="background:var(--bg-input); padding:1.1rem; border-radius:10px; font-family:var(--font-mono); font-size:0.88rem; color:#f8fafc; border:1px solid var(--border); min-height:80px; white-space:pre-wrap;">
            ${escapeHtml(ev.user_prompt)}
          </div>
        </div>

        <div class="card">
          <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
            <span>Sanitized Prompt (Redacted Payload)</span>
            <span style="font-size:0.75rem; color:var(--success);">Sanitized Outgoing Payload</span>
          </div>
          <div style="background:var(--bg-input); padding:1.1rem; border-radius:10px; font-family:var(--font-mono); font-size:0.88rem; color:#7dd3fc; border:1px solid var(--border); min-height:80px; white-space:pre-wrap;">
            ${escapeHtml(ev.sanitized_prompt || ev.user_prompt)}
          </div>
        </div>
      </div>

      <!-- TRIGGERED RULES BREAKDOWN -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-title">Triggered Guardrail Rules & Risk Findings Breakdown</div>
        <pre style="background:var(--bg-input); padding:1.2rem; border-radius:12px; font-family:var(--font-mono); font-size:0.84rem; color:#fdba74; overflow-x:auto; border:1px solid var(--border); margin:0;">${JSON.stringify(ev.risk_findings || [], null, 2)}</pre>
      </div>

      <!-- ALL LLM CHAT SESSIONS TELEMETRY TABLE -->
      <div class="card" style="margin-bottom:0;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:1rem;">
          <div>
            <div class="card-title" style="margin-bottom:4px; font-size:1.2rem;">🌐 LLM Chatbot Sessions Telemetry Registry</div>
            <p style="font-size:0.84rem; color:var(--text-muted); margin:0;">
              Every chat interaction in an LLM chatbot (ChatGPT, Claude, Gemini, Botpress, Copilot) is assigned a unique Session ID. Click any row to inspect telemetry on this page.
            </p>
          </div>

          <div style="display:flex; align-items:center; gap:10px;">
            <input type="text" id="ev-modal-session-search" placeholder="Search Session IDs..." value="${escapeHtml(sessionSearchTerm)}" style="padding:6px 12px; font-size:0.84rem; width:220px;">
            <button class="btn-secondary" id="btn-modal-refresh-sessions" style="padding:6px 12px;">🔄 Refresh</button>
          </div>
        </div>

        <div class="table-card">
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Chatbot Target</th>
                <th>User Prompt Preview</th>
                <th>Action</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Select Telemetry</th>
              </tr>
            </thead>
            <tbody id="ev-modal-sessions-table-body">
              ${renderSessionRows(allFindings, ev.session_id, sessionSearchTerm)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Attach status update button listeners
    document.getElementById('btn-ev-modal-resolve')?.addEventListener('click', async () => {
      await updateFindingStatus(ev.id, 'resolved');
      renderModalTelemetryContent(container, ev.id, ev.session_id);
    });

    document.getElementById('btn-ev-modal-investigate')?.addEventListener('click', async () => {
      await updateFindingStatus(ev.id, 'investigating');
      renderModalTelemetryContent(container, ev.id, ev.session_id);
    });

    // Session Table search listener
    document.getElementById('ev-modal-session-search')?.addEventListener('input', (e) => {
      sessionSearchTerm = e.target.value;
      const tbody = document.getElementById('ev-modal-sessions-table-body');
      if (tbody) {
        tbody.innerHTML = renderSessionRows(allFindings, ev.session_id, sessionSearchTerm);
        bindModalSessionRowClickListeners(container, allFindings);
      }
    });

    document.getElementById('btn-modal-refresh-sessions')?.addEventListener('click', () => {
      renderModalTelemetryContent(container, ev.id, ev.session_id);
    });

    bindModalSessionRowClickListeners(container, allFindings);

  } catch (err) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:3rem; color:var(--danger);">
        Failed to load event & session telemetry: ${err.message}<br><br>
        <button class="btn" onclick="navigate('#/security-center/risk-findings')">← Back to Findings</button>
      </div>`;
  }
}

function renderSessionRows(findings, activeSessionId, filterTerm = '') {
  let filtered = findings;
  if (filterTerm) {
    const term = filterTerm.toLowerCase();
    filtered = findings.filter(f =>
      (f.session_id && f.session_id.toLowerCase().includes(term)) ||
      (f.source && f.source.toLowerCase().includes(term)) ||
      (f.user_prompt && f.user_prompt.toLowerCase().includes(term)) ||
      (f.finding_title && f.finding_title.toLowerCase().includes(term))
    );
  }

  if (filtered.length === 0) {
    return `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No chat sessions match search query "${escapeHtml(filterTerm)}".</td></tr>`;
  }

  return filtered.map(item => {
    const isActive = item.session_id === activeSessionId;
    const rowBg = isActive ? 'background: rgba(99, 102, 241, 0.12); border-left: 3px solid var(--primary);' : '';
    const sevClass = (item.severity || 'HIGH').toLowerCase();
    const promptShort = (item.user_prompt || '').length > 50 ? item.user_prompt.substring(0, 50) + '...' : item.user_prompt;
    const botName = item.source || 'Endpoint AI Bot';

    return `
      <tr data-finding-id="${item.id}" data-session-id="${item.session_id}" style="cursor:pointer; ${rowBg}">
        <td>
          <span style="font-family:var(--font-mono); font-size:0.82rem; font-weight:700; color:${isActive ? 'var(--primary)' : '#fff'}; display:inline-flex; align-items:center; gap:6px;">
            ${isActive ? '👉' : '🔗'} ${item.session_id}
            ${isActive ? '<span style="background:var(--primary); color:#fff; font-size:0.68rem; padding:1px 6px; border-radius:4px;">ACTIVE</span>' : ''}
          </span>
        </td>
        <td>
          <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">🤖 ${botName}</div>
          <div style="font-size:0.72rem; color:var(--text-subtle);">${item.resource_name || 'Global AI Guardrail'}</div>
        </td>
        <td>
          <div style="font-family:var(--font-mono); font-size:0.78rem; color:#cbd5e1;" title="${escapeHtml(item.user_prompt)}">
            ${escapeHtml(promptShort)}
          </div>
        </td>
        <td>
          <span class="status-badge" style="font-size:0.75rem; font-weight:700; color:var(--cyan);">${item.action}</span>
        </td>
        <td>
          <span class="sev-chip sev-chip-${sevClass}">${item.severity || 'HIGH'}</span>
        </td>
        <td>
          <span style="font-size:0.78rem;">🟢 ${item.status || 'open'}</span>
        </td>
        <td>
          <button class="btn-secondary" style="font-size:0.72rem; padding:3px 8px;">
            ${isActive ? 'Selected ✓' : 'Inspect Telemetry →'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function bindModalSessionRowClickListeners(container, findings) {
  document.querySelectorAll('#ev-modal-sessions-table-body tr[data-session-id]').forEach(tr => {
    tr.addEventListener('click', () => {
      const fId = tr.getAttribute('data-finding-id');
      const sId = tr.getAttribute('data-session-id');
      renderModalTelemetryContent(container, fId, sId);
      window.history.replaceState(null, '', `#/security-center/event-overview?id=${fId}&session_id=${sId}`);
    });
  });
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
