/**
 * ControlPlane AI Guardrail - Chrome Extension Content Script
 * Exclusively protects AI Chatbot Portals:
 *   - ChatGPT (chatgpt.com, chat.openai.com)
 *   - Claude AI (claude.ai)
 *   - Google Gemini (gemini.google.com)
 *   - DeepSeek (chat.deepseek.com, *.deepseek.com)
 *   - Kimi AI (kimi.moonshot.cn, kimi.ai)
 *   - Perplexity AI (perplexity.ai)
 *   - Microsoft Copilot (copilot.microsoft.com)
 *   - Mistral Le Chat (chat.mistral.ai)
 *   - Groq Chat (chat.groq.com)
 *   - HuggingChat (huggingface.co/chat)
 *   - Poe (poe.com)
 *   - Botpress Cloud Webchat (*.botpress.cloud, *.botpress.com)
 *
 * Rules:
 *   - NEVER renders on the ControlPlane website / studio dashboard itself.
 *   - Zero CSP violations (no inline scripts injected into the page DOM).
 *   - Synchronous submission interception for instant prompt evaluation.
 */

(function () {
  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname.toLowerCase();

  // 1. STRICT EXCLUSION: Never run on ControlPlane itself
  const isControlPlaneApp =
    document.title.toLowerCase().includes("controlplane") ||
    !!document.querySelector('meta[name="application-name"][content*="ControlPlane" i]') ||
    !!document.getElementById("login-screen") ||
    !!document.getElementById("app-shell") ||
    !!document.getElementById("root") ||
    host === "localhost" ||
    host === "127.0.0.1";

  if (isControlPlaneApp) {
    return;
  }

  // 2. STRICT INCLUSION: Only run on verified AI Chatbot Portals
  const isChatbotPortal =
    host.includes("chatgpt.com") ||
    host.includes("chat.openai.com") ||
    host.includes("claude.ai") ||
    host.includes("gemini.google.com") ||
    host.includes("deepseek.com") ||
    host.includes("kimi.moonshot.cn") ||
    host.includes("kimi.ai") ||
    host.includes("perplexity.ai") ||
    host.includes("copilot.microsoft.com") ||
    host.includes("poe.com") ||
    host.includes("mistral.ai") ||
    host.includes("chat.groq.com") ||
    (host.includes("huggingface.co") && path.startsWith("/chat")) ||
    host.includes("botpress.cloud") ||
    host.includes("botpress.com");

  if (!isChatbotPortal) {
    return;
  }

  const blockedPromptsSet = new Set();
  let isChecking = false;
  let isConnected = false;

  function ensureBannerInjected() {
    if (document.getElementById("controlplane-top-banner")) return;

    const banner = document.createElement("div");
    banner.id = "controlplane-top-banner";
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 34px;
      z-index: 2147483645;
      background: #090d16;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
      transition: all 0.25s ease;
    `;

    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="cp-banner-dot" style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);"></span>
        <span id="cp-banner-text" style="color: #cbd5e1; font-weight: 500;">ControlPlane Active — Guarding ${host}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span id="cp-banner-badge" style="background: rgba(99, 102, 241, 0.12); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.25); padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;">ACTIVE</span>
        <button id="cp-banner-dismiss" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.15s ease;">Dismiss</button>
      </div>
    `;

    document.documentElement.style.marginTop = "34px";
    document.body.appendChild(banner);

    const dismissBtn = document.getElementById("cp-banner-dismiss");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        banner.style.display = "none";
        document.documentElement.style.marginTop = "0px";
      });
    }
  }

  function ensureToastContainerInjected() {
    if (document.getElementById("cp-inpage-toast-container")) return;

    const toastContainer = document.createElement("div");
    toastContainer.id = "cp-inpage-toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 420px;
      width: calc(100vw - 48px);
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;
    document.body.appendChild(toastContainer);

    if (!document.getElementById("cp-toast-keyframes")) {
      const styleEl = document.createElement("style");
      styleEl.id = "cp-toast-keyframes";
      styleEl.textContent = `
        @keyframes cpSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }

  async function syncConnectionState() {
    let token = "";
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      try {
        const stored = await chrome.storage.local.get(["cp_token"]);
        if (stored && stored.cp_token && stored.cp_token.trim()) {
          token = stored.cp_token.trim();
        }
      } catch (e) {}
    }

    if (!token) {
      // DISCONNECTED STATE: Clean up all injected UI and disable guardrail
      isConnected = false;
      const existingBanner = document.getElementById("controlplane-top-banner");
      if (existingBanner) {
        existingBanner.remove();
      }
      document.documentElement.style.marginTop = "0px";

      const existingToasts = document.getElementById("cp-inpage-toast-container");
      if (existingToasts) {
        existingToasts.remove();
      }
      console.log("[ControlPlane AI Guardrail] Extension is DISCONNECTED. Protection inactive.");
      return;
    }

    // CONNECTED STATE: Activate banner and guardrail
    isConnected = true;
    console.log("[ControlPlane AI Guardrail] Extension is CONNECTED. Guarding " + host);
    ensureBannerInjected();
    ensureToastContainerInjected();
  }

  // Initial connection state synchronization
  syncConnectionState();

  // Listen for storage changes from extension popup (Connect / Disconnect / Reset)
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes.cp_token !== undefined) {
        syncConnectionState();
      }
    });
  }

  // Listen for direct broadcast messages from extension popup
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === "CP_STATE_CHANGED") {
        syncConnectionState();
      }
    });
  }

  function showInPageAlert(type, title, message, details) {
    if (!isConnected) return;
    ensureToastContainerInjected();
    const toastContainer = document.getElementById("cp-inpage-toast-container");
    if (!toastContainer) return;

    const card = document.createElement("div");
    card.style.cssText = `
      pointer-events: auto;
      background: #0d131f;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 12px 14px;
      color: #f1f5f9;
      box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.7);
      animation: cpSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 5px;
      transition: all 0.2s ease;
    `;

    let badgeColor = "rgba(99, 102, 241, 0.12)";
    let badgeBorder = "rgba(99, 102, 241, 0.25)";
    let badgeTextColor = "#818cf8";
    let badgeText = "PROTECTED";
    let dotColor = "#818cf8";

    if (type === "BLOCK") {
      card.style.border = "1px solid rgba(244, 63, 94, 0.35)";
      badgeColor = "rgba(244, 63, 94, 0.15)";
      badgeBorder = "rgba(244, 63, 94, 0.3)";
      badgeTextColor = "#fb7185";
      badgeText = "BLOCKED";
      dotColor = "#f43f5e";
    } else if (type === "MASK") {
      card.style.border = "1px solid rgba(6, 182, 212, 0.35)";
      badgeColor = "rgba(6, 182, 212, 0.15)";
      badgeBorder = "rgba(6, 182, 212, 0.3)";
      badgeTextColor = "#38bdf8";
      badgeText = "MASKED";
      dotColor = "#06b6d4";
    } else if (type === "DETECT" || type === "MONITOR") {
      card.style.border = "1px solid rgba(245, 158, 11, 0.35)";
      badgeColor = "rgba(245, 158, 11, 0.15)";
      badgeBorder = "rgba(245, 158, 11, 0.3)";
      badgeTextColor = "#fbbf24";
      badgeText = "AUDITED";
      dotColor = "#f59e0b";
    } else if (type === "CONFIRM") {
      card.style.border = "1px solid rgba(249, 115, 22, 0.35)";
      badgeColor = "rgba(249, 115, 22, 0.15)";
      badgeBorder = "rgba(249, 115, 22, 0.3)";
      badgeTextColor = "#fb923c";
      badgeText = "CONFIRMATION NEEDED";
      dotColor = "#f97316";
    }

    const safeDetails = details
      ? details.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : "";

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 12px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${dotColor}; box-shadow: 0 0 6px ${dotColor};"></span>
          <span style="color: #f8fafc;">${title}</span>
        </div>
        <span style="background: ${badgeColor}; color: ${badgeTextColor}; border: 1px solid ${badgeBorder}; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;">
          ${badgeText}
        </span>
      </div>
      <div style="font-size: 11px; color: #94a3b8; line-height: 1.4;">
        ${message}
      </div>
      ${
        safeDetails
          ? `<div style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.06); padding: 6px 8px; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; font-size: 10.5px; color: #7dd3fc; margin-top: 4px; word-break: break-all; max-height: 80px; overflow-y: auto;">
              ${safeDetails}
             </div>`
          : ""
      }
    `;

    toastContainer.appendChild(card);

    setTimeout(() => {
      card.style.opacity = "0";
      card.style.transform = "translateY(8px)";
      setTimeout(() => card.remove(), 250);
    }, 5000);
  }

  let isSyntheticSubmit = false;

  async function handleUserSubmitAttempt(e, inputEl) {
    if (isSyntheticSubmit) return;
    if (!isConnected) return;
    if (!inputEl) inputEl = findActiveChatInput();
    if (!inputEl) return;

    const text = getInputValue(inputEl);
    if (!text || text.length === 0) return;

    // Immediately stop the native event in its tracks synchronously!
    haltEvent(e);

    if (blockedPromptsSet.has(text)) {
      updateBannerUI("BLOCK", "Permanently Blocked: Prompt contains sensitive secret, PII, or injection threat.");
      showInPageAlert("BLOCK", "Action Blocked", "Prompt is blocked by ControlPlane policy.");
      return false;
    }

    if (isChecking) return false;
    isChecking = true;

    try {
      const result = await evaluatePromptWithBackend(text);
      handleEvaluationResult(result, text, inputEl);
    } catch (err) {
      console.error("ControlPlane evaluation error:", err);
      triggerNativeSubmit(inputEl);
    } finally {
      isChecking = false;
    }
  }

  function onKeyDownCapture(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      const activeEl = document.activeElement;
      const inputEl = (activeEl && isInputTarget(activeEl))
        ? (activeEl.closest("#prompt-textarea, div[contenteditable='true'], [role='textbox'], .ProseMirror, textarea, input") || activeEl)
        : findActiveChatInput();
      if (inputEl) {
        handleUserSubmitAttempt(e, inputEl);
      }
    }
  }

  function onClickCapture(e) {
    const target = e.target;
    const sendBtn = target && target.closest && target.closest(
      [
        "button[type='submit']",
        "button[aria-label*='Send' i]",
        "button[aria-label*='Submit' i]",
        "button[aria-label*='发送']",
        "button[data-testid*='send' i]",
        "button[data-testid*='submit' i]",
        "button#send-button",
        "button.send-button",
        "div[role='button'][aria-label*='Send' i]",
        "fieldset button"
      ].join(",")
    );

    if (sendBtn) {
      const inputEl = findAssociatedInput(sendBtn);
      if (inputEl) {
        handleUserSubmitAttempt(e, inputEl);
      }
    }
  }

  // Register on both window and document in capture phase
  window.addEventListener("keydown", onKeyDownCapture, true);
  document.addEventListener("keydown", onKeyDownCapture, true);
  window.addEventListener("click", onClickCapture, true);
  document.addEventListener("click", onClickCapture, true);

  // 7. Policy Outcome Handler
  function handleEvaluationResult(result, rawText, inputEl) {
    if (!result) {
      triggerNativeSubmit(inputEl);
      return;
    }

    if (result.action === "CONFIRM_REQUIRED") {
      updateBannerUI("CONFIRM", "Confirmation Required: Explicit user approval needed before tool execution.", result);
      showInPageAlert("CONFIRM", "Confirmation Required", "High-risk tool call execution requires explicit approval.");
      showConfirmationModal(result, rawText, inputEl);
      return;
    }

    if (result.action === "BLOCK") {
      blockedPromptsSet.add(rawText);
      if (inputEl) {
        inputEl.style.border = "2px solid #f43f5e";
        inputEl.style.boxShadow = "0 0 14px rgba(244, 63, 94, 0.35)";
      }
      updateBannerUI("BLOCK", "Action Blocked: High severity risk or policy violation detected.", result);
      showInPageAlert(
        "BLOCK",
        "Prompt Blocked",
        "ControlPlane prevented this prompt from reaching the AI model due to detected security risks.",
        result.triggered_rules ? result.triggered_rules.join(", ") : "Policy Block Rule"
      );
      return;
    }

    // Unblock if MASK, MONITOR, WARN, or ALLOW
    blockedPromptsSet.delete(rawText);
    if (inputEl) {
      inputEl.style.border = "";
      inputEl.style.boxShadow = "";
    }

    if (result.action === "MASK" || result.action === "REDACT") {
      const sanitized = result.sanitized_prompt || rawText;

      setInputValue(inputEl, sanitized);
      updateBannerUI("MASK", "Sensitive Data Redacted: Prompt sanitized before sending.", result);

      showInPageAlert(
        "MASK",
        "Data Redacted",
        "Sensitive information was automatically masked before submission.",
        `Sanitized: ${sanitized}`
      );

      setTimeout(() => {
        triggerNativeSubmit(inputEl);
      }, 150);

    } else if (
      result.action === "MONITOR" ||
      result.action === "FLAG" ||
      (result.risk_findings && result.risk_findings.length > 0)
    ) {
      updateBannerUI("MONITOR", "Risk Detected: Logged to ControlPlane Risk Findings.", result);

      const reasons =
        result.triggered_rules && result.triggered_rules.length > 0
          ? result.triggered_rules.join(", ")
          : "Risk pattern detected and logged to telemetry";

      showInPageAlert(
        "DETECT",
        "Risk Telemetry Logged",
        "Prompt allowed, but sensitive pattern was detected and recorded in Governance Studio.",
        reasons
      );

      triggerNativeSubmit(inputEl);
    } else {
      updateBannerUI("ALLOW", "Clean Query: Verified across all policy guardrails", result);
      triggerNativeSubmit(inputEl);
    }
  }

  // --- Platform Agnostic DOM Helpers ---

  function isInputTarget(el) {
    if (!el) return false;
    return !!el.closest?.(
      "#prompt-textarea, div[contenteditable='true'], [role='textbox'], .ProseMirror, .ql-editor, textarea, input, rich-textarea"
    );
  }

  function findActiveChatInput() {
    return document.querySelector(
      [
        "#prompt-textarea",
        "div[contenteditable='true'][role='textbox']",
        "div[contenteditable='true'].ProseMirror",
        "rich-textarea div[contenteditable='true']",
        "textarea#chat-input",
        "div.chat-input-editor",
        "textarea[placeholder*='Ask' i]",
        "textarea[placeholder*='Message' i]",
        "textarea[placeholder*='DeepSeek' i]",
        "textarea[placeholder*='Claude' i]",
        "textarea[placeholder*='Gemini' i]",
        "textarea",
        "div[contenteditable='true']"
      ].join(",")
    );
  }

  function getInputValue(el) {
    if (!el) return "";
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      return (el.value || "").trim();
    }
    return (el.innerText || el.textContent || "").trim();
  }

  function setInputValue(el, val) {
    if (!el) return;
    el.focus();

    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (nativeSetter) {
        nativeSetter.call(el, val);
      } else {
        el.value = val;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    if (el.isContentEditable || el.getAttribute("contenteditable") === "true" || el.getAttribute("role") === "textbox") {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("selectAll", false, null);
        document.execCommand("delete", false, null);
        document.execCommand("insertText", false, val);
      } catch (e) {
        el.innerHTML = `<p>${val}</p>`;
      }

      if (!el.innerText || !el.innerText.includes(val)) {
        el.innerHTML = `<p>${val}</p>`;
      }

      el.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: true, inputType: "insertText", data: val }));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function haltEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  function findAssociatedInput(btn) {
    const form = btn.closest("form") || btn.closest("fieldset") || btn.closest("main") || btn.closest("div[class*='input']");
    if (form) {
      const input = form.querySelector(
        "#prompt-textarea, div[contenteditable='true'], textarea, input[type='text']"
      );
      if (input) return input;
    }
    return findActiveChatInput();
  }

  function triggerNativeSubmit(inputEl) {
    if (!inputEl) return;

    // First try finding the send button in the same form/container
    const form = inputEl.closest("form") || inputEl.closest("fieldset") || inputEl.closest("main");
    if (form) {
      const submitBtn = form.querySelector(
        "button[type='submit'], button[aria-label*='Send' i], button[data-testid*='send-button' i], button[data-testid*='submit' i]"
      );
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.click();
        return;
      }
    }

    const pageSendBtn = document.querySelector(
      [
        "button[data-testid='send-button']",
        "button[aria-label*='Send message' i]",
        "button[aria-label*='Send prompt' i]",
        "button[aria-label*='Send' i]",
        "button.send-button",
        "div[role='button'][aria-label*='Send' i]"
      ].join(",")
    );
    if (pageSendBtn && !pageSendBtn.disabled) {
      pageSendBtn.click();
      return;
    }

    // Fallback: trigger Enter key on the input element
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    });
    inputEl.dispatchEvent(enterEvent);
  }

  async function sendGuardrailCheck(payload) {
    let tokenKey = "cp_live_default";
    let tenantId = "default-workspace";
    let configuredUrl = "http://localhost:8000";
    let deviceId = "";

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      try {
        const stored = await chrome.storage.local.get(["cp_token", "cp_tenant_id", "cp_server_url", "cp_device_id"]);
        if (stored && stored.cp_token) tokenKey = stored.cp_token;
        if (stored && stored.cp_tenant_id) tenantId = stored.cp_tenant_id;
        if (stored && stored.cp_device_id) deviceId = stored.cp_device_id;
        if (stored && stored.cp_server_url && stored.cp_server_url.trim()) {
          configuredUrl = stored.cp_server_url.trim().replace(/\/$/, "");
        }
      } catch (e) {}
    }

    let currentSessionId = window.__cp_session_id;
    if (!currentSessionId) {
      let botTag = "chatgpt";
      if (host.includes("claude")) botTag = "claude";
      else if (host.includes("gemini")) botTag = "gemini";
      else if (host.includes("deepseek")) botTag = "deepseek";
      else if (host.includes("kimi")) botTag = "kimi";
      else if (host.includes("perplexity")) botTag = "perplexity";
      else if (host.includes("copilot")) botTag = "copilot";
      else if (host.includes("groq")) botTag = "groq";
      else if (host.includes("mistral")) botTag = "mistral";

      currentSessionId = `sess_${botTag}_${Math.random().toString(36).substring(2, 9)}`;
      window.__cp_session_id = currentSessionId;
    }

    const fullPayload = {
      ...payload,
      session_id: payload.session_id || currentSessionId,
      device_id: payload.device_id || deviceId || undefined,
    };

    const targetUrl = `${configuredUrl}/api/v1/resources/res_demo/check`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + tokenKey,
      "X-Tenant-ID": tenantId,
      "X-Device-ID": deviceId || "unknown-device",
      "X-Source": "Browser Extension",
    };

    // Primary: Delegate to Background Service Worker (Bypasses HTTPS -> HTTP Mixed Content & CSP)
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        const bgResponse = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: "CP_EVALUATE_GUARDRAIL",
              url: targetUrl,
              headers: headers,
              body: fullPayload,
            },
            (res) => {
              if (chrome.runtime.lastError) {
                resolve(null);
              } else {
                resolve(res);
              }
            }
          );
        });

        if (bgResponse && bgResponse.success && bgResponse.data) {
          return bgResponse.data;
        }
      } catch (err) {
        // Fall back to direct fetch below
      }
    }

    // Secondary Fallback: Direct Fetch
    const candidates = Array.from(new Set([configuredUrl, "http://127.0.0.1:8000", "http://localhost:8000"]));
    for (const base of candidates) {
      try {
        const res = await fetch(`${base}/api/v1/resources/res_demo/check`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(fullPayload),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {}
    }
    return null;
  }

  async function evaluatePromptWithBackend(text) {
    try {
      return await sendGuardrailCheck({
        user_prompt: text,
        source: "Browser Extension",
      });
    } catch (err) {
      console.warn("ControlPlane Guardrail API offline:", err);
    }
    return null;
  }


  function updateBannerUI(action, message, data) {
    const banner = document.getElementById("controlplane-top-banner");
    const textEl = document.getElementById("cp-banner-text");
    const badgeEl = document.getElementById("cp-banner-badge");
    const dotEl = document.getElementById("cp-banner-dot");

    if (textEl) textEl.textContent = message;
    if (badgeEl) badgeEl.textContent = action;

    if (!banner) return;

    // Standard enterprise dark baseline
    banner.style.background = "#090d16";
    banner.style.color = "#f1f5f9";

    if (action === "BLOCK") {
      banner.style.borderBottom = "1px solid rgba(244, 63, 94, 0.35)";
      if (dotEl) {
        dotEl.style.background = "#f43f5e";
        dotEl.style.boxShadow = "0 0 6px rgba(244, 63, 94, 0.6)";
      }
      if (badgeEl) {
        badgeEl.style.background = "rgba(244, 63, 94, 0.15)";
        badgeEl.style.color = "#fb7185";
        badgeEl.style.border = "1px solid rgba(244, 63, 94, 0.3)";
      }
    } else if (action === "MASK" || action === "REDACT") {
      banner.style.borderBottom = "1px solid rgba(6, 182, 212, 0.35)";
      if (dotEl) {
        dotEl.style.background = "#06b6d4";
        dotEl.style.boxShadow = "0 0 6px rgba(6, 182, 212, 0.6)";
      }
      if (badgeEl) {
        badgeEl.style.background = "rgba(6, 182, 212, 0.15)";
        badgeEl.style.color = "#38bdf8";
        badgeEl.style.border = "1px solid rgba(6, 182, 212, 0.3)";
      }
    } else if (action === "MONITOR") {
      banner.style.borderBottom = "1px solid rgba(245, 158, 11, 0.35)";
      if (dotEl) {
        dotEl.style.background = "#f59e0b";
        dotEl.style.boxShadow = "0 0 6px rgba(245, 158, 11, 0.6)";
      }
      if (badgeEl) {
        badgeEl.style.background = "rgba(245, 158, 11, 0.15)";
        badgeEl.style.color = "#fbbf24";
        badgeEl.style.border = "1px solid rgba(245, 158, 11, 0.3)";
      }
    } else if (action === "CONFIRM") {
      banner.style.borderBottom = "1px solid rgba(249, 115, 22, 0.35)";
      if (dotEl) {
        dotEl.style.background = "#f97316";
        dotEl.style.boxShadow = "0 0 6px rgba(249, 115, 22, 0.6)";
      }
      if (badgeEl) {
        badgeEl.style.background = "rgba(249, 115, 22, 0.15)";
        badgeEl.style.color = "#fb923c";
        badgeEl.style.border = "1px solid rgba(249, 115, 22, 0.3)";
      }
    } else {
      banner.style.borderBottom = "1px solid rgba(16, 185, 129, 0.3)";
      if (dotEl) {
        dotEl.style.background = "#10b981";
        dotEl.style.boxShadow = "0 0 6px rgba(16, 185, 129, 0.6)";
      }
      if (badgeEl) {
        badgeEl.style.background = "rgba(16, 185, 129, 0.15)";
        badgeEl.style.color = "#34d399";
        badgeEl.style.border = "1px solid rgba(16, 185, 129, 0.3)";
      }
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
      background: rgba(11, 15, 25, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    modal.innerHTML = `
      <div style="background: #0d131f; border: 1px solid rgba(249, 115, 22, 0.35); border-radius: 8px; max-width: 460px; width: 100%; padding: 1.25rem; color: #f8fafc; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <div>
            <h3 style="margin: 0; font-size: 1.05rem; color: #f97316; font-weight: 700;">Action Confirmation Required</h3>
            <span style="font-size: 0.75rem; color: #94a3b8;">Risk Tier: <strong>${result.action_risk_tier || "HIGH"}</strong></span>
          </div>
          <span style="background: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.3); padding: 2px 7px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase;">REQUIRED</span>
        </div>

        <div style="background: rgba(0, 0, 0, 0.4); padding: 10px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 1.25rem; font-size: 0.82rem;">
          <div style="color: #94a3b8; margin-bottom: 4px;">An AI Agent requested to execute:</div>
          <code style="color: #38bdf8; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.85rem;">${toolName}</code>
          <div style="color: #cbd5e1; font-size: 0.78rem; margin-top: 6px;">
            "${rawText.substring(0, 120)}${rawText.length > 120 ? "..." : ""}"
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button id="cp-modal-cancel" style="background: rgba(255,255,255,0.06); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.12); padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.82rem;">
            Block Action
          </button>
          <button id="cp-modal-approve" style="background: #ea580c; color: #ffffff; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.82rem;">
            Approve & Execute
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cancelBtn = document.getElementById("cp-modal-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        modal.remove();
        blockedPromptsSet.add(rawText);
        updateBannerUI("BLOCK", "Action Cancelled: High-risk tool execution blocked by user.");
        showInPageAlert("BLOCK", "Action Cancelled", "High-risk tool call execution blocked by user.");
      });
    }

    const approveBtn = document.getElementById("cp-modal-approve");
    if (approveBtn) {
      approveBtn.addEventListener("click", () => {
        modal.remove();
        updateBannerUI("ALLOW", "Action Approved: Executing tool call.");
        showInPageAlert("ALLOW", "Action Approved", "User confirmed and allowed tool call execution.");
        triggerNativeSubmit(inputEl);
      });
    }
  }

  // =========================================================================
  // 8. Real-Time Assistant Response Observer & Hallucination / Factuality Check
  // =========================================================================

  let lastSubmittedPromptText = "";
  let evaluatedResponsesSet = new WeakSet();
  let responseDebounceTimer = null;

  // Intercept stored prompt on submission
  const originalHandleEvaluationResult = handleEvaluationResult;
  handleEvaluationResult = function(result, rawText, inputEl) {
    lastSubmittedPromptText = rawText;
    return originalHandleEvaluationResult(result, rawText, inputEl);
  };

  function observeAssistantResponses() {
    const observer = new MutationObserver(() => {
      clearTimeout(responseDebounceTimer);
      responseDebounceTimer = setTimeout(() => {
        findAndEvaluateCompletedResponses();
      }, 1400); // 1.4s debounce after streaming finishes
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function findAndEvaluateCompletedResponses() {
    // Selectors for AI Chatbot assistant response containers
    const assistantSelectors = [
      "[data-message-author-role='assistant']",
      "article[data-testid*='conversation-turn'] div.markdown",
      "div.agent-turn div.markdown",
      "div[data-is-streaming='false'] div.markdown",
      "div.font-claude-message",
      "model-response",
      ".ds-markdown",
      "div.prose"
    ];

    const nodes = document.querySelectorAll(assistantSelectors.join(","));
    if (!nodes || nodes.length === 0) return;

    // Evaluate latest assistant response node
    const latestNode = nodes[nodes.length - 1];
    if (!latestNode || evaluatedResponsesSet.has(latestNode)) return;

    const responseText = (latestNode.innerText || latestNode.textContent || "").trim();
    if (!responseText || responseText.length < 15) return;

    // Check if still streaming
    const isStreaming = document.querySelector(
      "button[aria-label*='Stop' i], button[data-testid*='stop' i], div[data-is-streaming='true']"
    );
    if (isStreaming) return; // Wait until streaming finishes

    evaluatedResponsesSet.add(latestNode);
    evaluateAssistantResponse(lastSubmittedPromptText || "General Query", responseText, latestNode);
  }

  async function evaluateAssistantResponse(prompt, response, targetNode) {
    try {
      const data = await sendGuardrailCheck({
        user_prompt: prompt,
        raw_response: response,
        source: "ChatGPT Extension Listener"
      });

      if (!data) return;

      const pScore = (data.scores && typeof data.scores.performance_p === "number")
        ? data.scores.performance_p
        : 100.0;

      const hasHallucination = (data.risk_findings || []).some(
        rf => rf.type && (rf.type.includes("HALLUCINATION") || rf.type.includes("GROUNDING"))
      ) || pScore < 65.0;

      // Render Inline Badge on AI Response
      const badge = document.createElement("div");
      badge.className = "cp-factuality-inline-badge";
      badge.style.cssText = `
        margin-top: 8px;
        padding: 6px 12px;
        border-radius: 6px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        background: #090e17;
        border: 1px solid ${hasHallucination ? "rgba(244, 63, 94, 0.28)" : "rgba(255, 255, 255, 0.08)"};
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        color: #94a3b8;
        transition: all 0.2s ease;
      `;

      badge.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${hasHallucination ? "#f43f5e" : "#10b981"}; box-shadow: 0 0 6px ${hasHallucination ? "rgba(244, 63, 94, 0.6)" : "rgba(16, 185, 129, 0.6)"};"></span>
          <span style="color: #e2e8f0; font-weight: 500;">Factuality & Grounding: <strong style="color: ${hasHallucination ? "#fb7185" : "#34d399"}; font-weight: 700;">${pScore.toFixed(0)}%</strong></span>
          <span style="color: #475569;">•</span>
          <span style="color: #94a3b8;">${hasHallucination ? "Low-Grounding Risk Logged" : "Grounded & Verified"}</span>
        </div>
        <span style="background: ${hasHallucination ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)"}; color: ${hasHallucination ? "#fb7185" : "#34d399"}; border: 1px solid ${hasHallucination ? "rgba(244, 63, 94, 0.3)" : "rgba(16, 185, 129, 0.3)"}; padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 9px; letter-spacing: 0.04em; text-transform: uppercase;">
          ${hasHallucination ? "RISK LOGGED" : "VERIFIED SAFE"}
        </span>
      `;

      if (targetNode.parentElement) {
        targetNode.parentElement.appendChild(badge);
      }

      if (hasHallucination) {
        showInPageAlert(
          "DETECT",
          `Hallucination Risk Detected (${pScore.toFixed(0)}% Factuality)`,
          "Model response contains unverified claims or low factual grounding. Recorded in your Risk Findings dashboard.",
          `Response snippet: "${response.substring(0, 100)}..."`
        );
      }
    } catch (err) {
      console.warn("ControlPlane real-time response evaluation error:", err);
    }
  }

  // Start real-time response observer
  observeAssistantResponses();
})();

