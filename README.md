# ControlPlane AI — Responsible AI Control Plane & Governance Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Cloud-336791.svg)](https://neon.tech/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Pytest-77%2F77%20Passed-emerald.svg)](#-testing--verification)


**ControlPlane AI** is an enterprise-grade **Responsible AI (RAI) Governance Control Plane**, real-time guardrail shield, and telemetry monitoring studio. It is engineered to safeguard, monitor, audit, and auto-tune AI assistants, chatbots, and autonomous agents across diverse organizational use cases (Customer Support, Internal Copilot, Decision Support, and Agent Runtimes).

---

## 🌟 Executive Overview & Core Capabilities

ControlPlane AI bridges the critical gap between raw AI safety proxies and a comprehensive Responsible AI governance lifecycle:

1. **Modern React SPA Architecture**: Built on React 18, Vite 6, and Tailwind CSS with a clean dual **Light / Dark Mode** system (default clean white & black light theme with an instant header toggle ☀️/🌙).
2. **Use-Case & Resource Risk Profiles**: Adaptive policies for **Customer Support** (latency-prioritized, strict PII masking), **Internal Copilot** (credential protection), **Decision Support** (strict grounding & bias verification), and **Autonomous Agents** (compound trajectory safety).
3. **Evidence-Backed Grounding & Factuality**: Atomic claim extraction paired with RAG context-faithfulness scoring against enterprise documents and live web search verification (Serper API fallback).
4. **Human-in-the-Loop (HITL) Review Queue**: Real-time review lifecycle for `CONFIRM_REQUIRED` and `FLAGGED` events with **Approve**, **Reject**, and **Policy Override** actions.
5. **Self-Tuning Feedback Loop & Trustworthiness Index**: Tracks True/False Positive rates, Precision, Recall, and auto-tunes policy thresholds upon reviewer feedback.
6. **Cumulative Multi-Turn Session Risk**: Time-decayed rolling risk accumulator ($\alpha = 0.85$) to detect conversational drift, salami slicing, and gradual probing.
7. **Compound Agent-Action Sequence Risk**: State-machine tracking sequential tool calls (e.g. `query_database` $\rightarrow$ `read_file` $\rightarrow$ `export_data` $\rightarrow$ `send_email`) to stop data exfiltration chains.
8. **AI-as-a-Judge Tiered Fallback**: Invokes secondary semantic evaluation *only* when deterministic confidence is borderline ($0.40 \le \text{Risk} \le 0.70$), preserving sub-15ms latency for normal traffic.
9. **Automated AI Red Team Scanner**: Automated multi-turn vulnerability scanner with prompt injection, PII extraction, and jailbreak attack presets with downloadable PDF audit reports.
10. **Chrome Extension Network Shield**: Manifest V3 extension in a sleek permanent dark theme with client-side prompt interception and auto-enrollment.
11. **Tamper-Evident SHA-256 Hash Chain Audit**: Cryptographic proof of event integrity across all interceptions.
12. **Dual Database Architecture**: Zero-config SQLite local development + Neon Cloud PostgreSQL production mode.

---

## 🏗️ Architecture & Decision Pipeline

```
                                  Incoming Prompt / Response / Tool Call
                                                    │
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │    AI Use Case Registry     │
                                     │  Support / Copilot / Agent  │
                                     └──────────────┬──────────────┘
                                                    │
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │   Fast Deterministic Layer  │  (Sub-15ms)
                                     │  PII, Injection, Bias, Cost │
                                     └──────────────┬──────────────┘
                                                    │
                             ┌──────────────────────┴──────────────────────┐
                             │                                             │
                       [Clear Outcome]                            [Ambiguous / Grounding]
                             │                                             │
                             │                                             ▼
                             │                               ┌─────────────────────────────┐
                             │                               │ Evidence & RAG Grounding    │
                             │                               │ Claim-Level Context Check   │
                             │                               └─────────────┬───────────────┘
                             │                                             │
                             │                               ┌─────────────▼───────────────┐
                             │                               │ AI-as-a-Judge Fallback      │
                             │                               │ (Borderline Scores 0.4-0.7) │
                             │                               └─────────────┬───────────────┘
                             │                                             │
                             └──────────────────────┬──────────────────────┘
                                                    │
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │   Decision & Policy Engine  │
                                     └──────────────┬──────────────┘
                                                    │
                   ┌─────────────────┬──────────────┴──────────────┬─────────────────┐
                   ▼                 ▼                             ▼                 ▼
                [ALLOW]            [MASK]                 [CONFIRM_REQUIRED]      [BLOCK]
             Fast execution    Redact PII / Keys          Human Review Queue     Hard Halt
                   │                 │                             │                 │
                   └─────────────────┴──────────────┬──────────────┴─────────────────┘
                                                    │
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │ SHA-256 Hash-Chain Logger   │
                                     └──────────────┬──────────────┘
                                                    │
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │ Reviewer Feedback Loop &    │
                                     │ Trustworthiness Index       │
                                     └─────────────────────────────┘
```

