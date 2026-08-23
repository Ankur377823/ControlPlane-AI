/**
 * ControlPlane AI Guardrail - Background Service Worker
 * Opens popup.html in a new Google Chrome tab when the extension icon is clicked.
 */

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});
