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

  // Prevent duplicate banner insertion
  if (document.getElementById("controlplane-top-banner")) return;

  console.log("🛡️ ControlPlane AI Guardrail active on AI Chatbot: " + host);

  const blockedPromptsSet = new Set();
  let isChecking = false;

  // 3. Inject Top Security Banner Bar on the Chatbot Portal
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
    border-bottom: 1px solid rgba(99, 102, 241, 0.4);
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
      <span id="cp-banner-text"><strong>ControlPlane AI Protection Active</strong> — Protecting ${host}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <span id="cp-banner-badge" style="background: #6366f1; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;">ACTIVE</span>
      <button id="cp-banner-dismiss" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 2px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">Dismiss</button>
    </div>
  `;

  document.documentElement.style.marginTop = "38px";
  document.body.appendChild(banner);

  const dismissBtn = document.getElementById("cp-banner-dismiss");
  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      banner.style.display = "none";
      document.documentElement.style.marginTop = "0px";
    });
  }

  // 4. In-Page HUD / Live Telemetry Toast Container
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

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    @keyframes cpSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleEl);

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

    const safeDetails = details
      ? details.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : "";

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
        safeDetails
          ? `<div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); padding: 8px 10px; border-radius: 8px; font-family: monospace; font-size: 11px; color: #38bdf8; margin-top: 4px; word-break: break-all; max-height: 80px; overflow-y: auto;">
              ${safeDetails}
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

  // 5. Synchronous Keydown Interception on Enter Key
  document.addEventListener(
    "keydown",
    async (e) => {
      if (e.key === "Enter" && !e.shiftKey && !isChecking) {
        const activeEl = document.activeElement;
        const targetInput = isInputTarget(activeEl) ? activeEl : findActiveChatInput();

        if (targetInput) {
          const text = getInputValue(targetInput);
          if (!text || text.length === 0) return;

          if (blockedPromptsSet.has(text)) {
            haltEvent(e);
            updateBannerUI("BLOCK", "⛔ Permanently Blocked: Prompt contains sensitive secret/PII or injection threat!");
            showInPageAlert("BLOCK", "Action Blocked", "Prompt is blocked by ControlPlane policy.");
            return false;
          }

          haltEvent(e);
          isChecking = true;

          try {
            const result = await evaluatePromptWithBackend(text);
            handleEvaluationResult(result, text, targetInput);
          } catch (err) {
            console.error("ControlPlane evaluation error:", err);
            triggerNativeSubmit(targetInput);
          } finally {
            isChecking = false;
          }
        }
      }
    },
    true
  );

  // 6. Synchronous Click Interception on Chatbot Send Buttons
  document.addEventListener(
    "click",
    async (e) => {
      if (isChecking) return;
      const target = e.target;
      const sendBtn = target.closest(
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
          const text = getInputValue(inputEl);
          if (!text || text.length === 0) return;

          if (blockedPromptsSet.has(text)) {
            haltEvent(e);
            updateBannerUI("BLOCK", "⛔ Permanently Blocked: Prompt contains sensitive secret/PII or injection threat!");
            showInPageAlert("BLOCK", "Action Blocked", "Prompt is blocked by ControlPlane policy.");
            return false;
          }

          haltEvent(e);
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
      }
    },
    true
  );

  // 7. Policy Outcome Handler
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
      updateBannerUI("MASK", "🛡️ Sensitive Data Redacted: Prompt sanitized before sending.", result);

      showInPageAlert(
        "MASK",
        "PII Redacted & Sanitized",
        "Sensitive information was automatically masked before submission.",
        `Sanitized: ${sanitized}`
      );

      setTimeout(() => {
        triggerNativeSubmit(inputEl);
      }, 120);

    } else if (
      result.action === "MONITOR" ||
      result.action === "FLAG" ||
      (result.risk_findings && result.risk_findings.length > 0)
    ) {
      updateBannerUI("MONITOR", "👁️ Risk Detected: Logged to ControlPlane Risk Findings Telemetry.", result);

      const reasons =
        result.triggered_rules && result.triggered_rules.length > 0
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

  // --- Platform Agnostic DOM Helpers ---

  function isInputTarget(el) {
    if (!el) return false;
    return (
      el.tagName === "TEXTAREA" ||
      el.tagName === "INPUT" ||
      el.isContentEditable ||
      el.getAttribute("contenteditable") === "true" ||
      el.getAttribute("role") === "textbox" ||
      el.id === "prompt-textarea" ||
      el.classList.contains("ProseMirror") ||
      el.classList.contains("ql-editor")
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
        document.execCommand("delete", false, null);
        document.execCommand("insertText", false, val);
      } catch (e) {
        el.innerText = val;
      }
      el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: val }));
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
    const form = inputEl ? inputEl.closest("form") : null;
    if (form) {
      const submitBtn = form.querySelector(
        "button[type='submit'], button[aria-label*='Send' i], button[data-testid*='send-button' i]"
      );
      if (submitBtn) {
        submitBtn.click();
        return;
      }
    }

    const pageSendBtn = document.querySelector(
      [
        "button[data-testid='send-button']",
        "button[aria-label*='Send message' i]",
        "button[aria-label*='Send' i]",
        "button.send-button",
        "div[role='button'][aria-label*='Send' i]"
      ].join(",")
    );
    if (pageSendBtn && !pageSendBtn.disabled) {
      pageSendBtn.click();
      return;
    }

    if (inputEl) {
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
  }

  async function sendGuardrailCheck(payload) {
    let tokenKey = "cp_live_default";
    let tenantId = "ankur-tenant-1";
    let configuredUrl = "http://localhost:8000";

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      try {
        const stored = await chrome.storage.local.get(["cp_token", "cp_tenant_id", "cp_server_url"]);
        if (stored && stored.cp_token) tokenKey = stored.cp_token;
        if (stored && stored.cp_tenant_id) tenantId = stored.cp_tenant_id;
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
    };

    const targetUrl = `${configuredUrl}/api/v1/resources/res_demo/check`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + tokenKey,
      "X-Tenant-ID": tenantId,
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

    const cancelBtn = document.getElementById("cp-modal-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        modal.remove();
        blockedPromptsSet.add(rawText);
        updateBannerUI("BLOCK", "⛔ Action Cancelled by User!");
        showInPageAlert("BLOCK", "Action Cancelled", "High-risk tool call execution blocked by user.");
      });
    }

    const approveBtn = document.getElementById("cp-modal-approve");
    if (approveBtn) {
      approveBtn.addEventListener("click", () => {
        modal.remove();
        updateBannerUI("ALLOW", "✅ Approved by User — Executing Action");
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

      // Render Inline Badge on ChatGPT Response
      const badge = document.createElement("div");
      badge.className = "cp-factuality-inline-badge";
      badge.style.cssText = `
        margin-top: 10px;
        padding: 8px 12px;
        border-radius: 8px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        transition: all 0.3s ease;
        ${
          hasHallucination
            ? "background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5;"
            : "background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7;"
        }
      `;

      badge.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span>${hasHallucination ? "⚠️" : "🔬"}</span>
          <span><strong>ControlPlane AI Factuality:</strong> ${pScore.toFixed(0)}% Score</span>
          <span style="opacity: 0.8;">• ${hasHallucination ? "Low-Grounding Risk Logged" : "Grounded & Verified"}</span>
        </div>
        <span style="background: ${hasHallucination ? "#ef4444" : "#10b981"}; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9px; text-transform: uppercase;">
          ${hasHallucination ? "LOGGED IN RISK FINDINGS" : "VERIFIED SAFE"}
        </span>
      `;

      if (targetNode.parentElement) {
        targetNode.parentElement.appendChild(badge);
      }

      if (hasHallucination) {
        showInPageAlert(
          "DETECT",
          `Hallucination Risk Detected (${pScore.toFixed(0)}% Factuality)`,
          "ChatGPT response contains low-grounding or unverified claims. Automatically recorded in your Risk Findings dashboard.",
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