---

## 📂 Project Directory Structure

```
ControlPlane/
├── backend/
│   ├── app/
│   │   ├── connector/             # Connectors & Evaluator Engines
│   │   │   ├── evaluators/        # Modular Responsible AI engines
│   │   │   │   ├── action_risk.py # Tool risk & compound sequence tracker
│   │   │   │   ├── ai_judge.py    # Secondary LLM-as-a-Judge for ambiguity
│   │   │   │   ├── bias_safety.py # Flags toxicity & bias keywords
│   │   │   │   ├── cost.py        # Token budget and cost controls
│   │   │   │   ├── grounding.py   # RAG context-faithfulness & claim extraction
│   │   │   │   ├── guardian.py    # Zero-LLM deterministic 7-check engine
│   │   │   │   ├── hallucination.py # Heuristic hedging pattern checker
│   │   │   │   ├── injection.py   # Prompt injection & jailbreak shield
│   │   │   │   ├── multi_turn_risk.py # Cumulative session risk accumulator
│   │   │   │   └── pii.py         # Regex PII masks
│   │   │   ├── guardrail.py       # Master guardrail orchestrator
│   │   │   └── scanner.py         # Automated red-team multi-turn prober
│   │   ├── models/
│   │   │   └── db/                # Modular Database Package
│   │   │       ├── __init__.py    # Re-exports public API
│   │   │       ├── connection.py  # Dual SQLite/PostgreSQL engine & seeds
│   │   │       ├── interceptions.py # Interceptions and telemetry queries
│   │   │       ├── policies.py    # Use-case policy profiles CRUD
│   │   │       ├── resources.py   # AI resource management
│   │   │       ├── reviews.py     # Isolated Review Queue & Trust Metrics
│   │   │       ├── scans.py       # Red-team scan results
│   │   │       ├── tokens.py      # Enrollment tokens lifecycle
│   │   │       └── users.py       # Multi-tenant users & RBAC
│   │   ├── routes/                # FastAPI REST endpoints
│   │   │   ├── auth.py            # Authentication & RBAC
│   │   │   ├── findings.py        # Findings, Review Queue & Feedback APIs
│   │   │   ├── guardian_api.py    # Guardian compatibility endpoints
│   │   │   ├── guardrail.py       # Standalone guardrail checks
│   │   │   ├── hallucination.py   # RAG Grounding & FacTool verification
│   │   │   ├── resources.py       # Resource lifecycle & /check endpoint
│   │   │   └── tokens.py          # Extension tokens
│   │   └── main.py                # App entrypoint & static mounting
│   └── tests/                     # 75 Automated Unit & Integration Tests
├── frontend/                      # React 18 + Vite + Tailwind CSS Studio
│   ├── src/
│   │   ├── components/            # Layouts & Modals
│   │   │   ├── layout/            # AppShell, Sidebar, Header (with Theme Toggle)
│   │   │   └── modals/            # LoginScreen, UserManagement, EventOverview
│   │   ├── context/               # AuthContext, ThemeContext, ToastContext
│   │   ├── services/              # API Service Gateway (api.js)
│   │   ├── views/                 # 12 Modular Views
│   │   │   ├── DashboardView.jsx  # Trustworthiness Index & Executive KPIs
│   │   │   ├── RiskFindingsView.jsx # Live Risk Findings Grid
│   │   │   ├── EventOverviewView.jsx # Telemetry & HITL Review Actions
│   │   │   ├── InventoryView.jsx  # Monitored AI Resource Directory
│   │   │   ├── OnboardResourceView.jsx # Connector Onboarding Form
│   │   │   ├── AgentRuntimeView.jsx # Tool Execution Sandbox
│   │   │   ├── PoliciesView.jsx   # Policy Configurator & Frameworks
│   │   │   ├── EnrollmentTokensView.jsx # Key Generator & Revocation
│   │   │   ├── EndpointAIView.jsx # Extension Connection Guide
│   │   │   ├── RedTeamScannerView.jsx # Adversarial Probes & PDF Reports
│   │   │   ├── HallucinationsView.jsx # FacTool Claim Verifier
│   │   │   └── DocumentationView.jsx # 14-Tab Architectural Guide
│   │   ├── App.jsx                # Main Coordinator & Router
│   │   ├── main.jsx               # React Root Entrypoint
│   │   └── index.css              # Tailwind & Dual-Theme Tokens
│   ├── extension/                 # Chrome Manifest V3 Network Shield Extension
│   ├── package.json               # React dependencies & build scripts
│   ├── vite.config.js             # Vite config & API reverse proxy
│   └── tailwind.config.js         # Tailwind dark-mode class configuration
├── DESIGN.md                      # Detailed technical architecture
├── EXTENSION_SETUP.md             # Extension installation walkthrough
└── Dockerfile                     # Production container spec
```

