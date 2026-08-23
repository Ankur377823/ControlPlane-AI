# ControlPlane AI — Enterprise AI Security & Governance Studio

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green.svg)](https://fastapi.tiangolo.com/)
[![Botpress](https://img.shields.io/badge/Botpress-Connector-purple.svg)](https://botpress.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Pytest-45%2F45%20Passed-emerald.svg)](#-testing--verification)

**ControlPlane AI** is an enterprise-grade AI security control plane, real-time guardrail shield, and session telemetry engine designed to govern, intercept, audit, and safeguard interactions across Botpress chatbots, AI assistants, and enterprise webhooks.

---

## 🌟 Executive Overview & Problem Statement

### The Problem
As organizations rapidly adopt AI chatbots, enterprise LLM agents, and customer support webhooks, they face major security, privacy, and compliance risks:
1. **Sensitive Data & Secret Exposure**: Users unwittingly input Personally Identifiable Information (PII such as SSNs, credit card numbers, email addresses), database passwords, API keys, and corporate trade secrets into chatbot interfaces.
2. **Adversarial Prompt Injection**: Malicious actors craft inputs designed to bypass safety filters, hijack system prompts, or extract internal bot configuration secrets.
3. **Lack of Session Telemetry & Auditability**: Inability to track multi-turn conversations, isolate distinct chat sessions, and enforce per-tenant security policies across chatbot environments.

### The Solution: ControlPlane AI
**ControlPlane AI** inserts a real-time, sub-15ms inline interception shield between users and AI chatbots. It automatically evaluates every prompt, redacts sensitive PII and secrets, blocks malicious prompt injection attempts, assigns unique **Session IDs** (`sess_botpress_...`) to every conversation, and provides live audit dashboards with one-click PDF security compliance reporting.

---

## 🏗️ System Architecture & Data Flow

```
                                ┌────────────────────────────────────────────────────────┐
                                │                 BOTPRESS CHATBOTS                      │
                                │           chat.botpress.cloud/{webhook_id}             │
                                └───────────────────────────┬────────────────────────────┘
                                                            │
                                                            ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │                              CHROME EXTENSION NETWORK SHIELD                                 │
 │  • Synchronous DOM & Main-World Fetch/XHR Interceptor                                        │
 │  • Automatic Botpress Webhook & Hostname Detection                                           │
 │  • Session ID Generator (e.g., sess_botpress_9a1b4c)                                          │
 └─────────────────────────────────────────────────────────┬────────────────────────────────────┘
                                                           │ POST /api/v1/resources/{id}/check
                                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │                              CONTROLPLANE AI FASTAPI BACKEND                                 │
 │  • Sub-15ms Policy Guardrail Engine: Performance (P), Cost ($), Responsibility (R) Scores    │
 │  • Policy Enforcement: BLOCK, MASK / REDACT, MONITOR, ALLOW                               │
 │  • SQLite Database WAL Persistence & Automated Migrations                                    │
 └─────────────────────────────────────────────────────────┬────────────────────────────────────┘
                                                           │
                                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │                              SECURITY CENTER FRONTEND DASHBOARD                              │
 │  • Risk Findings Telemetry (Live Interceptions Table with Session Navigation)                │
 │  • Event Overview Popup (Deep-Dive Telemetry & LLM Session Telemetry Registry)               │
 │  • Botpress Red Team Scanner & Automated PDF Security Report Generator                       │
 │  • Enrollment Token Lifecycle & Admin User Approvals                                         │
 └──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Features & Capabilities

### 🛡️ 1. Sub-15ms Real-Time Policy Guardrail Engine
- **`BLOCK`**: Instantly halts dangerous queries (e.g. database password extraction, system prompt overrides) before reaching the bot.
- **`MASK` / `REDACT`**: Automatically sanitizes PII (SSNs, credit card numbers, emails) replacing them with `[REDACTED_*]` tokens before forwarding.
- **`MONITOR`**: Permits non-blocking prompts while recording audit logs and safety metrics.
- **`ALLOW`**: Passes clean queries with sub-15ms latency.

### 🔌 2. Botpress Connector Integration
- **Direct Botpress Integration**: Onboard Botpress Cloud chatbots via Webhook ID.
- **Target Validation**: Test webhook connectivity (`POST /api/v1/resources/{id}/validate`).
- **Prompt Isolation**: Optional conversation context reset between test prompts (`reset_conversation: true`).

### 🔑 3. Distinct Chat Session ID Tracking
- Every chat turn across Botpress or browser sessions is tagged with a distinct Session ID (`sess_botpress_9a1b4c`).
- Clickable Session ID pills seamlessly open the **Event Overview & Telemetry** popup to inspect raw vs. redacted prompts and triggered security rules.

### 🔐 4. Session Persistence & Account Security
- **"Remember Me" & `sessionStorage` Security**: Closing the tab or starting a new browser session prompts for credentials by default, ensuring session isolation unless "Remember Me" is explicitly checked.
- **Admin Approvals & Multi-Tenant Workspaces**: Admin user approval flow for new sign-ups and workspace isolation (`acme-tenant-1` vs. `globex-tenant-2`).

### 🎯 5. Botpress Red Team Scanner & PDF Export
- Automated vulnerability probe execution against Botpress chatbots.
- Tests resistance against prompt injections, PII extractions, and jailbreaks.
- Generates downloadable professional **PDF Vulnerability Compliance Reports**.

---

## 🐳 Running ControlPlane AI with Docker

**ControlPlane AI** is fully Dockerized with built-in healthchecks, volume persistence, and automatic environment configuration.

### Option A: One-Command Startup with Docker Compose (Recommended)

Run the following command from the root directory:

```bash
docker compose up --build
```

- **Run in Background (Detached Mode)**:
  ```bash
  docker compose up --build -d
  ```

- **View Live Application Logs**:
  ```bash
  docker compose logs -f
  ```

- **Check Running Container Status**:
  ```bash
  docker compose ps
  ```

- **Stop Container**:
  ```bash
  docker compose down
  ```

### Option B: Using Manual Docker CLI Commands

1. **Build the Docker Image**:
   ```bash
   docker build -t controlplane-ai .
   ```

2. **Run Container with Persistent Data Volume**:
   ```bash
   docker run -d -p 8000:8000 -v botpress-data:/app/data --name controlplane-container controlplane-ai
   ```

3. **Stop & Remove Container**:
   ```bash
   docker stop controlplane-container
   docker rm controlplane-container
   ```

---

## 🌐 Accessing the Application

Once launched locally or via Docker:

- 📊 **ControlPlane AI Dashboard**: [http://localhost:8000/](http://localhost:8000/)
- 📖 **Interactive OpenAPI Specs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 💓 **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

### 👤 Demo Login Credentials

- **Admin Account**: `ankur@acme.com` (or `ankur`) | Password: `password123`
- **Standard Users**: `john@acme.com` / `alice@globex.com` | Password: `password123`

---

## 🚀 Local Setup Guide (Without Docker)

### Prerequisites
- **Python 3.9+** (Python 3.11 recommended)
- **Git**

### Installation Steps

```bash
# 1. Create Python virtual environment
python -m venv .venv

# 2. Activate environment (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Activate environment (Linux / macOS)
source .venv/bin/activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Start FastAPI server
python -m uvicorn backend.app.main:app --reload --port 8000
```

---

## 🧩 Installing the Chrome Extension

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select `frontend/extension`.
4. Open any webpage or chatbot target; the top **ControlPlane AI Monitoring Enabled** banner will display active protection.

---

## 🔌 API Reference Highlights

### 1. Guardrail Real-Time Check
`POST /api/v1/resources/{resource_id}/check`

**Request Body**:
```json
{
  "user_prompt": "My SSN is 000-12-3456 and email is sara@company.com",
  "session_id": "sess_botpress_8f3a92"
}
```

**Response**:
```json
{
  "interception_id": "ic_9a1b2c3d",
  "action": "MASK",
  "sanitized_prompt": "My SSN is [REDACTED_SSN] and email is [REDACTED_EMAIL]",
  "latency_ms": 12,
  "scores": {
    "performance_p": 98.5,
    "cost_dollars": 95.0,
    "responsibility_r": 99.0
  },
  "triggered_rules": ["PII_SSN_REDACT", "PII_EMAIL_MASK"]
}
```

### 2. List Risk Findings
`GET /api/v1/findings?limit=100`

### 3. Onboard Resource
`POST /api/v1/resources`

---

## 🧪 Testing & Verification

Run the full pytest test suite:

```bash
python -m pytest backend/tests
```

**Expected Output**: `45 passed` (100% test pass rate covering authentication, token lifecycle, bot onboarding, guardrail evaluations, risk findings, and analytics).
