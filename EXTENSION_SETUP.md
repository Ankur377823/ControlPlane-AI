# ControlPlane AI — Chrome Extension Setup Guide

This guide describes how to install, configure, and verify the **ControlPlane AI Network Shield & Guardrail Extension** on your local browser.

---

## 🔌 1. Installation Instructions

The Chrome Extension is pre-packaged inside this repository in the `frontend/extension/` directory.

### Step-by-Step Installation:
1. Open your Google Chrome browser.
2. In the URL address bar, navigate to: `chrome://extensions/`
3. In the top-right corner of the Extensions page, toggle **Developer mode** to **ON** (enabled).
4. In the top-left corner, click the **Load unpacked** button.
5. In the file picker popup, navigate to and select the directory:
   ```text
   C:\ControlPlane\frontend\extension
   ```
6. Click **Select Folder** (or Open).
7. The **ControlPlane AI Guardrail** extension will now appear in your list of active extensions.

---

## ⚙️ 2. Configuration & Enrollment

Once loaded, enroll the extension with your local ControlPlane security server:

1. Locate the puzzle piece icon 🧩 in the top-right corner of your browser toolbar.
2. Click the icon and select **ControlPlane AI Guardrail** (you can pin it for quick access).
3. Open the extension popup (styled in sleek dark theme):
   * **Server URL**: Keep as `http://localhost:8000` (or your production server URL).
   * **Tenant ID**: Enter your workspace identifier (default: `ankur-tenant-1`).
4. Click **⚡ Auto-Enroll**:
   * The extension will automatically query `/api/v1/tokens/active` to fetch your active 48-day activation token and configure itself.
   * If successful, the status indicator will switch to **CONNECTED 🟢**.
   * Alternatively, you can copy an enrollment token from the **Enrollment Tokens** tab of the dashboard and paste it into the **Enrollment Token** field manually, then click **Connect**.

---

## 🛡️ 3. Verification & Live Interception

The extension automatically injects a network shield on supported LLM chat portals (ChatGPT, Claude, Gemini, DeepSeek, Kimi, and Botpress) and displays a monitoring banner showing **"ControlPlane AI Monitoring Enabled"**.

### Test Interception:
1. Open ChatGPT ([https://chatgpt.com/](https://chatgpt.com/)) or Claude ([https://claude.ai/](https://claude.ai/)).
2. Try typing and sending a prompt containing sensitive PII or secrets, such as:
   ```text
   My active AWS key is AKIA1234567890ABCDEF
   ```
3. The extension's main-world fetch interceptor will intercept the outgoing API request, forward it to the local ControlPlane policy engine, mask the key to `[REDACTED_API_KEY]`, and then send the sanitized text to the LLM.
4. Visit your ControlPlane dashboard at [http://localhost:8000/#/security-center/risk-findings](http://localhost:8000/#/security-center/risk-findings) to view the live interception telemetry!
