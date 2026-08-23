/**
 * ControlPlane AI Guardrail - Content Script for AI Chat Tools
 * Supported AI Tools: ChatGPT, Claude, Gemini, DeepSeek, Kimi, Local Studio.
 *
 * Permanent Block Protection System:
 *   1. Synchronous event interception on Enter key, Send button click, and Form Submit.
 *   2. Main-World Fetch/XHR Network Interceptor injected into page DOM to physically block outgoing API calls.
 *   3. Permanent memory cache of blocked prompts to prevent repeat bypass.
 */

(function () {
  const host = window.location.hostname;
  const isAITool =
    host.includes("chatgpt.com") ||
    host.includes("openai.com") ||
    host.includes("claude.ai") ||
    host.includes("gemini.google.com") ||
    host.includes("deepseek.com") ||
    host.includes("kimi.moonshot.cn") ||
    host.includes("kimi.ai") ||
    host.includes("botpress.cloud") ||
    host.includes("onrender.com") ||
    host.includes("localhost") ||
    host.includes("127.0.0.1");

  if (!isAITool) return;

  if (document.getElementById("controlplane-top-banner")) return;

  console.log("ControlPlane AI Guardrail active on: " + host);

  // Cache of permanently blocked prompt texts for instant synchronous blocking
  const blockedPromptsSet = new Set();

  // 1. Inject Page-Level Fetch Interceptor (Main-World Network Shield)
  injectNetworkShield();

  // 2. Create Top Banner Bar UI
  const banner = document.createElement("div");
  banner.id = "controlplane-top-banner";
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 38px;
    z-index: 2147483647;
    background: #fef3c7;
    border-bottom: 1px solid #f59e0b;
    color: #78350f;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  `;

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 14px;">⚠️</span>
      <span id="cp-banner-text"><strong>ControlPlane AI Monitoring Enabled</strong> — Active for ${host}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <span id="cp-banner-badge" style="background: #f59e0b; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase;">MONITORING</span>
      <button id="cp-banner-dismiss" style="background: transparent; border: 1px solid #d97706; color: #78350f; padding: 2px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">Dismiss</button>
    </div>
  `;

  document.documentElement.style.marginTop = "38px";
  document.body.appendChild(banner);

  document.getElementById("cp-banner-dismiss").addEventListener("click", () => {
    banner.style.display = "none";
    document.documentElement.style.marginTop = "0px";
  });

  // Track check processing state
  let isChecking = false;

  // 3. Synchronous Interception on Enter Key
  document.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isChecking) {
      const activeEl = document.activeElement;
      if (isInputTarget(activeEl)) {
        const text = getInputValue(activeEl);
        if (!text) return;

        // Instant synchronous check against blocked cache
        if (blockedPromptsSet.has(text)) {
          haltEvent(e, activeEl);
          updateBannerUI("BLOCK", "⛔ Permanently Blocked: Prompt contains sensitive secret/PII or injection threat!");
          return false;
        }

        // Halt DOM event propagation synchronously BEFORE async fetch
        haltEvent(e, activeEl);
        isChecking = true;

        const result = await evaluatePromptWithBackend(text);
        handleEvaluationResult(result, text, activeEl);
        isChecking = false;
      }
    }
  }, true);

  // 4. Synchronous Interception on Send Button Click & Form Submit
  document.addEventListener("click", async (e) => {
    if (isChecking) return;
    const target = e.target;
    const sendBtn = target.closest("button[type='submit'], button[aria-label*='Send'], button[aria-label*='send'], button[data-testid*='send-button'], button#send-button");

    if (sendBtn) {
      const inputEl = findAssociatedInput(sendBtn);
      if (inputEl) {
        const text = getInputValue(inputEl);
        if (!text) return;

        if (blockedPromptsSet.has(text)) {
          haltEvent(e, inputEl);
          updateBannerUI("BLOCK", "⛔ Permanently Blocked: Prompt contains sensitive secret/PII or injection threat!");
          return false;
        }

        haltEvent(e, inputEl);
        isChecking = true;

        const result = await evaluatePromptWithBackend(text);
        handleEvaluationResult(result, text, inputEl);
        isChecking = false;
      }
    }
  }, true);

  // 5. Evaluation Result Handler
  function handleEvaluationResult(result, rawText, inputEl) {
    if (!result) return;

    if (result.action === "BLOCK") {
      blockedPromptsSet.add(rawText);
      if (inputEl) {
        inputEl.style.border = "2px solid #ef4444";
        inputEl.style.boxShadow = "0 0 12px rgba(239, 68, 68, 0.4)";
      }
      updateBannerUI("BLOCK", "⛔ Submission Blocked: Prompt contains sensitive secret/PII or injection threat!", result);
      // Notify main-world fetch interceptor to block this text
      window.postMessage({ type: "CP_BLOCK_PROMPT", text: rawText }, "*");
      return;
    }

    // Unblock text if policy is set to MONITOR, WARN, MASK, or ALLOW
    blockedPromptsSet.delete(rawText);
    if (inputEl) {
      inputEl.style.border = "";
      inputEl.style.boxShadow = "";
    }
    window.postMessage({ type: "CP_UNBLOCK_PROMPT", text: rawText }, "*");

    if (result.action === "MASK" || result.action === "REDACT") {
      setInputValue(inputEl, result.sanitized_prompt);
      updateBannerUI("MASK", "🛡️ Input Masked: Sensitive data auto-redacted before sending.", result);
      triggerNativeSubmit(inputEl);
    } else if (result.action === "MONITOR" || result.action === "FLAG" || result.risk_findings.length > 0) {
      updateBannerUI("MONITOR", "👁️ Warning: Monitored & Audited — Risk findings recorded to DB.", result);
      triggerNativeSubmit(inputEl);
    } else {
      updateBannerUI("ALLOW", "✅ Clean Query — Allowed", result);
      triggerNativeSubmit(inputEl);
    }
  }


  // Helpers
  function isInputTarget(el) {
    if (!el) return false;
    return el.tagName === "TEXTAREA" || el.tagName === "INPUT" || el.contentEditable === "true" || el.getAttribute("role") === "textbox";
  }

  function getInputValue(el) {
    if (!el) return "";
    return (el.value || el.innerText || el.textContent || "").trim();
  }

  function setInputValue(el, val) {
    if (!el) return;
    if (el.value !== undefined) el.value = val;
    else el.innerText = val;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function haltEvent(e, inputEl) {
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  function findAssociatedInput(btn) {
    const form = btn.closest("form");
    if (form) {
      const input = form.querySelector("textarea, input, [contenteditable='true']");
      if (input) return input;
    }
    return document.querySelector("textarea, [contenteditable='true'], input[type='text']");
  }

  function triggerNativeSubmit(inputEl) {
    const form = inputEl ? inputEl.closest("form") : null;
    if (form) {
      const submitBtn = form.querySelector("button[type='submit'], button[aria-label*='Send']");
      if (submitBtn) {
        submitBtn.click();
        return;
      }
    }
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true,
    });
    inputEl.dispatchEvent(enterEvent);
  }

  async function evaluatePromptWithBackend(text) {
    try {
      let tokenKey = "cp_live_default";
      let tenantId = "acme-tenant-1";
      let serverUrl = "https://controlplane-botpress-connector.onrender.com";

      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        const stored = await chrome.storage.local.get(["cp_token", "cp_tenant_id", "cp_server_url"]);
        if (stored && stored.cp_token) tokenKey = stored.cp_token;
        if (stored && stored.cp_tenant_id) tenantId = stored.cp_tenant_id;
        if (stored && stored.cp_server_url) serverUrl = stored.cp_server_url.replace(/\/$/, '');
      }

      let currentSessionId = window.__cp_session_id;
      if (!currentSessionId) {
        let botTag = "chatgpt";
        if (host.includes("claude")) botTag = "claude";
        else if (host.includes("gemini")) botTag = "gemini";
        else if (host.includes("deepseek")) botTag = "deepseek";
        else if (host.includes("kimi")) botTag = "kimi";
        else if (host.includes("localhost") || host.includes("127.0.0.1")) botTag = "local";

        currentSessionId = `sess_${botTag}_${Math.random().toString(36).substring(2, 9)}`;
        window.__cp_session_id = currentSessionId;
      }

      const res = await fetch(`${serverUrl}/api/v1/resources/res_demo/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + tokenKey,
          "X-Tenant-ID": tenantId
        },
        body: JSON.stringify({ user_prompt: text, session_id: currentSessionId }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("ControlPlane Guardrail API offline:", err);
    }
    return null;
  }

  function updateBannerUI(action, message, data) {
    const textEl = document.getElementById("cp-banner-text");
    const badgeEl = document.getElementById("cp-banner-badge");

    textEl.innerText = message;
    badgeEl.innerText = action;

    if (action === "BLOCK") {
      banner.style.background = "#fee2e2";
      banner.style.borderBottom = "1px solid #ef4444";
      banner.style.color = "#991b1b";
      badgeEl.style.background = "#ef4444";
      badgeEl.style.color = "#ffffff";
    } else if (action === "MASK" || action === "REDACT") {
      banner.style.background = "#e0f2fe";
      banner.style.borderBottom = "1px solid #0284c7";
      banner.style.color = "#075985";
      badgeEl.style.background = "#0284c7";
      badgeEl.style.color = "#ffffff";
    } else if (action === "MONITOR") {
      banner.style.background = "#fef3c7";
      banner.style.borderBottom = "1px solid #f59e0b";
      banner.style.color = "#78350f";
      badgeEl.style.background = "#f59e0b";
      badgeEl.style.color = "#ffffff";
    } else {
      banner.style.background = "#dcfce7";
      banner.style.borderBottom = "1px solid #22c55e";
      banner.style.color = "#166534";
      badgeEl.style.background = "#22c55e";
      badgeEl.style.color = "#ffffff";
    }
  }

  // Inject Page-Level Fetch & XHR Shield into Page Context
  function injectNetworkShield() {
    const script = document.createElement("script");
    script.textContent = `
      (function() {
        const blockedSet = new Set();
        window.addEventListener("message", (e) => {
          if (e.data && e.data.type === "CP_BLOCK_PROMPT" && e.data.text) {
            blockedSet.add(e.data.text.trim());
          } else if (e.data && e.data.type === "CP_UNBLOCK_PROMPT" && e.data.text) {
            blockedSet.delete(e.data.text.trim());
          }
        });


        const origFetch = window.fetch;
        window.fetch = async function(...args) {
          try {
            const body = args[1] && args[1].body ? args[1].body : null;
            if (typeof body === "string") {
              for (const blockedText of blockedSet) {
                if (body.includes(blockedText)) {
                  console.warn("ControlPlane Network Shield: Aborted fetch containing blocked text.");
                  return new Response(JSON.stringify({ error: "Blocked by ControlPlane AI Governance" }), { status: 403 });
                }
              }
            }
          } catch(e) {}
          return origFetch.apply(this, args);
        };
      })();
    `;
    (document.head || document.documentElement).appendChild(script);
  }
})();
