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
    deviceId = 'device_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    await setStorageData({ cp_device_id: deviceId });
  }
  if (statusDeviceId) statusDeviceId.innerText = deviceId;

  // Load existing configuration
  if (storedData.cp_token && tokenInput) {
    tokenInput.value = storedData.cp_token;
  }
  if (storedData.cp_tenant_id && tenantInput) {
    tenantInput.value = storedData.cp_tenant_id;
  }
  
  const loadedServerUrl = cleanUrl(storedData.cp_server_url || defaultServerUrl);
  if (serverInput) serverInput.value = loadedServerUrl;
  if (dashboardLink) dashboardLink.href = `${loadedServerUrl}/#/dashboard`;

  // Update connection status layout
  updateStatusDisplay();

  function updateStatusDisplay() {
    const serverVal = serverInput ? serverInput.value.trim() : defaultServerUrl;
    const tokenVal = tokenInput ? tokenInput.value.trim() : "";
    const tenantVal = tenantInput ? tenantInput.value.trim() : "ankur-tenant-1";

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
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const serverVal = cleanUrl(serverInput ? serverInput.value : defaultServerUrl);
      const tokenVal = tokenInput ? tokenInput.value.trim() : "";
      const tenantVal = tenantInput ? tenantInput.value.trim() : "ankur-tenant-1";

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
      showPopupToast("Connected successfully to ControlPlane!", "rgba(16, 185, 129, 0.15)", "var(--accent-green)");
    });
  }

  // Disconnect Button Handler
  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", async () => {
      if (tokenInput) tokenInput.value = "";
      await removeStorageData(["cp_token"]);
      updateStatusDisplay();
      showPopupToast("Disconnected from ControlPlane.", "rgba(239, 68, 68, 0.15)", "var(--accent-red)");
    });
  }

  // Reset Button Handler
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      await removeStorageData(["cp_token", "cp_tenant_id", "cp_server_url"]);
      if (tokenInput) tokenInput.value = "";
      if (tenantInput) tenantInput.value = "ankur-tenant-1";
      if (serverInput) serverInput.value = defaultServerUrl;
      if (dashboardLink) dashboardLink.href = `${defaultServerUrl}/#/dashboard`;
      updateStatusDisplay();
      showPopupToast("Configuration reset to defaults.", "rgba(99, 102, 241, 0.15)", "var(--primary)");
    });
  }

  // Auto-Enroll Button Handler
  if (autoBtn) {
    autoBtn.addEventListener("click", async () => {
      const serverVal = cleanUrl(serverInput ? serverInput.value : defaultServerUrl);
      const candidates = Array.from(new Set([
        serverVal,
        "http://localhost:8000",
        "http://127.0.0.1:8000"
      ]));

      showPopupToast("Locating active token from API...", "rgba(8, 145, 178, 0.15)", "var(--accent-cyan)");

      let data = null;
      let workingUrl = "";

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

      const tenantVal = tenantInput ? (tenantInput.value.trim() || "ankur-tenant-1") : "ankur-tenant-1";

      if (workingUrl && data) {
        if (serverInput) serverInput.value = workingUrl;
        if (tokenInput) tokenInput.value = data.token_key;
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
        showPopupToast("API unreachable. Verify your backend server is running on port 8000.", "rgba(239, 68, 68, 0.15)", "var(--accent-red)");
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