---

## 🎯 Key Capabilities & Usage Guide

### 1. Fast Real-Time Guardrail Check
Evaluates user prompts, tool calls, or model outputs in sub-15ms:
* **PII Redaction**: Matches and masks SSNs, Credit Cards, Phones, and Emails.
* **Prompt Injection Shield**: Flags DAN jailbreaks, system prompt extraction, and instruction overrides.
* **Toxicity & Bias Filter**: Detects discriminatory or toxic language.
* **Cost & Token Bounds**: Alerts when prompts exceed token limits.

### 2. Evidence-Backed RAG Grounding & Factuality Inspector
* Breaks down responses into atomic claims.
* Cross-references claims against trusted context documents.
* Computes Context-Faithfulness Score ($0.0 - 1.0$) and flags ungrounded assertions.
* Fallback to live Serper Google Search when external web verification is requested.

### 3. Human-in-the-Loop (HITL) Review Queue
* Ambiguous or high-risk decisions (`CONFIRM_REQUIRED`, `FLAGGED`) route into the review queue.
* Reviewers can inspect evidence, session history, and execute:
  * **✓ Approve**: Allows the action.
  * **✕ Reject**: Enforces a hard block.
  * **⚡ Override**: Grants a logged business exception.
  * **🎯 False Positive**: Logs feedback and automatically tunes detector strictness thresholds.

### 4. Cumulative Multi-Turn Session Risk
* Tracks session trajectories over time.
* Formula: $\text{Cumulative Risk} = (0.85 \times \text{Previous}) + (\text{Current Turn Risk} \times 0.5)$.
* Escalates action when cumulative turn score exceeds the session budget even if individual prompts appear benign.

### 5. Compound Agent-Action Sequence Tracker
* State-machine tracking tool sequences.
* Prevents data exfiltration chains: e.g. `query_database` $\rightarrow$ `read_file` $\rightarrow$ `export_data` $\rightarrow$ `send_email`.

### 6. Automated AI Red Team Scanner & PDF Reports
* Probes chatbots and webhook endpoints across injection, PII leak, and jailbreak attack vectors.
* Supports clean session isolation (`reset_conversation=True`) and ad-hoc scanning.
* Generates downloadable, professional PDF compliance audit reports.

---

## 🌐 REST API Reference Table

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user & retrieve session token |
| `GET` | `/api/v1/resources` | List onboarded AI resources and bots |
| `POST` | `/api/v1/resources` | Onboard a new AI chatbot / webhook target |
| `POST` | `/api/v1/resources/{id}/check` | **Real-Time Guardrail Evaluation** (PII, Injection, Tool calls, Grounding) |
| `GET` | `/api/v1/resources/{id}/policy` | Retrieve guardrail policy profile |
| `PUT` | `/api/v1/resources/{id}/policy` | Update guardrail policy thresholds and mode |
| `POST` | `/api/v1/resources/{id}/scan` | Run automated Red Team vulnerability scan |
| `POST` | `/api/v1/scan/adhoc` | Run ad-hoc vulnerability scan against any webhook |
| `GET` | `/api/v1/findings` | List all intercepted security findings |
| `GET` | `/api/v1/findings/review-queue` | **Human Review Queue** for pending items |
| `POST` | `/api/v1/findings/{id}/review` | Process reviewer decision (Approve/Reject/Override) |
| `POST` | `/api/v1/findings/{id}/feedback` | Submit feedback (Auto-tunes policy thresholds) |
| `POST` | `/api/v1/hallucination/verify` | **Factuality & RAG Grounding Verification** |
| `GET` | `/api/v1/analytics/summary` | Executive platform KPIs & Governance scores |
| `GET` | `/api/v1/analytics/trustworthiness` | Trustworthiness Index, Precision, Recall, FPR, FNR |
| `GET` | `/api/v1/tokens` | List extension enrollment tokens |
| `POST` | `/api/v1/tokens` | Create enrollment token for Chrome extension |
| `POST` | `/api/v1/guardian/check` | LegionForge Guardian 7-check tool call security |

