/**
 * ControlPlane AI Guardrail - Background Service Worker (Manifest V3)
 * Proxies API requests from content scripts to bypass browser mixed-content (HTTPS -> HTTP) and CSP restrictions.
 */

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});

// Proxy network calls on behalf of content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request && request.type === "CP_EVALUATE_GUARDRAIL") {
    const { url, headers, body } = request;

    fetch(url, {
      method: "POST",
      headers: headers || { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errText = await response.text();
          sendResponse({ success: false, status: response.status, error: errText });
          return;
        }
        const data = await response.json();
        sendResponse({ success: true, data: data });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message || "Network request failed" });
      });

    return true; // Required for asynchronous sendResponse in Manifest V3
  }
});
