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
> 🔑 **Hackathon Tester / Judge Access Credentials**:
> * **Username / Identity**: `admin` (or `ankur@acme.com`)
> * **Password**: `password123`

---

## 📚 Documentation Sitemap & File References

For deep-dive architectural specifications, setup guides, and system design diagrams, refer to the following documentation files in this repository:

1. **[`README.md`](file:///c:/ControlPlane/README.md)** *(This File)*: Master overview, quick start, file structure tree, comprehensive feature breakdown across all 7 core modules, and test verification suite.
2. **[`DESIGN.md`](file:///c:/ControlPlane/DESIGN.md)**: Deep technical architecture, mathematical formulas ($\mathbb{R}^d$ Cosine Similarity, Shannon Entropy, Speech-Act Propositional Theory, Exponential Risk Decay), and 4-tier threat cascading engine.
3. **[`EXTENSION_SETUP.md`](file:///c:/ControlPlane/EXTENSION_SETUP.md)**: Step-by-step Chrome Extension (Manifest V3) installation, auto-enrollment tokens, network shield setup, and live testing guide.
4. **[`ArchitectureDoc.jsx`](file:///c:/ControlPlane/frontend/src/views/docs/ArchitectureDoc.jsx)**: In-app interactive documentation view displaying visual ASCII flowcharts, 5-phase scanning pipeline diagrams, and module mapping tables.

---

## 📂 Repository Directory & File Structure Tree

```text
ControlPlane/
├── backend/                             # Python 3.11+ FastAPI Server & Security Engine
│   ├── app/
│   │   ├── config/
│   │   │   └── threat_taxonomies.json   # Declarative taxonomy centroids & regulatory thresholds
│   │   ├── connector/                   # Sub-15ms Real-Time Guardrail Core
│   │   │   ├── evaluators/
│   │   │   │   ├── universal_vector_engine.py  # N-gram R^d vector space cosine similarity
│   │   │   │   ├── pii.py               # Luhn Mod-10 & Shannon Entropy secret detector
│   │   │   │   ├── grounding.py         # Speech-act claim extraction & RAG verification
│   │   │   │   ├── guardian.py          # 7 deterministic checks & SHA-256 hash chaining
│   │   │   │   ├── anti_evasion.py      # Unicode zero-width ('Cf','Cs') & homoglyph stripper
│   │   │   │   ├── injection.py         # 4-tier prompt defense & ChatML delimiter scanner
│   │   │   │   ├── safety_taxonomy.py   # Universal safety & harm taxonomy classifier
│   │   │   │   ├── multi_turn_risk.py   # Exponential risk decay session intelligence
│   │   │   │   └── bias_safety.py       # Algorithmic fairness & toxicity evaluator
│   │   │   └── guardrail.py             # Master Orchestrator computing P/C/R scores
│   │   ├── models/db/                   # Database Abstraction (SQLite / Neon PostgreSQL)
│   │   │   ├── connection.py            # Unified connection manager & auto-seeding
│   │   │   ├── interceptions.py         # Telemetry persistence & action analytics queries
│   │   │   ├── policies.py              # Policy retrieval, updates, and custom regex rules
│   │   │   └── reviews.py               # Human-in-the-Loop review queue & threshold auto-tuning
│   │   ├── red_team/                    # Automated Vulnerability Testing Engine
│   │   │   ├── runner.py                # Automated scan executor & probe dispatcher
│   │   │   ├── evaluator.py             # Defense status classifier & vulnerability scoring
│   │   │   └── datasets.py              # Attack probe suites (PII, Injections, Jailbreaks)
│   │   ├── routes/                      # REST API Endpoint Handlers
│   │   │   ├── scan.py                  # POST /scan/input and /scan/output routes
│   │   │   ├── findings.py              # Risk findings, analytics, and telemetry APIs
│   │   │   ├── tokens.py                # Auto-enrollment tokens and key validation
│   │   │   └── resources.py             # Monitored AI tool onboarding APIs
│   │   └── main.py                      # FastAPI application entry point & CORS middleware
│   └── tests/                           # Comprehensive Pytest Suite (134/134 Passing)
├── frontend/                            # React 18 + Vite 6 Modern SPA
│   ├── extension/                       # Manifest V3 Chrome Network Shield Extension
│   │   ├── manifest.json                # Extension manifest
│   │   ├── popup.html                   # Extension popup interface in dark terminal theme
│   │   ├── popup.js                     # Token auto-enrollment & server sync logic
│   │   └── content.js                   # Main-world fetch/XHR interceptor & monitoring banner
│   ├── src/                             # Views, Components, Contexts, and API client
│   └── tailwind.config.js               # Tailwind CSS design system configuration
├── README.md                            # Master repository guide, quick start & file tree
├── DESIGN.md                            # Comprehensive technical architecture document
├── EXTENSION_SETUP.md                   # Chrome Extension installation & auto-enrollment guide
├── requirements.txt                     # Python dependencies
└── docker-compose.yml                   # Container orchestration config
```

---

## 🌟 Comprehensive Feature Breakdown Across All Modules

ControlPlane AI provides a complete end-to-end Responsible AI governance lifecycle divided into 7 core operational modules:

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

### Module 1: AI Red Team Vulnerability Scanner (`RedTeamScannerView.jsx` & `backend/app/red_team/`)
- **Automated Probe Execution**: Dispatches pre-packaged attack probe suites against connected AI webhooks or ad-hoc API endpoints.
- **Preset Attack Suites**:
  1. *System Prompt Extraction Suite*: 6 specialized prompt injection attacks probing system instruction leaks.
  2. *PII & Secret Disclosure Suite*: 6 credential harvesting probes testing credit cards, API keys, and patient SSNs.
  3. *Jailbreak & Authority Bypass Suite*: Probes testing roleplay overrides, DAN jailbreaks, and compliance bypasses.
  4. *Custom Multi-Prompt Test List*: Supports multi-line custom prompt lists separated by blank lines or `---` delimiters.
- **Defense Status Evaluation**: Evaluates model responses into `DEFENDED` (threat intercepted/masked) or `VULNERABLE` (sensitive data leaked).
- **Executive PDF Audit Report Generator**: Exports instant compliance audit certificates using `jsPDF` and `jsPDF-AutoTable` with overall defense scores, vulnerability counts, and probe-by-probe breakdown.

### Module 2: Secure AI Agent Runtime Sandbox (`AgentRuntimeView.jsx` & `multi_turn_risk.py`)
- **Autonomous Tool Execution Safeguard**: Intercepts tool calls issued by AI agents (e.g. `delete_file`, `send_email`, `transfer_money`, `search_web`).
- **Action Risk Tiers**:
  - `LOW`: Read-only queries (`search_web`) $\rightarrow$ `ALLOW`
  - `MEDIUM`: Reversible communications (`send_email`) $\rightarrow$ `MONITOR`
  - `HIGH`: File/data deletions (`delete_file`, `delete_email`) $\rightarrow$ `CONFIRM_REQUIRED` (Human-in-the-Loop)
  - `CRITICAL`: Financial wire transfers or system modifications (`transfer_money`, `sudo rm -rf`) $\rightarrow$ `BLOCK`
- **Compound Action Sequence State Machine**: Detects multi-step exfiltration chains (e.g. `query_database` $\rightarrow$ `read_file` $\rightarrow$ `export_data` $\rightarrow$ `send_email`) to stop automated agent data exfiltration.

### Module 3: AI Security Guardrail Policies (`PoliciesView.jsx` & `threat_taxonomies.json`)
- **The 5 Canonical Regulatory Frameworks**:
  1. *Customer Support Policy (`pol_customer_support`)*: `MASK` mode for PII, emails, credit cards, and competitor steering.
  2. *Internal Employee Copilot (`pol_internal_copilot`)*: `MASK` + `AUDIT` mode for developer API keys, database connection URIs, and unreleased MNPI.
  3. *Healthcare HIPAA Policy (`pol_us_hipaa`)*: `BLOCK` mode for bulk patient chart dumps, pediatric opioid overdoses, and invasive DIY home surgery.
  4. *Autonomous Agent Runtime Policy (`pol_ai_agent`)*: `CONFIRM_REQUIRED` mode for high-risk tool calls and exfiltration chains.
  5. *Global GDPR Privacy Policy (`pol_eu_gdpr`)*: `REDACT` mode for IBANs, passports, homoglyphs, and zero-width evasion.
- **Custom User-Defined Policy Groups & Live Regex Tester**: Allows operators to define custom policy groups with live regex pattern testing, auto-redaction masks, and action selection (`MASK`, `BLOCK`, `CONFIRM_REQUIRED`).
- **Full Rule Edit & Pre-population**: Editing any custom policy automatically pre-fills all previously entered regex rules with instant pattern editing.

### Module 4: Hallucination & RAG Grounding Studio (`HallucinationView.jsx` & `grounding.py`)
- **Linguistic Speech-Act Propositional Theory**: Classifies model outputs into non-assertive conversational speech acts (offers of assistance, safety refusals) versus testable declarative claims.
- **Context-Faithfulness Evaluation**: Verifies testable claims against enterprise RAG reference documents without flagging non-assertive text as hallucinations.
- **Live Search Evidence Verification**: Integrates Google Serper API to perform real-time web verification for ungrounded claims.

### Module 5: Human-in-the-Loop (HITL) Review Queue (`ReviewQueueView.jsx` & `reviews.py`)
- **Real-Time Interception Lifecycle**: Manages `CONFIRM_REQUIRED` and `FLAGGED` events requiring human judgment.
- **Operator Review Actions**:
  - **Approve**: Confirms the guardrail decision as accurate.
  - **Reject / False Positive**: Overrides the decision and marks it as a false positive.
  - **Policy Override**: Customizes regulatory thresholds.
- **Closed-Loop Threshold Auto-Tuning**: Automatically adjusts similarity tolerances based on reviewer decisions to continuously lower false positive rates.

### Module 6: Enrollment Tokens & Network Shield (`TokensView.jsx` & `tokens.py`)
- **Activation Token Management**: Generates 48-day cryptographically secure enrollment tokens (`tp_tok_...`) for browser extension and server auto-enrollment.
- **Device Registration & Device ID Binding**: Binds enrolled browsers and API clients to specific tenant accounts.

### Module 7: Monitored AI Resources & Webhook Inventory (`InventoryView.jsx` & `resources.py`)
- **Resource Management**: Onboards and manages active AI chatbots, webhooks, and REST gateways under ControlPlane protection (e.g. Botpress Cloud, Enterprise Webhook Gateway, Extension Shield).
- **Health Checks & Validation**: Executes one-click webhook connectivity and validation checks.

---

## 🛠️ Quick Start & Local Installation

### Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: v18+ and `npm`
- **Docker** *(Optional)*: Docker Desktop / Docker Compose

### Option A: Local Python & Node Execution

```bash
# 1. Clone the repository
git clone https://github.com/Ankur377823/ControlPlane-AI.git
cd ControlPlane

# 2. Setup Python virtual environment & dependencies
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# 3. Start the FastAPI backend server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

In a second terminal window, build/serve the React frontend:

```bash
cd frontend
npm install
npm run dev
```

Open your browser to: **`http://localhost:8000/`** (or `http://localhost:5173/`).

### Option B: Docker Compose (One-Command Startup)

```bash
docker-compose up --build
```

---

## 🧪 Testing & Verification Suite

ControlPlane AI includes an extensive, automated test suite covering all 5 policy archetypes, information-theoretic parsers, vector cosine similarity calculations, and edge cases.

To execute the test suite locally:

```bash
pytest backend/tests -v
```

### Test Suite Summary (**134/134 Passing**):
- **`test_universal_vector_engine.py`**: Verifies zero-shot threat vector projections across all 5 enterprise policy archetypes (invasive home surgery, bulk PHI dumps, wire fraud, destructive agent commands, credential harvesting).
- **`test_grounding.py`**: Verifies speech-act claim extraction and non-assertive conversational grounding.
- **`test_pii.py`**: Verifies Luhn Mod-10 credit card validation and Shannon entropy secret detection.
- **`test_red_team_package.py`**: Verifies automated red-team attack probes and PDF report generation.

---

## 🔌 Chrome Extension Setup

To install and verify the Chrome Extension on ChatGPT, Claude, or Botpress, read the step-by-step guide in **[`EXTENSION_SETUP.md`](file:///c:/ControlPlane/EXTENSION_SETUP.md)**.

---

## 📄 License & Compliance

Licensed under the MIT License. Certified for SOC 2 Type II, US HIPAA, EU GDPR, and EU AI Act compliance architectures.