---

## 💻 PowerShell & cURL Command Recipes

### 1. Real-Time Prompt Check with PII Detection (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/resources/res_demo/check" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"user_prompt": "My credit card is 4532-1234-5678-9012"}'
```

### 2. Test Dangerous AI Agent Tool Call (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/resources/res_demo/check" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{
    "user_prompt": "Transfer funds",
    "tool_call": {
      "name": "transfer_money",
      "parameters": {"amount": 5000, "recipient": "ext_account_123"}
    }
  }'
```

### 3. Verify RAG Factuality & Grounding (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/hallucination/verify" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{
    "prompt": "What is the refund policy?",
    "response": "Customers can request a refund within 30 days of purchase.",
    "context_docs": ["Refund policy: 30 days from purchase with original receipt."]
  }'
```

---

## 🧩 Chrome Extension Network Shield Setup

The **Chrome Network Shield** intercepts chatbot traffic directly in the browser with a sleek dark theme:

1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **"Developer mode"** in the top right toggle.
3. Click **"Load unpacked"** and select the [`frontend/extension/`](file:///c:/ControlPlane/frontend/extension/) directory.
4. Click the ControlPlane extension icon in Chrome:
   - Click **⚡ Auto-Enroll** to automatically fetch an active token from `http://localhost:8000`.
   - The status indicator switches to **CONNECTED 🟢**.
5. Navigate to any AI chat portal (ChatGPT, Claude, Gemini, DeepSeek, Kimi) — prompt checks and secret redaction execute transparently!

---

## ⚡ Quick Start & Deployment

### 1. Run Locally
```bash
# 1. Start backend server (FastAPI)
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000

# 2. (Optional) Run React Frontend in Dev Mode with HMR
cd frontend
npm install
npm run dev

# 3. Build React Frontend for Production
npm run build
Open **`http://localhost:8000`** (or `http://localhost:5173` in Vite dev mode) in your browser. Configure your admin credentials in `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).


### 2. Run with Docker
```bash
docker-compose up --build
```

### 3. Environment Variables Reference

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | *(None / SQLite)* | PostgreSQL connection URL (e.g. Neon Cloud). If unset, uses local SQLite. |
| `BOTPRESS_CONNECTOR_DB` | `botpress_connector.db` | Path to local SQLite file. |
| `SERPER_API_KEY` | *(Optional)* | Google Search API key for live external factuality checking. |
| `GEMINI_API_KEY` | *(Optional)* | Google Gemini API key for AI-as-a-Judge semantic evaluations. |
| `OPENAI_API_KEY` | *(Optional)* | OpenAI API key for FacTool verification fallback. |

---

## 🧪 Testing & Verification

Run the full automated test suite covering all 11 Responsible AI capability modules:

```bash
pytest backend/tests -v
```

```
======================= 75 passed, 8 warnings in 5.90s =======================
```

Every single component is tested:
* `test_action_risk.py` & `test_compound_action.py`: Action tiers and exfiltration sequence triggers.
* `test_grounding.py` & `test_hallucination.py`: Claim extraction, RAG context-faithfulness, and Serper API search verification.
* `test_multi_turn_risk.py`: Cumulative risk decay and multi-turn escalation.
* `test_ai_judge.py`: Ambiguity band triggers and judge reasoning.
* `test_review_queue.py`: Human-in-the-Loop review lifecycle and Trustworthiness Analytics APIs.
* `test_guardian.py`: 7-check deterministic zero-LLM agent security layers.
* `test_guardrail.py`: Real-time guardrail orchestrator and enforcement modes.
* `test_full_suite.py` & `test_api.py`: Comprehensive end-to-end integration flows.
* `test_scanner.py`: Botpress scanner error mapping, rate limiting, and timeout resilience.
