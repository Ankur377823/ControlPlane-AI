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

  const defaultServerUrl = "http://localhost:8000";

  function cleanUrl(rawUrl) {
    if (!rawUrl) return defaultServerUrl;
    let url = rawUrl.trim().replace(/\/$/, '');
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }
    return url;
  }


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
    let loadedServerUrl = cleanUrl(data ? data.cp_server_url : null);
    if (serverInput) serverInput.value = loadedServerUrl;
    if (dashboardLink) dashboardLink.href = `${loadedServerUrl}/#/dashboard`;
  } else {
    if (serverInput) serverInput.value = defaultServerUrl;
  }

  // Save Config Handler
  saveBtn.addEventListener("click", async () => {
    const serverVal = cleanUrl(serverInput ? serverInput.value : defaultServerUrl);
    const tokenVal = tokenInput.value.trim();
    const tenantVal = tenantInput ? tenantInput.value.trim() : "acme-tenant-1";

    if (!tokenVal || !tenantVal || !serverVal) {
      showPopupToast("Please enter Server URL, Tenant ID, and Token", "#ef4444");
      return;
    }
    if (serverInput) serverInput.value = serverVal;
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
      const inputVal = cleanUrl(serverInput ? serverInput.value : defaultServerUrl);
      const candidates = Array.from(new Set([
        inputVal,
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://controlplane-botpress-connector.onrender.com"
      ]));

      let workingUrl = null;
      let data = null;

      for (const base of candidates) {
        try {
          const res = await fetch(`${base}/api/v1/tokens/active`);
          if (res.ok) {
            data = await res.json();
            workingUrl = base;
            break;
          }
        } catch (e) {
          // Try next candidate URL
        }
      }

      const tenantVal = tenantInput ? (tenantInput.value.trim() || "acme-tenant-1") : "acme-tenant-1";

      if (workingUrl && data) {
        if (serverInput) serverInput.value = workingUrl;
        tokenInput.value = data.token_key;
        if (daysTag) daysTag.innerText = `${data.days_valid || 48} Days Active`;
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({ cp_token: data.token_key, cp_tenant_id: tenantVal, cp_server_url: workingUrl });
        }
        if (dashboardLink) dashboardLink.href = `${workingUrl}/#/dashboard`;
        if (statusPill) statusPill.innerText = "CONNECTED";
        showPopupToast(`Connected to ${workingUrl}!`, "#10b981");
      } else {
        showPopupToast("API unreachable. Start server on localhost:8000.", "#ef4444");
      }
    } catch (err) {
      showPopupToast("API unreachable. Verify Server URL.", "#f59e0b");
    }
  });


  // In-Extension Guardrail Tester
  if (testBtn) {
    testBtn.addEventListener("click", async () => {
      const prompt = testInput.value.trim();
      if (!prompt) return;

      const serverVal = cleanUrl(serverInput ? serverInput.value : defaultServerUrl);
      const candidates = Array.from(new Set([
        serverVal,
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://controlplane-botpress-connector.onrender.com"
      ]));

      testBox.style.display = "block";
      testBox.innerHTML = '<span style="color:#38bdf8;">⏳ Evaluating prompt...</span>';

      let data = null;
      for (const base of candidates) {
        try {
          const res = await fetch(`${base}/api/v1/resources/res_demo/check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_prompt: prompt })
          });
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch (e) {
          // Try next candidate
        }
      }

      if (data) {
        testBox.innerHTML = `
          <div>Action: <strong style="color:${data.action === 'BLOCK' ? '#ef4444' : '#10b981'}">${data.action}</strong></div>
          <div>Sanitized: ${escapeHtml(data.sanitized_prompt || data.user_prompt)}</div>
          <div>Scores (P/$/R): ${data.scores.performance_p}% / ${data.scores.cost_dollars}% / ${data.scores.responsibility_r}%</div>
        `;
      } else {
        testBox.innerText = "Evaluation failed. Make sure local server is running at http://localhost:8000";
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
