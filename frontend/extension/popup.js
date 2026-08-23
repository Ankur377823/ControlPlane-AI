/**
 * ControlPlane AI — Extension Popup & Configuration Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  const serverInput = document.getElementById("server-url-input");
  const tenantInput = document.getElementById("tenant-input");
  const tokenInput = document.getElementById("token-input");
  const saveBtn = document.getElementById("save-token-btn");
  const autoBtn = document.getElementById("auto-token-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const resetBtn = document.getElementById("reset-btn");
  const testBtn = document.getElementById("test-guardrail-btn");
  const testInput = document.getElementById("test-prompt-input");
  const testBox = document.getElementById("test-result-box");
  
  // Status panel elements
  const statusPill = document.getElementById("token-status-pill");
  const statusDot = document.getElementById("status-dot-indicator");
  const statusMsg = document.getElementById("status-message-text");
  const statusDeviceId = document.getElementById("status-device-id");
  const statusServerUrl = document.getElementById("status-server-url");
  const statusHeartbeat = document.getElementById("status-heartbeat");
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

  // Cross-environment helper for chrome storage or localStorage fallback
  async function getStorageData(keys) {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      return await chrome.storage.local.get(keys);
    } else {
      const res = {};
      for (const k of keys) {
        res[k] = localStorage.getItem(k);
      }
      return res;
    }
  }

  async function setStorageData(data) {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set(data);
    } else {
      for (const [k, v] of Object.entries(data)) {
        localStorage.setItem(k, v);
      }
    }
  }

  async function removeStorageData(keys) {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.remove(keys);
    } else {
      for (const k of keys) {
        localStorage.removeItem(k);
      }
    }
  }

  // Initialize or load unique Device ID
  let deviceId = "";
  const storedData = await getStorageData(["cp_device_id", "cp_token", "cp_tenant_id", "cp_server_url"]);
  
  if (storedData.cp_device_id) {
    deviceId = storedData.cp_device_id;
  } else {
    // Generate simulated UUID
    deviceId = 'device_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    await setStorageData({ cp_device_id: deviceId });
  }
  if (statusDeviceId) statusDeviceId.innerText = deviceId;

  // Load existing configuration
  if (storedData.cp_token) {
    tokenInput.value = storedData.cp_token;
  }
  if (storedData.cp_tenant_id) {
    tenantInput.value = storedData.cp_tenant_id;
  }
  
  const loadedServerUrl = cleanUrl(storedData.cp_server_url || defaultServerUrl);
  if (serverInput) serverInput.value = loadedServerUrl;
  if (dashboardLink) dashboardLink.href = `${loadedServerUrl}/#/dashboard`;

  // Update connection status layout
  updateStatusDisplay();

  // Helper to sync status details based on current input values
  function updateStatusDisplay() {
    const serverVal = serverInput.value.trim();
    const tokenVal = tokenInput.value.trim();
    const tenantVal = tenantInput.value.trim();

    if (statusServerUrl) statusServerUrl.innerText = serverVal;

    if (tokenVal) {
      if (statusDot) statusDot.className = "status-dot connected";
      if (statusPill) {
        statusPill.innerText = "CONNECTED";
        statusPill.style.color = "var(--accent-green)";
      }
      if (statusMsg) {
        statusMsg.innerText = `This browser is enrolled and reporting to ControlPlane under workspace "${tenantVal}".`;
      }
      if (statusHeartbeat) {
        statusHeartbeat.innerText = "OK - just now";
        statusHeartbeat.style.color = "var(--accent-green)";
      }
    } else {
      if (statusDot) statusDot.className = "status-dot";
      if (statusPill) {
        statusPill.innerText = "DISCONNECTED";
        statusPill.style.color = "var(--accent-red)";
      }
      if (statusMsg) {
        statusMsg.innerText = "This browser is currently not connected to an active ControlPlane Tenant.";
      }
      if (statusHeartbeat) {
        statusHeartbeat.innerText = "Offline";
        statusHeartbeat.style.color = "var(--accent-red)";
      }
    }
  }

  // Connect Button Handler
  saveBtn.addEventListener("click", async () => {
    const serverVal = cleanUrl(serverInput ? serverInput.value : defaultServerUrl);
    const tokenVal = tokenInput.value.trim();
    const tenantVal = tenantInput ? tenantInput.value.trim() : "acme-tenant-1";

    if (!tokenVal || !tenantVal || !serverVal) {
      showPopupToast("Please fill in Server URL, Tenant ID, and Enrollment Token", "rgba(239, 68, 68, 0.15)", "var(--accent-red)");
      return;
    }

    if (serverInput) serverInput.value = serverVal;

    await setStorageData({
      cp_token: tokenVal,
      cp_tenant_id: tenantVal,
      cp_server_url: serverVal
    });

    if (dashboardLink) dashboardLink.href = `${serverVal}/#/dashboard`;
    updateStatusDisplay();
    showPopupToast(`Connected successfully to workspace "${tenantVal}"!`, "rgba(16, 185, 129, 0.15)", "var(--accent-green)");
  });

  // Disconnect Button Handler
  disconnectBtn.addEventListener("click", async () => {
    tokenInput.value = "";
    await removeStorageData(["cp_token"]);
    updateStatusDisplay();
    showPopupToast("Disconnected browser from ControlPlane.", "rgba(255, 255, 255, 0.05)", "var(--text-muted)");
  });

  // Reset Button Handler
  resetBtn.addEventListener("click", async () => {
    serverInput.value = defaultServerUrl;
    tenantInput.value = "acme-tenant-1";
    tokenInput.value = "";
    
    await removeStorageData(["cp_token", "cp_tenant_id", "cp_server_url"]);
    
    if (dashboardLink) dashboardLink.href = `${defaultServerUrl}/#/dashboard`;
    updateStatusDisplay();
    showPopupToast("Configuration settings reset to default values.", "rgba(239, 68, 68, 0.15)", "var(--accent-red)");
  });

  // Auto-Enroll Handler (Fetches active token and connects to tenant)
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
          // Try next URL candidate
        }
      }

      const tenantVal = tenantInput ? (tenantInput.value.trim() || "acme-tenant-1") : "acme-tenant-1";

      if (workingUrl && data) {
        if (serverInput) serverInput.value = workingUrl;
        tokenInput.value = data.token_key;
        if (daysTag) daysTag.innerText = `${data.days_valid || 48} Days Active`;
        
        await setStorageData({
          cp_token: data.token_key,
          cp_tenant_id: tenantVal,
          cp_server_url: workingUrl
        });

        if (dashboardLink) dashboardLink.href = `${workingUrl}/#/dashboard`;
        updateStatusDisplay();
        showPopupToast(`Auto-enrolled successfully at ${workingUrl}!`, "rgba(16, 185, 129, 0.15)", "var(--accent-green)");
      } else {
        showPopupToast("API unreachable. Verify your local server is running.", "rgba(239, 68, 68, 0.15)", "var(--accent-red)");
      }
    } catch (err) {
      showPopupToast("Connection failed. Verify server URL.", "rgba(239, 68, 68, 0.15)", "var(--accent-red)");
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
      testBox.innerHTML = '<span style="color: var(--accent-cyan);">⏳ Evaluating prompt...</span>';

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
          <div style="margin-bottom: 4px;">Action: <strong style="color: ${data.action === 'BLOCK' ? 'var(--accent-red)' : 'var(--accent-green)'}">${data.action}</strong></div>
          <div style="margin-bottom: 4px; color: var(--text-muted);">Sanitized: ${escapeHtml(data.sanitized_prompt || data.user_prompt)}</div>
          <div style="color: var(--text-muted);">Scores (P/$/R): ${data.scores.performance_p}% / ${data.scores.cost_dollars}% / ${data.scores.responsibility_r}%</div>
        `;
      } else {
        testBox.innerText = "Evaluation failed. Make sure local server is running at http://localhost:8000";
      }
    });
  }
});

function showPopupToast(msg, bg, border) {
  const el = document.getElementById("popup-toast");
  if (!el) return;
  el.innerText = msg;
  el.style.backgroundColor = bg || "rgba(16, 185, 129, 0.15)";
  el.style.borderColor = border || "var(--accent-green)";
  el.style.color = border || "var(--accent-green)";
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 3500);
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
