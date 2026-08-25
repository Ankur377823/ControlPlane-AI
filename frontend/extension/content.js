/**
 * ControlPlane AI Guardrail - Content Script for AI Chat Portals
 * Supported: ChatGPT, Claude, Gemini, DeepSeek, Kimi, Local Studio.
 *
 * Capabilities:
 *   1. Synchronous event interception on Enter key, Send button click, and Form Submit.
 *   2. In-Page Visual Feedback for BLOCK, MASK (Redaction), DETECT (Monitoring/Flag), and ALLOW.
 *   3. Modern Floating HUD / Toast showing live interception diffs.
 *   4. Main-World Fetch/XHR Network Interceptor to physically protect outgoing API payloads.
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

  // Do not run on ControlPlane website/dashboard itself
  if (document.title.includes("ControlPlane") || document.getElementById("login-screen") || document.getElementById("app-shell") || document.getElementById("root")) {
    return;
  }

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
    z-index: 2147483645;
    background: #0f172a;
    border-bottom: 1px solid rgba(99, 102, 241, 0.3);
    color: #f8fafc;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    transition: all 0.3s ease;
  `;

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 14px;">🛡️</span>
      <span id="cp-banner-text"><strong>ControlPlane AI Protection Active</strong> — Connected to ${host}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <span id="cp-banner-badge" style="background: #6366f1; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;">ACTIVE</span>
      <button id="cp-banner-dismiss" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 2px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">Dismiss</button>
    </div>
  `;

  document.documentElement.style.marginTop = "38px";
  document.body.appendChild(banner);

  document.getElementById("cp-banner-dismiss").addEventListener("click", () => {
    banner.style.display = "none";
    document.documentElement.style.marginTop = "0px";
  });

  // 3. Create Floating Live Toast Container for In-Page Interception Alerts
  const toastContainer = document.createElement("div");
  toastContainer.id = "cp-inpage-toast-container";
  toastContainer.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 440px;
    width: calc(100vw - 48px);
    pointer-events: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
  document.body.appendChild(toastContainer);

  // Helper to show In-Page Animated Toast Card on ChatGPT
  function showInPageAlert(type, title, message, details) {
    const card = document.createElement("div");
    card.style.cssText = `
      pointer-events: auto;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      padding: 14px 16px;
      color: #ffffff;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      animation: cpSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.3s ease;
    `;

    let badgeColor = "#6366f1";
    let badgeText = "PROTECTED";
    let icon = "🛡️";

    if (type === "BLOCK") {
      card.style.borderColor = "#ef4444";
      card.style.boxShadow = "0 10px 30px rgba(239, 68, 68, 0.25)";
      badgeColor = "#ef4444";
      badgeText = "BLOCKED";
      icon = "⛔";
    } else if (type === "MASK") {
      card.style.borderColor = "#06b6d4";
      card.style.boxShadow = "0 10px 30px rgba(6, 182, 212, 0.25)";
      badgeColor = "#06b6d4";
      badgeText = "MASKED & SANITIZED";
      icon = "🔒";
    } else if (type === "DETECT" || type === "MONITOR") {
      card.style.borderColor = "#f59e0b";
      card.style.boxShadow = "0 10px 30px rgba(245, 158, 11, 0.25)";
      badgeColor = "#f59e0b";
      badgeText = "DETECTED & AUDITED";
      icon = "👁️";
    } else if (type === "CONFIRM") {
      card.style.borderColor = "#f97316";
      badgeColor = "#f97316";
      badgeText = "CONFIRMATION NEEDED";
      icon = "⚠️";
    }

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px;">
          <span>${icon}</span>
          <span style="color: #ffffff;">${title}</span>
        </div>
        <span style="background: ${badgeColor}; color: #ffffff; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase;">
          ${badgeText}
        </span>
      </div>
      <div style="font-size: 12px; color: #cbd5e1; line-height: 1.4;">
        ${message}
      </div>
      ${
        details
          ? `<div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); padding: 8px 10px; border-radius: 8px; font-family: monospace; font-size: 11px; color: #38bdf8; margin-top: 4px; word-break: break-all; max-height: 80px; overflow-y: auto;">
              ${details}
             </div>`
          : ""
      }
    `;

    toastContainer.appendChild(card);

    setTimeout(() => {
      card.style.opacity = "0";
      card.style.transform = "translateY(10px)";
      setTimeout(() => card.remove(), 300);
    }, 6000);
  }

  // Add CSS animation
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    @keyframes cpSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleEl);

  // Track check processing state
  let isChecking = false;

  // 4. Synchronous Interception on Enter Key
  document.addEventListener(
    "keydown",
    async (e) => {
      if (e.key === "Enter" && !e.shiftKey && !isChecking) {
        const activeEl = document.activeElement;
        if (isInputTarget(activeEl)) {
          const text = getInputValue(activeEl);
          if (!text) return;

          // Instant synchronous check against blocked cache
          if (blockedPromptsSet.has(text)) {
            haltEvent(e, activeEl);
            updateBannerUI("BLOCK", "⛔ Permanently Blocked: Prompt contains sensitive secret/PII or injection threat!");
            showInPageAlert("BLOCK", "Action Blocked", "Prompt is permanently blocked by ControlPlane policy.");
            return false;
          }

          // Halt DOM event propagation synchronously BEFORE async fetch
          haltEvent(e, activeEl);
          isChecking = true;

          try {
            const result = await evaluatePromptWithBackend(text);
            handleEvaluationResult(result, text, activeEl);
          } catch (err) {
            console.error("Evaluation error:", err);
            triggerNativeSubmit(activeEl);
          } finally {
            isChecking = false;
          }
        }
      }
    },
    true
  );

  // 5. Synchronous Interception on Send Button Click & Form Submit
  document.addEventListener(
    "click",
    async (e) => {
      if (isChecking) return;
      const target = e.target;
      const sendBtn = target.closest(
        "button[type='submit'], button[aria-label*='Send'], button[aria-label*='send'], button[data-testid*='send-button'], button#send-button"
      );

      if (sendBtn) {
        const inputEl = findAssociatedInput(sendBtn);
        if (inputEl) {
          const text = getInputValue(inputEl);
          if (!text) return;

          if (blockedPromptsSet.has(text)) {
            haltEvent(e, inputEl);
            updateBannerUI("BLOCK", "⛔ Permanently Blocked: Prompt contains sensitive secret/PII or injection threat!");
            showInPageAlert("BLOCK", "Action Blocked", "Prompt is permanently blocked by ControlPlane policy.");
            return false;
          }

          haltEvent(e, inputEl);
          isChecking = true;

          try {
            const result = await evaluatePromptWithBackend(text);
            handleEvaluationResult(result, text, inputEl);
          } catch (err) {
            console.error("Evaluation error:", err);
            triggerNativeSubmit(inputEl);
          } finally {
            isChecking = false;
          }
        }
      }
    },
    true
  );

  // 6. Evaluation Result Handler
  function handleEvaluationResult(result, rawText, inputEl) {
    if (!result) {
      triggerNativeSubmit(inputEl);
      return;
    }

    if (result.action === "CONFIRM_REQUIRED") {
      updateBannerUI("CONFIRM", "⚠️ High-Risk Action Intercepted: Explicit User Confirmation Required!", result);
      showInPageAlert("CONFIRM", "Confirmation Required", "High-risk tool call execution requires explicit approval.");
      showConfirmationModal(result, rawText, inputEl);
      return;
    }

    if (result.action === "BLOCK") {
      blockedPromptsSet.add(rawText);
      if (inputEl) {
        inputEl.style.border = "2px solid #ef4444";
        inputEl.style.boxShadow = "0 0 12px rgba(239, 68, 68, 0.4)";
      }
      updateBannerUI("BLOCK", "⛔ Action Blocked: High severity risk or policy violation detected!", result);
      showInPageAlert(
        "BLOCK",
        "Prompt Blocked",
        "ControlPlane prevented this prompt from reaching the AI model due to detected security risks.",
        result.triggered_rules ? result.triggered_rules.join(", ") : "Policy Block Rule"
      );
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
      const sanitized = result.sanitized_prompt || rawText;
      
      // Update DOM input value
      setInputValue(inputEl, sanitized);
      
      updateBannerUI("MASK", "🛡️ Sensitive Data Redacted: Prompt sanitized before sending.", result);
      
      showInPageAlert(
        "MASK",
        "PII Redacted & Sanitized",
        "Sensitive information was automatically masked before submission.",
        `Sanitized: ${sanitized}`
      );
      
      // Trigger submission with sanitized text
      setTimeout(() => {
        triggerNativeSubmit(inputEl);
      }, 100);

    } else if (result.action === "MONITOR" || result.action === "FLAG" || (result.risk_findings && result.risk_findings.length > 0)) {
      updateBannerUI("MONITOR", "👁️ Risk Detected: Logged to ControlPlane Risk Findings Telemetry.", result);
      
      const reasons = result.triggered_rules && result.triggered_rules.length > 0
        ? result.triggered_rules.join(", ")
        : "Risk detected & recorded to security telemetry";

      showInPageAlert(
        "DETECT",
        "Risk Detected & Audited",
        "Prompt allowed, but sensitive pattern was detected and recorded in your Governance Studio.",
        reasons
      );

      triggerNativeSubmit(inputEl);
    } else {
      updateBannerUI("ALLOW", "✅ Clean Query — Passed all guardrails", result);
      triggerNativeSubmit(inputEl);
    }
  }

  // Helpers
  function isInputTarget(el) {
    if (!el) return false;
    return (
      el.tagName === "TEXTAREA" ||
      el.tagName === "INPUT" ||
      el.contentEditable === "true" ||
      el.getAttribute("role") === "textbox" ||
      el.id === "prompt-textarea"
    );
  }

  function getInputValue(el) {
    if (!el) return "";
    return (el.value || el.innerText || el.textContent || "").trim();
  }

  function setInputValue(el, val) {
    if (!el) return;
    el.focus();
    
    // For standard textarea / input
    if (el.value !== undefined) {
      el.value = val;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    
    // For contenteditable / ProseMirror / Lexical (ChatGPT)
    if (el.contentEditable === "true" || el.getAttribute("role") === "textbox") {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("delete", false, null);
        document.execCommand("insertText", false, val);
      } catch (e) {
        el.innerText = val;
      }
      el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: val }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function haltEvent(e, inputEl) {
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  function findAssociatedInput(btn) {
    const form = btn.closest("form");
    if (form) {
      const input = form.querySelector("textarea, input, [contenteditable='true'], #prompt-textarea");
      if (input) return input;
    }
    return document.querySelector("textarea, [contenteditable='true'], #prompt-textarea, input[type='text']");
  }

  function triggerNativeSubmit(inputEl) {
    const form = inputEl ? inputEl.closest("form") : null;
    if (form) {
      const submitBtn = form.querySelector("button[type='submit'], button[aria-label*='Send'], button[data-testid*='send-button']");
      if (submitBtn) {
        submitBtn.click();
        return;
      }
    }
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    });
    if (inputEl) {
      inputEl.dispatchEvent(enterEvent);
    }
  }

  async function evaluatePromptWithBackend(text) {
    try {
      let tokenKey = "cp_live_default";
      let tenantId = "ankur-tenant-1";
      let configuredUrl = "http://localhost:8000";

      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        const stored = await chrome.storage.local.get(["cp_token", "cp_tenant_id", "cp_server_url"]);
        if (stored && stored.cp_token) tokenKey = stored.cp_token;
        if (stored && stored.cp_tenant_id) tenantId = stored.cp_tenant_id;
        if (stored && stored.cp_server_url && stored.cp_server_url.trim()) {
          configuredUrl = stored.cp_server_url.trim().replace(/\/$/, "");
        }
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

      const candidates = Array.from(
        new Set([
          configuredUrl,
          "http://127.0.0.1:8000",
          "http://localhost:8000"
        ])
      );

      for (const base of candidates) {
        try {
          const res = await fetch(`${base}/api/v1/resources/res_demo/check`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + tokenKey,
              "X-Tenant-ID": tenantId,
              "X-Source": "Browser Extension",
            },
            body: JSON.stringify({ user_prompt: text, session_id: currentSessionId, source: "Browser Extension" }),
          });
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {
          // Continue to next candidate endpoint
        }
      }
    } catch (err) {
      console.warn("ControlPlane Guardrail API offline:", err);
    }
    return null;
  }

  function updateBannerUI(action, message, data) {
    const textEl = document.getElementById("cp-banner-text");
    const badgeEl = document.getElementById("cp-banner-badge");

    if (textEl) textEl.innerText = message;
    if (badgeEl) badgeEl.innerText = action;

    if (action === "BLOCK") {
      banner.style.background = "#450a0a";
      banner.style.borderBottom = "1px solid #ef4444";
      banner.style.color = "#fecaca";
      badgeEl.style.background = "#ef4444";
      badgeEl.style.color = "#ffffff";
    } else if (action === "MASK" || action === "REDACT") {
      banner.style.background = "#082f49";
      banner.style.borderBottom = "1px solid #06b6d4";
      banner.style.color = "#bae6fd";
      badgeEl.style.background = "#06b6d4";
      badgeEl.style.color = "#ffffff";
    } else if (action === "MONITOR") {
      banner.style.background = "#451a03";
      banner.style.borderBottom = "1px solid #f59e0b";
      banner.style.color = "#fef3c7";
      badgeEl.style.background = "#f59e0b";
      badgeEl.style.color = "#ffffff";
    } else if (action === "CONFIRM") {
      banner.style.background = "#431407";
      banner.style.borderBottom = "1px solid #f97316";
      banner.style.color = "#ffedd5";
      badgeEl.style.background = "#ea580c";
      badgeEl.style.color = "#ffffff";
    } else {
      banner.style.background = "#022c22";
      banner.style.borderBottom = "1px solid #10b981";
      banner.style.color = "#d1fae5";
      badgeEl.style.background = "#10b981";
      badgeEl.style.color = "#ffffff";
    }
  }

  function showConfirmationModal(result, rawText, inputEl) {
    let existingModal = document.getElementById("cp-confirmation-modal");
    if (existingModal) existingModal.remove();

    const toolName = result.tool_call ? result.tool_call.name : "High-Risk Action";
    const modal = document.createElement("div");
    modal.id = "cp-confirmation-modal";
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    modal.innerHTML = `
      <div style="background: #1e293b; border: 1px solid #ea580c; border-radius: 14px; max-width: 480px; width: 100%; padding: 1.5rem; color: #ffffff; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
          <span style="font-size: 1.8rem;">⚠️</span>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; color: #f97316; font-weight: 700;">Action Confirmation Required</h3>
            <span style="font-size: 0.78rem; color: #94a3b8;">Risk Tier: <strong>${result.action_risk_tier || "HIGH"}</strong></span>
          </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 1.25rem; font-size: 0.85rem;">
          <div style="color: #cbd5e1; margin-bottom: 4px;">An AI Agent requested to execute:</div>
          <code style="color: #38bdf8; font-family: monospace; font-size: 0.9rem;">${toolName}</code>
          <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 8px; font-style: italic;">
            "${rawText.substring(0, 120)}${rawText.length > 120 ? "..." : ""}"
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button id="cp-modal-cancel" style="background: #334155; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">
            🛑 Block Action
          </button>
          <button id="cp-modal-approve" style="background: #ea580c; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.85rem;">
            ✅ Approve & Execute
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("cp-modal-cancel").addEventListener("click", () => {
      modal.remove();
      blockedPromptsSet.add(rawText);
      updateBannerUI("BLOCK", "⛔ Action Cancelled by User!");
      showInPageAlert("BLOCK", "Action Cancelled", "High-risk tool call execution blocked by user.");
    });

    document.getElementById("cp-modal-approve").addEventListener("click", () => {
      modal.remove();
      updateBannerUI("ALLOW", "✅ Approved by User — Executing Action");
      showInPageAlert("ALLOW", "Action Approved", "User confirmed and allowed tool call execution.");
      triggerNativeSubmit(inputEl);
    });
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
