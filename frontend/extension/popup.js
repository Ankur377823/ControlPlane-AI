/**
 * ControlPlane AI — Extension Popup Controller & Auto-Onboarding
 */

document.addEventListener("DOMContentLoaded", async () => {
  const serverInput = document.getElementById("server-url-input");
  const tenantInput = document.getElementById("tenant-input");
  const tokenInput = document.getElementById("token-input");
  const saveBtn = document.getElementById("save-token-btn");
  const autoBtn = document.getElementById("auto-token-btn");
  const testBtn = document.getElementById("test-guardrail-btn");
  const testInput = document.getElementById("test-prompt-input");
  const testBox = document.getElementById("test-result-box");
  const statusPill = document.getElementById("token-status-pill");
  const daysTag = document.getElementById("token-days-tag");
  const dashboardLink = document.getElementById("dashboard-link");

  const defaultServerUrl = "https://controlplane-botpress-connector.onrender.com";

  // Load existing token, tenant ID, and server URL from storage
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(["cp_token", "cp_tenant_id", "cp_server_url"]);
    if (data && data.cp_token) {
      tokenInput.value = data.cp_token;
      if (statusPill) statusPill.innerText = "CONNECTED";
    }
    if (data && data.cp_tenant_id && tenantInput) {
      tenantInput.value = data.cp_tenant_id;
    }
    if (data && data.cp_server_url && serverInput) {
      serverInput.value = data.cp_server_url;
      if (dashboardLink) dashboardLink.href = `${data.cp_server_url.replace(/\/$/, '')}/#/dashboard`;
    }
  }

  // Save Config Handler
  saveBtn.addEventListener("click", async () => {
    const serverVal = (serverInput ? serverInput.value.trim() : defaultServerUrl).replace(/\/$/, '');
    const tokenVal = tokenInput.value.trim();
    const tenantVal = tenantInput ? tenantInput.value.trim() : "acme-tenant-1";

    if (!tokenVal || !tenantVal || !serverVal) {
      showPopupToast("Please enter Server URL, Tenant ID, and Token", "#ef4444");
      return;
    }
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ cp_token: tokenVal, cp_tenant_id: tenantVal, cp_server_url: serverVal });
    }
    if (dashboardLink) dashboardLink.href = `${serverVal}/#/dashboard`;
    if (statusPill) statusPill.innerText = "CONNECTED";
    showPopupToast(`Connected to ${tenantVal} at ${serverVal}!`, "#10b981");
  });

  // Auto-Enroll Handler (Fetches active 48-day token & connects to tenant)
  autoBtn.addEventListener("click", async () => {
    try {
      const serverVal = (serverInput ? serverInput.value.trim() : defaultServerUrl).replace(/\/$/, '');
      const res = await fetch(`${serverVal}/api/v1/tokens/active`);
      const tenantVal = tenantInput ? (tenantInput.value.trim() || "acme-tenant-1") : "acme-tenant-1";

      if (res.ok) {
        const data = await res.json();
        tokenInput.value = data.token_key;
        if (daysTag) daysTag.innerText = `${data.days_valid || 48} Days Active`;
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({ cp_token: data.token_key, cp_tenant_id: tenantVal, cp_server_url: serverVal });
        }
        if (dashboardLink) dashboardLink.href = `${serverVal}/#/dashboard`;
        if (statusPill) statusPill.innerText = "CONNECTED";
        showPopupToast(`Auto-enrolled on ${tenantVal} with 48-day token!`, "#10b981");
      } else {
        showPopupToast("Failed to fetch active token", "#ef4444");
      }
    } catch (err) {
      showPopupToast("POC API unreachable. Verify Server URL.", "#f59e0b");
    }
  });

  // In-Extension Guardrail Tester
  if (testBtn) {
    testBtn.addEventListener("click", async () => {
      const prompt = testInput.value.trim();
      if (!prompt) return;

      const serverVal = (serverInput ? serverInput.value.trim() : defaultServerUrl).replace(/\/$/, '');
      testBox.style.display = "block";
      testBox.innerHTML = '<span style="color:#38bdf8;">⏳ Evaluating prompt...</span>';

      try {
        const res = await fetch(`${serverVal}/api/v1/resources/res_demo/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_prompt: prompt })
        });
        if (res.ok) {
          const data = await res.json();
          testBox.innerHTML = `
            <div>Action: <strong style="color:${data.action === 'BLOCK' ? '#ef4444' : '#10b981'}">${data.action}</strong></div>
            <div>Sanitized: ${escapeHtml(data.sanitized_prompt || data.user_prompt)}</div>
            <div>Scores (P/$/R): ${data.scores.performance_p}% / ${data.scores.cost_dollars}% / ${data.scores.responsibility_r}%</div>
          `;
        } else {
          testBox.innerText = "Evaluation failed";
        }
      } catch (err) {
        testBox.innerText = "Error: " + err.message;
      }
    });
  }
});

function showPopupToast(msg, bg) {
  const el = document.getElementById("popup-toast");
  if (!el) return;
  el.innerText = msg;
  el.style.background = bg || "#10b981";
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 3500);
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
