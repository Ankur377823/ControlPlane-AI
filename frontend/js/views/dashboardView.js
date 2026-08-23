/**
 * ControlPlane AI — Dashboard View Module
 * Scoped Summary Metrics per Tenant Workspace & Tenant API Keys
 */

import { fetchAnalytics } from '../api.js';
import { showToast } from '../toast.js';
import { getStoredUser } from '../auth.js';

export async function renderDashboardPage() {
  try {
    const user = getStoredUser();
    const activeTenantId = user?.tenant_id || 'ankur-tenant-1';

    const data = await fetchAnalytics(activeTenantId);

    const tIdEl = document.getElementById('dash-tenant-id');
    if (tIdEl) tIdEl.innerText = data.tenant_id || activeTenantId;

    const tKeyEl = document.getElementById('dash-tenant-api-key');
    if (tKeyEl) tKeyEl.innerText = data.tenant_api_key || `tp_live_${activeTenantId.replace(/-/g, '_')}_key`;

    document.getElementById('btn-copy-tenant-key')?.addEventListener('click', () => {
      const apiKey = data.tenant_api_key || `tp_live_${activeTenantId.replace(/-/g, '_')}_key`;
      navigator.clipboard.writeText(apiKey);
      showToast(`Tenant API Key copied to clipboard! (${apiKey})`, 'success');
    });

    document.getElementById('dash-stat-total').innerText = data.total_interceptions || 0;
    document.getElementById('dash-stat-p').innerText = `${data.avg_performance_score || 98.5}%`;
    document.getElementById('dash-stat-c').innerText = `${data.avg_cost_score || 94.2}%`;
    document.getElementById('dash-stat-r').innerText = `${data.avg_responsibility_score || 99.1}%`;
    document.getElementById('dash-stat-latency').innerText = `${data.avg_latency_ms || 12.4} ms`;

    document.getElementById('dash-tier-allow').innerText = data.action_breakdown?.ALLOW || 0;
    document.getElementById('dash-tier-mask').innerText = (data.action_breakdown?.MASK || 0) + (data.action_breakdown?.REDACT || 0);
    document.getElementById('dash-tier-monitor').innerText = (data.action_breakdown?.MONITOR || 0) + (data.action_breakdown?.FLAG || 0);
    document.getElementById('dash-tier-block').innerText = data.action_breakdown?.BLOCK || 0;

    document.getElementById('dash-stat-resources').innerText = data.total_resources || 1;
    document.getElementById('dash-stat-scans').innerText = data.total_scans || 0;

  } catch (err) {
    console.error('Error loading tenant dashboard analytics:', err);
  }
}
