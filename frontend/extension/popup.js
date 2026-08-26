/**
 * ControlPlane AI Security — Extension Popup Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  const serverInput = document.getElementById("server-url-input");
  const tenantInput = document.getElementById("tenant-input");
  const tokenInput = document.getElementById("token-input");
  const saveBtn = document.getElementById("save-token-btn");
  const autoBtn = document.getElementById("auto-token-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const resetBtn = document.getElementById("reset-btn");
  const copyDeviceBtn = document.getElementById("copy-device-btn");

  // Status panel elements
  const statusPill = document.getElementById("token-status-pill");
  const statusDot = document.getElementById("status-dot-indicator");
  const statusMsg = document.getElementById("status-message-text");
  const statusDeviceId = document.getElementById("status-device-id");
  const statusServerUrl = document.getElementById("status-server-url");
  const statusHeartbeat = document.getElementById("status-heartbeat");
  const dashboardLink = document.getElementById("dashboard-link");

  const hasChromeStorage = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

  function generateUUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Cross-environment storage helper (chrome.storage.local for extensions, sessionStorage for separate browser tabs)
  async function getStorageData(keys) {
    if (hasChromeStorage) {
      return await chrome.storage.local.get(keys);
    } else {
      const res = {};
      for (const k of keys) {
        // Use sessionStorage in web tab mode so separate tabs have isolated device IDs & states
        res[k] = sessionStorage.getItem(k) || localStorage.getItem(k);
      }
      return res;
    }
  }

  async function setStorageData(data) {
    if (hasChromeStorage) {
      await chrome.storage.local.set(data);
    } else {
      for (const [k, v] of Object.entries(data)) {
        sessionStorage.setItem(k, v);
        localStorage.setItem(k, v);
      }
    }
  }

  async function removeStorageData(keys) {
    if (hasChromeStorage) {
      await chrome.storage.local.remove(keys);
    } else {
      for (const k of keys) {
        sessionStorage.removeItem(k);
        localStorage.removeItem(k);
      }
    }
  }

  function cleanUrl(rawUrl) {
    if (!rawUrl) return "";
    let url = rawUrl.trim().replace(/\/$/, "");
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    return url;
  }

  // Load or generate unique Device ID
  let deviceId = "";
  const storedData = await getStorageData(["cp_device_id", "cp_token", "cp_tenant_id", "cp_server_url"]);

  if (storedData && storedData.cp_device_id) {
    deviceId = storedData.cp_device_id;
  } else {
    deviceId = generateUUID();
    await setStorageData({ cp_device_id: deviceId });
  }

  if (statusDeviceId) {
    statusDeviceId.innerText = deviceId;
  }

  // Populate form fields only with stored values (no hardcoded prefill)
  if (storedData && storedData.cp_token && tokenInput) {
    tokenInput.value = storedData.cp_token;
  }
  if (storedData && storedData.cp_tenant_id && tenantInput) {
    tenantInput.value = storedData.cp_tenant_id;
  }
  if (storedData && storedData.cp_server_url && serverInput) {
    serverInput.value = storedData.cp_server_url;
  }

  const activeServerUrl = storedData && storedData.cp_server_url ? storedData.cp_server_url : "";
  if (dashboardLink) {
    dashboardLink.href = activeServerUrl ? `${activeServerUrl}/#/dashboard` : "http://localhost:8000/#/dashboard";
  }

  // Copy Device ID Handler
  if (copyDeviceBtn) {
    copyDeviceBtn.addEventListener("click", async () => {
      if (deviceId) {
        try {
          await navigator.clipboard.writeText(deviceId);
          showToast("Device ID copied to clipboard", "rgba(59, 130, 246, 0.15)", "#3b82f6");
        } catch (e) {
          showToast("Failed to copy Device ID", "rgba(239, 68, 68, 0.15)", "#ef4444");
        }
      }
    });
  }

  // Update UI Status Display
  updateStatusDisplay();

  function updateStatusDisplay() {
    const tokenVal = tokenInput ? tokenInput.value.trim() : "";
    const serverVal = serverInput ? serverInput.value.trim() : "";

    if (tokenVal) {
      if (statusDot) {
        statusDot.className = "status-dot connected";
      }
      if (statusPill) {
        statusPill.innerText = "Connected";
        statusPill.style.color = "#ffffff";
      }
      if (statusMsg) {
        statusMsg.innerText = "This browser is enrolled and reporting to ControlPlane.";
      }
      if (statusServerUrl) {
        statusServerUrl.innerText = serverVal || "—";
      }
      if (statusHeartbeat) {
        statusHeartbeat.innerText = "OK · just now";
        statusHeartbeat.style.color = "#10b981";
      }
    } else {
      if (statusDot) {
        statusDot.className = "status-dot disconnected";
      }
      if (statusPill) {
        statusPill.innerText = "Disconnected";
        statusPill.style.color = "#94a3b8";
      }
      if (statusMsg) {
        statusMsg.innerText = "This browser is currently not connected to an organization.";
      }
      if (statusServerUrl) {
        statusServerUrl.innerText = "—";
      }
      if (statusHeartbeat) {
        statusHeartbeat.innerText = "Offline";
        statusHeartbeat.style.color = "#64748b";
      }
    }
  }

  // Connect Button Handler with Live Server & Token Verification
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const serverVal = cleanUrl(serverInput ? serverInput.value : "");
      const tokenVal = tokenInput ? tokenInput.value.trim() : "";
      const tenantVal = tenantInput ? tenantInput.value.trim() : "";

      if (!serverVal) {
        showToast("Server URL cannot be empty.", "rgba(239, 68, 68, 0.15)", "#ef4444");
        return;
      }
      if (!tenantVal) {
        showToast("Tenant ID cannot be empty (e.g. ankur-tenant-1).", "rgba(239, 68, 68, 0.15)", "#ef4444");
        return;
      }
      if (!tokenVal) {
        showToast("Enrollment token cannot be empty.", "rgba(239, 68, 68, 0.15)", "#ef4444");
        return;
      }

      showToast("Verifying connection with ControlPlane...", "rgba(59, 130, 246, 0.15)", "#3b82f6");

      // Verify connection and register device heartbeat
      let verifyOk = false;
      try {
        const res = await fetch(`${serverVal}/api/v1/tokens/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_id: deviceId,
            token_key: tokenVal,
            tenant_id: tenantVal,
            source: "Chrome Extension"
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errorMsg = errData.detail || `Server rejected enrollment (HTTP ${res.status}).`;
          showToast(errorMsg, "rgba(239, 68, 68, 0.15)", "#ef4444");
          updateStatusDisplay();
          return;
        }

        const data = await res.json().catch(() => ({}));
        verifyOk = true;
      } catch (netErr) {
        showToast(`Cannot reach ControlPlane server at ${serverVal}. Check Server URL.`, "rgba(239, 68, 68, 0.15)", "#ef4444");
        updateStatusDisplay();
        return;
      }

      if (serverInput) serverInput.value = serverVal;

      await setStorageData({
        cp_token: tokenVal,
        cp_tenant_id: tenantVal,
        cp_server_url: serverVal,
        cp_device_id: deviceId
      });

      if (dashboardLink) {
        dashboardLink.href = `${serverVal}/#/dashboard`;
      }

      updateStatusDisplay();
      notifyAllTabs();
      showToast("Connected & enrolled successfully to ControlPlane!", "rgba(16, 185, 129, 0.15)", "#10b981");
    });
  }

  // Disconnect Button Handler
  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", async () => {
      if (tokenInput) tokenInput.value = "";
      await removeStorageData(["cp_token"]);
      updateStatusDisplay();
      notifyAllTabs();
      showToast("Disconnected from ControlPlane.", "rgba(148, 163, 184, 0.15)", "#94a3b8");
    });
  }

  // Reset Button Handler (Clears all & generates a new unique Device ID)
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      await removeStorageData(["cp_token", "cp_tenant_id", "cp_server_url", "cp_device_id"]);
      if (tokenInput) tokenInput.value = "";
      if (tenantInput) tenantInput.value = "";
      if (serverInput) serverInput.value = "";

      // Generate a fresh unique device ID
      deviceId = generateUUID();
      await setStorageData({ cp_device_id: deviceId });
      if (statusDeviceId) statusDeviceId.innerText = deviceId;

      if (dashboardLink) dashboardLink.href = "http://localhost:8000/#/dashboard";
      updateStatusDisplay();
      notifyAllTabs();
      showToast("Settings reset and generated a new Device ID.", "rgba(59, 130, 246, 0.15)", "#3b82f6");
    });
  }

  function notifyAllTabs() {
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({}, (tabs) => {
        if (!tabs) return;
        tabs.forEach((t) => {
          if (t && t.id) {
            chrome.tabs.sendMessage(t.id, { type: "CP_STATE_CHANGED" }).catch(() => {});
          }
        });
      });
    }
  }

  // Auto-Detect (Local Dev Helper) Handler
  if (autoBtn) {
    autoBtn.addEventListener("click", async () => {
      const candidates = [
        cleanUrl(serverInput ? serverInput.value : ""),
        "http://localhost:8000",
        "http://127.0.0.1:8000"
      ].filter(Boolean);

      showToast("Searching for active local token...", "rgba(59, 130, 246, 0.15)", "#3b82f6");

      let foundData = null;
      let workingUrl = "";

      for (const base of Array.from(new Set(candidates))) {
        try {
          const res = await fetch(`${base}/api/v1/tokens/active`);
          if (res.ok) {
            foundData = await res.json();
            workingUrl = base;
            break;
          }
        } catch (e) {
          // Continue scanning next candidate
        }
      }

      if (workingUrl && foundData) {
        if (serverInput) serverInput.value = workingUrl;
        if (tokenInput) tokenInput.value = foundData.token_key;
        if (tenantInput && !tenantInput.value.trim()) tenantInput.value = "default-workspace";

        await setStorageData({
          cp_token: foundData.token_key,
          cp_tenant_id: tenantInput ? tenantInput.value.trim() : "default-workspace",
          cp_server_url: workingUrl,
          cp_device_id: deviceId
        });

        if (dashboardLink) dashboardLink.href = `${workingUrl}/#/dashboard`;
        updateStatusDisplay();
        showToast("Auto-detected local dev server credentials.", "rgba(16, 185, 129, 0.15)", "#10b981");
      } else {
        showToast("No active local token found. Enter your credentials manually.", "rgba(239, 68, 68, 0.15)", "#ef4444");
      }
    });
  }

  function showToast(msg, bg, border) {
    const el = document.getElementById("popup-toast");
    if (!el) return;
    el.innerText = msg;
    el.style.backgroundColor = bg || "rgba(16, 185, 129, 0.15)";
    el.style.borderColor = border || "#10b981";
    el.style.color = border || "#10b981";
    el.style.display = "block";
    setTimeout(() => {
      el.style.display = "none";
    }, 3500);
  }
});
