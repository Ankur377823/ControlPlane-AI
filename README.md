# ControlPlane AI — Responsible AI Governance & Threat Interception Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render%20Cloud-success?style=for-the-badge&logo=render)](https://controlplane-ai-utso.onrender.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Cloud-336791.svg)](https://neon.tech/)
[![Docker](https://img.shields.io/badge/Docker-Live%20Watch%20Ready-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Pytest-134%2F134%20Passed-emerald.svg)](#-testing--verification-suite)

> 🚀 **Live Production Deployment**: **[https://controlplane-ai-utso.onrender.com/](https://controlplane-ai-utso.onrender.com/)**
>
> 🔑 **Demo & Hackathon Tester Access Credentials**:
> * **Username / Identity**: `admin` (or `ankur@acme.com`)
> * **Password**: `password123`

---

## 📖 Table of Contents
1. [Overview & Security Architecture](#-overview--security-architecture)
2. [Quick Start with Docker & Local Setup](#-quick-start-with-docker--local-setup)
3. [Deep Component Guide & How-To Workflows](#-deep-component-guide--how-to-workflows)
   - [Module 1: Monitored Resources & Onboarding Webhooks](#1-monitored-resources--resource-onboarding)
   - [Module 2: AI Red Team Vulnerability Scanner](#2-ai-red-team-vulnerability-scanner)
   - [Module 3: AI Agent Runtime Interceptor & cURL Testing](#3-ai-agent-runtime-interceptor)
   - [Module 4: HITL (Human-in-the-Loop) Review Queue](#4-human-in-the-loop-hitl-review-queue)
   - [Module 5: Policy Engine & Guardrail Rules](#5-policy-engine--guardrail-rules)
   - [Module 6: Risk Findings & Telemetry Feed](#6-risk-findings--telemetry-feed)
   - [Module 7: Hallucinations & RAG Grounding Studio](#7-hallucination--rag-grounding-studio)
   - [Module 8: Chrome Extension (Manifest V3)](#8-chrome-extension-manifest-v3-shield)
   - [Module 9: In-Studio Documentation View](#9-in-studio-documentation-view)
4. [Architecture & 4-Tier Threat Engine](#-architecture--4-tier-threat-cascading-engine)
5. [Testing & Verification Suite](#-testing--verification-suite)
6. [Repository Directory Structure](#-repository-directory-structure)

---

## 🛡️ Overview & Security Architecture

**ControlPlane AI** is an enterprise-grade Responsible AI (RAI) Governance Control Plane, real-time guardrail shield, and security monitoring studio. It protects AI applications, autonomous agents, enterprise chatbots, and browser LLM tools with a **sub-15ms fast-path pipeline** and **zero cloud egress penalties**.

### Key System Capabilities
* **Sub-15ms Deterministic Guardrail**: Evaluates inputs via Luhn Mod-10 credit card checks, Shannon Information Entropy secret scanning, and Unicode zero-width anti-evasion stripping.
* **134 Security Taxonomies**: Projects prompts into vector space ($\mathbb{R}^d$ Cosine Similarity) checking against NIST AI RMF, Meta Llama Guard 3, and OWASP LLM Top 10.
* **Autonomous Agent Action Risk Tiers**: Intercepts tool calls (`delete_file`, `transfer_money`, `send_email`) into `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` risk tiers.
* **SHA-256 Tamper-Evident Audit Chain**: Cryptographically links every intercepted event into a sequential hash chain for SOC 2, HIPAA, and GDPR audit compliance.

---

## ⚡ Quick Start with Docker & Local Setup

### Option A: Running with Docker Compose (Recommended)

To launch the complete application stack (React Frontend + FastAPI Backend + DB) using Docker Compose with live watch enabled:

```bash
# 1. Clone the repository
git clone https://github.com/Ankur377823/ControlPlane-AI.git
cd ControlPlane

# 2. Launch with Docker Compose and live-watch auto-rebuild
docker compose up --build --watch
```

*Alternative standard Docker startup:*
```bash
docker compose up --build
```

Once started, open your browser to **`http://localhost:8000/`** to access the ControlPlane AI Governance Studio.

---

### Option B: Running Locally with Python & Node.js

```bash
# 1. Setup Python virtual environment & backend dependencies
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt

# 2. Launch FastAPI Backend
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

In a second terminal window:

```bash
# 3. Launch React Frontend Dev Server
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173/`** or **`http://localhost:8000/`**.

---

## 🧩 Deep Component Guide & How-To Workflows

ControlPlane AI organizes governance into interconnected operational components. Below is the step-by-step guide for each feature:

---

### 1. Monitored Resources & Resource Onboarding

#### What it does:
Registers and manages AI chatbots, autonomous agents, REST API gateways, and Botpress webhooks protected by ControlPlane AI.

#### Step-by-Step Resource Onboarding & Botpress Setup (~5 minutes):
1. Navigate to **Monitored Resources** (`/inventory`) in the left sidebar.
2. Click **+ Onboard Monitored Resource** at the top right.
3. **One-Time Botpress Webhook Setup**:
   - Sign up at [https://botpress.com](https://botpress.com) and create a new bot in Botpress Studio.
   - Give it a trivial flow (e.g. *"On Message → Send Text"* replying to anything the user says).
   - Publish the bot.
   - Go to **Bot → Integrations** → install and enable **Chat**.
   - Copy the **Webhook ID** shown in the Chat integration config.
   - Sanity check from a terminal:
     ```bash
     curl -s "https://chat.botpress.cloud/YOUR_WEBHOOK_ID/hello"
     ```
     A non-error JSON response confirms the bot is reachable.
4. Enter your **Account Name**, **Resource Name**, and paste the **Webhook ID** into the onboarding form.
5. Select your Use Case Category (**Customer Support**, **Internal Copilot**, or **Regulated Decision Support**).
6. Click **Save & Onboard Resource**.
7. **Obtaining Webhook URLs & Endpoints**:
   - **REST AI Gateway Endpoint**: `http://localhost:8000/api/v1/resources/{resource_id}/check`
   - **Botpress Cloud Webhook URL**: `http://localhost:8000/api/botpress/webhook`
   - **OpenAI Proxy Endpoint**: `http://localhost:8000/v1/chat/completions`

---

### 2. AI Red Team Vulnerability Scanner

#### What it does:
Simulates automated adversarial attacks, DAN jailbreak prompts, system prompt extraction, and PII harvesting against your AI resources, generating an executive PDF audit compliance certificate.

#### Step-by-Step Scanner Workflow:
1. Navigate to **AI Red Team Scanner** (`/ai-red-team`) in the sidebar.
2. Select target endpoint (e.g., *Botpress Webhook* or *Monitored Resource*).
3. Choose an **Attack Probe Suite**:
   - **System Prompt Extraction**: Tests instruction disclosure.
   - **PII & Credential Harvesting**: Tests credit card, SSN, and API key leakage.
   - **DAN Jailbreak & Authority Bypass**: Tests roleplay and compliance bypass.
   - **Custom Multi-Prompt Suite**: Paste custom line-separated test prompts.
4. Click **Run Automated Red Team Scan**.
5. Inspect real-time probe execution table (`DEFENDED` vs `VULNERABLE`).
6. Click **Download Executive PDF Report** to export a formal compliance certificate.

---

### 3. AI Agent Runtime Interceptor

#### What it does:
Monitors autonomous AI agent tool executions in real time, stopping destructive OS commands, unauthorized file deletions, or database drops.

#### Testing AI Runtime via cURL Command:

You can test prompt guardrails and tool interception via cURL:

```bash
# Test 1: High-Risk Destructive File Action (Triggers CONFIRM_REQUIRED in HITL Queue)
curl -X POST "http://localhost:8000/api/v1/resources/res_default_001/check" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer cp_live_default" \
  -d '{
    "user_prompt": "My credit card is 4532-1234-5678-9010",
    "tool_call": {
      "name": "delete_file",
      "parameters": {"path": "/var/log/audit.log"}
    },
    "session_id": "sess_10293847"
  }'
```

**Expected JSON Response:**
```json
{
  "action": "CONFIRM_REQUIRED",
  "sanitized_prompt": "My credit card is [CREDIT_CARD_REDACTED]",
  "action_risk_tier": "HIGH",
  "latency_ms": 3.8,
  "triggered_rules": ["PII_CREDIT_CARD", "DESTRUCTIVE_FILE_ACTION"],
  "hash_chain": "a8fbc7304918e..."
}
```

```bash
# Test 2: Low-Risk Query Action (Allowed)
curl -X POST "http://localhost:8000/api/v1/resources/res_default_001/check" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer cp_live_default" \
  -d '{
    "user_prompt": "What are our Q3 product features?",
    "tool_call": {
      "name": "search_web",
      "parameters": {"query": "Q3 roadmap"}
    },
    "session_id": "sess_10293848"
  }'
```

---

### 4. Human-in-the-Loop (HITL) Review Queue

#### What it does:
Acts as a human authorization checkpoint for `CONFIRM_REQUIRED` high-risk events and flagged prompt violations.

#### How to Review & Resolve:
1. Navigate to **HITL Review Queue** (`/security-center/review-queue`).
2. Click any pending finding item to open the detailed inspector panel.
3. Review original prompt text vs. sanitized masked output.
4. Take action:
   - **Approve Action**: Authorizes the agent execution or guardrail decision.
   - **Reject / False Positive**: Overrides the decision and marks it as a false positive.
   - **Acknowledge**: Marks finding as reviewed by security auditor.
5. The system performs **closed-loop threshold auto-tuning** based on reviewer decisions to lower future false positives.

---

### 5. Policy Engine & Guardrail Rules

#### What it does:
Defines system presets and custom regex/entropy rules that dictate whether inputs are `BLOCK`ed, `MASK`ed, `CONFIRM_REQUIRED`, or `AUDIT`ed.

#### The 5 Regulatory Policy Presets:
| Policy Preset | Default Action Mode | Core Defenses |
| :--- | :--- | :--- |
| **Customer Support** | `MASK` | Credit cards (Luhn Mod-10), phone numbers, competitor steering. |
| **Internal Copilot** | `MASK` + `AUDIT` | Shannon Entropy secret scanning (API keys, URIs, passwords). |
| **Healthcare HIPAA** | `BLOCK` | Universal medical centroids, patient chart dumps, opioid overdoses. |
| **Autonomous Agents** | `CONFIRM_REQUIRED` | State-machine tool call interception (`delete_file`, `transfer_money`). |
| **Global GDPR Privacy** | `REDACT` | IBANs, passports, homoglyphs, zero-width evasion stripping. |

---

### 6. Risk Findings & Telemetry Feed

#### What it does:
Provides a real-time audit log of all intercepted prompts, session IDs, threat categories, and SHA-256 hash chains across connected channels.

#### Features & Usage:
1. Navigate to **Risk Findings** (`/security-center/risk-findings`).
2. Use **Source Filters** (*All Sources*, *Browser Extension*, *Botpress Webhooks*, *REST AI Gateway*, *Agent Runtime*).
3. Filter by **Severity** (*CRITICAL*, *HIGH*, *MEDIUM*, *LOW*).
4. Click any finding row to view the full deep-dive finding breakdown, session telemetry, and SHA-256 verification hash.

---

### 7. Hallucination & RAG Grounding Studio

#### What it does:
Extracts atomic factual claims from LLM responses and verifies context-faithfulness against enterprise RAG reference documents and live Google Search / Wikipedia evidence.

#### How to Run Grounding Checks:
1. Navigate to **Hallucination & RAG Grounding** (`/hallucinations`).
2. Enter the **User Query / Prompt**.
3. Enter the **Model Generated Response** to evaluate.
4. *(Optional)* Paste official **RAG Reference Context** (product manual or company policy).
5. Click **Verify Factuality & Grounding**.
6. View atomic claim decomposition, factuality scores, and live Wikipedia/Serper verification links.

---

### 8. Chrome Extension (Manifest V3) Shield

#### What it does:
Provides client-side synchronous prompt interception on ChatGPT, Claude, Gemini, DeepSeek, Kimi, Perplexity, Copilot, and Botpress with sub-15ms ingress evaluation and zero-CSP footprint.

#### Installation & Setup:
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the directory `ControlPlane/frontend/extension`.
5. Open any AI chatbot (e.g. `https://chatgpt.com`).
6. Observe the top **ControlPlane Active** status banner securing your session.

---

### 9. In-Studio Documentation View

For an interactive in-app reference with copy-pasteable cURL recipes, visual topology flowcharts, and component guides:

1. Launch ControlPlane AI (`http://localhost:8000/`).
2. Click **Documentation** in the sidebar (or visit `http://localhost:8000/#/documentation`).
3. Browse interactive sections:
   - **What is ControlPlane AI?**
   - **Architecture & Component Pipeline**
   - **All 15 System Components**
   - **REST API Reference (with 1-Click Copy cURL)**
   - **Guardrail Interceptor Setup & Troubleshooting**

---

## 🏗️ Architecture & 4-Tier Threat Cascading Engine

```
+-----------------------------------------------------------------------------------+
|                        INGRESS GATEWAY / INTERCEPTION SHIELD                      |
|           (FastAPI Webhook / Chrome Extension / Agent Tool Execution)              |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| TIER 1: DETERMINISTIC DELIMITER STRIPPER & UNICODE ANTI-EVASION                   |
| - Strips zero-width chars ('Cf', 'Cs'), homoglyphs, ChatML / Llama-3 headers       |
| - Luhn Mod-10 credit card validation & Shannon Entropy secret scanner              |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| TIER 2: UNIVERSAL VECTOR SPACE PROJECTION & CENTROID CLASSIFIER                   |
| - Projects input into continuous subword n-gram frequency space (3 <= n <= 5)     |
| - Evaluates cosine similarity against 134 threat centroids across 5 taxonomies    |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| TIER 3: SLIDING WINDOW CHUNKING & CONTINUOUS EVALUATION                           |
| - 450-token window with 100-token overlap to stop payload obfuscation             |
| - Aggregates maximum vector distance across all sliding windows                   |
+-----------------------------------------------------------------------------------+
                                          |
                    +---------------------+---------------------+
                    |                                           |
                    v (Borderline Risk)                         v (Clear Pass / Block)
+---------------------------------------+   +---------------------------------------+
| TIER 4: SECONDARY LLM JUDGE (OLLAMA)  |   | ENFORCEMENT & CRYPTOGRAPHIC AUDIT     |
| - Contextual verdict for borderline   |   | - ALLOW / MASK / FLAG / BLOCK         |
|   scores (0.40 <= score < 0.70)       |   | - SHA-256 Hash Chain Audit Log        |
+---------------------------------------+   +---------------------------------------+
```

---

## 🧪 Testing & Verification Suite

ControlPlane AI includes an automated test suite with **134 passing Pytests**:

```bash
# Run pytest backend test suite
pytest backend/tests -v
```

### Verified Test Modules:
- `test_universal_vector_engine.py`: Verifies zero-shot vector projections across all 5 policy archetypes.
- `test_grounding.py`: Verifies speech-act claim extraction and RAG grounding.
- `test_pii.py`: Verifies Luhn Mod-10 card checks and Shannon entropy secret scanning.
- `test_red_team_package.py`: Verifies automated red-team probes and PDF report generation.

---

## 📂 Repository Directory Structure

```text
ControlPlane/
├── backend/                             # Python 3.11+ FastAPI Server & Security Engine
│   ├── app/
│   │   ├── config/
│   │   │   └── threat_taxonomies.json   # Declarative threat taxonomy centroids
│   │   ├── connector/                   # Sub-15ms Real-Time Guardrail Core
│   │   │   ├── evaluators/              # Evaluators (pii, injection, grounding, etc.)
│   │   │   └── guardrail.py             # Master Orchestrator
│   │   ├── models/db/                   # Database Layer (PostgreSQL / SQLite)
│   │   ├── red_team/                    # Automated Red Team Vulnerability Scanner
│   │   ├── routes/                      # REST API Endpoints (/check, /scan, /findings)
│   │   └── main.py                      # FastAPI Application Entrypoint
│   └── tests/                           # Pytest Suite (134/134 Passing)
├── frontend/                            # React 18 + Vite Modern SPA
│   ├── extension/                       # Chrome Manifest V3 Network Shield Extension
│   ├── src/                             # Views, Components, Contexts
│   └── tailwind.config.js               # Tailwind CSS Configuration
├── README.md                            # Master repository guide
├── DESIGN.md                            # Technical architecture & mathematical specifications
├── EXTENSION_SETUP.md                   # Chrome extension installation guide
├── requirements.txt                     # Python dependencies
└── docker-compose.yml                   # Container orchestration config
```

---

## 📄 License & Compliance
Licensed under the **MIT License**. Engineered for **SOC 2 Type II**, **US HIPAA**, **EU GDPR**, and **EU AI Act** compliance architectures.
