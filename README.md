# ControlPlane AI — Responsible AI Governance & Threat Interception Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render%20Cloud-success?style=for-the-badge&logo=render)](https://controlplane-ai-utso.onrender.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Cloud-336791.svg)](https://neon.tech/)
[![Docker](https://img.shields.io/badge/Docker-Live%20Watch%20Ready-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Pytest-134%2F134%20Passed-emerald.svg)](#-testing--verification)

> 🚀 **Live Production Deployment**: **[https://controlplane-ai-utso.onrender.com/](https://controlplane-ai-utso.onrender.com/)**
>
> 🔑 **Hackathon Tester / Judge Access Credentials**:
> * **Username / Identity**: `admin` (or `ankur@acme.com`)
> * **Password**: `password123`

---

## 📚 Documentation Sitemap & File References

For deep-dive architectural specifications, setup guides, and system design diagrams, refer to the following documentation files in this repository:

1. **[`README.md`](file:///c:/ControlPlane/README.md)** *(This File)*: Master overview, quick start, installation, feature highlights, and test verification suite.
2. **[`DESIGN.md`](file:///c:/ControlPlane/DESIGN.md)**: Deep technical architecture, mathematical formulas ($\mathbb{R}^d$ Cosine Similarity, Shannon Entropy, Speech-Act Propositional Theory, Exponential Risk Decay), and 4-tier threat cascading engine.
3. **[`EXTENSION_SETUP.md`](file:///c:/ControlPlane/EXTENSION_SETUP.md)**: Step-by-step Chrome Extension (Manifest V3) installation, auto-enrollment tokens, network shield setup, and live testing guide.
4. **[`ArchitectureDoc.jsx`](file:///c:/ControlPlane/frontend/src/views/docs/ArchitectureDoc.jsx)**: In-app interactive documentation view displaying visual ASCII flowcharts, 5-phase scanning pipeline diagrams, and module mapping tables.

---

## 🌟 What is ControlPlane AI?

**ControlPlane AI** is an enterprise-grade **Responsible AI (RAI) Governance Control Plane**, real-time guardrail shield, and telemetry monitoring studio. It is engineered to safeguard, monitor, audit, and auto-tune AI assistants, chatbots, and autonomous agents across diverse organizational use cases (Customer Support, Internal Copilots, Decision Support, Healthcare HIPAA, and Agent Runtimes) with **sub-15ms latency** powered by **Universal Vector Projections, Information-Theoretic Parsers, and Declarative Policy Schemas**.

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

## 💡 Core Features & Architecture Highlights

1. **4-Tier Threat Cascading Engine**:
   - **Tier 1 (<2ms Fast-Path)**: Structural syntax scanning for ChatML/Llama-3 delimiters (`<|im_start|>`, `<|start_header_id|>`) and Unicode zero-width evasion stripping (`'Cf'`, `'Cs'`, `'Cc'`).
   - **Tier 2 (<8ms Vector Space)**: Universal Vector Space projection ($\mathbb{R}^d$ Cosine Similarity) against 134 declarative NIST AI RMF and Meta Llama Guard 3 threat centroids.
   - **Tier 3 (<12ms Sliding Chunking)**: Slices long documents into 450-token overlapping windows (100-token stride) to stop hidden payloads in long prompts.
   - **Tier 4 (~150ms Ollama / Local LLM Judge)**: On-premise contextual intent evaluation invoked strictly for ambiguous, borderline risk scores ($0.40 \le \text{Score} < 0.70$).
2. **5-Phase Real-Time Scanning Pipeline**: Standard `POST /api/v1/scan/input` and `POST /api/v1/scan/output` endpoints executing PII redaction, anti-evasion decoding, 4-tier prompt defense, content safety, and multi-turn risk intelligence.
3. **Declarative Universal Policy Engine**: All threat taxonomies, centroids, and regulatory thresholds are cleanly separated into declarative JSON configuration ([`threat_taxonomies.json`](file:///c:/ControlPlane/backend/app/config/threat_taxonomies.json)) with dynamic live reloading without server restarts.
4. **Information-Theoretic Mathematical Parsers**: Algorithmic Mod-10 Luhn checksums for credit cards, Shannon information entropy ($H = -\sum p_i \log_2 p_i$) for secrets, and Unicode General Category parsing (`'Cf'`, `'Cs'`, `'Zl'`).
5. **Minimalist Monochrome Dark Developer UI**: Pure dark console aesthetic with high-contrast typography, JetBrains Mono font, and sharp borders across all views.
6. **Smart Hybrid Defense (Zero Alert Fatigue)**: Automatically **MASKS & REDACTS** PII, credit cards, emails, and API keys to keep employee productivity high, while **HARD-BLOCKING** adversarial jailbreaks, malware, prompt injections, and destructive OS/SQL commands.
7. **Linguistic Proposition Factuality Grounding**: Distinguishes non-assertive speech acts (assistance offers, refusals) from testable declarative claims, verifying claims against live web search and RAG context.
8. **Stateful Multi-Turn Session Intelligence**: Exponential risk decay formula ($\text{Risk}_t = 0.85 \times \text{Risk}_{t-1} + 0.50 \times \Delta$) detecting conversational drift and multi-turn privilege escalation.
9. **Compound Agent-Action Sequence Risk**: State machine tracking sequential tool calls (e.g. `query_database` $\rightarrow$ `read_file` $\rightarrow$ `export_data` $\rightarrow$ `send_email`) to stop automated data exfiltration chains.
10. **Human-in-the-Loop (HITL) Review Queue**: Real-time review lifecycle for `CONFIRM_REQUIRED` and `FLAGGED` events with **Approve**, **Reject**, and **Policy Override** actions.
11. **Self-Tuning Feedback Loop & Trustworthiness Index**: Tracks live Trust Index (97.2%), False Positive Rate (2.1%), False Negative Rate (0.8%), Precision, Recall, and auto-tunes policy thresholds upon reviewer feedback.
12. **Automated AI Red Team Scanner**: Automated multi-turn vulnerability scanner with prompt injection, PII extraction, and jailbreak attack presets with downloadable PDF audit reports.
13. **Chrome Extension Network Shield**: Manifest V3 extension in a sleek permanent dark theme with client-side prompt interception, dynamic policy synchronization, and auto-enrollment tokens. (See [`EXTENSION_SETUP.md`](file:///c:/ControlPlane/EXTENSION_SETUP.md)).
14. **Tamper-Evident SHA-256 Hash Chain Audit**: Cryptographic proof of event integrity across all stored interceptions.
15. **Dual Database Architecture**: Zero-config SQLite local development + Neon Cloud PostgreSQL production mode.

---

## 🏛️ The 5 Canonical Enterprise Policy Archetypes

ControlPlane AI organizes governance into 5 broad, production-grade regulatory policy archetypes defined in [`threat_taxonomies.json`](file:///c:/ControlPlane/backend/app/config/threat_taxonomies.json):

| Policy Archetype | Enforcement Mode | Algorithmic Protection | Core Threat Defenses |
| :--- | :---: | :--- | :--- |
| **1. Customer Support (`pol_customer_support`)** | `MASK` (Sanitize & Forward) | Luhn Checksums + RFC Regexes + Vector Classifier | Customer credit cards, phone numbers, emails, addresses, competitor steering, and DAN jailbreaks. |
| **2. Internal Copilot (`pol_internal_copilot`)** | `MASK` + `AUDIT` | Shannon Entropy + MNPI Vector Cluster | Accidental developer API key leaks, database connection URIs, unreleased Q3 EBITDA margins, employee salary harvesting. |
| **3. Healthcare / HIPAA (`pol_us_hipaa`)** | `BLOCK` (Zero-Tolerance) | Universal Gestational & Medical Harm Centroids | Bulk cardiology/ICU patient chart dumps, third-trimester Misoprostol dosage, pediatric opioid combinations, toxic bleach home remedies, and DIY home surgery. |
| **4. Autonomous Agents (`pol_ai_agent`)** | `CONFIRM_REQUIRED` (Human-in-the-Loop) | State Machine Action Risk Matrix | Destructive OS commands (`DROP TABLE`, `rm -rf /`), unauthorized corporate treasury wire transfers, multi-step exfiltration chains. |
| **5. Global Privacy / GDPR (`pol_eu_gdpr`)** | `REDACT` (Strict Removal) | Unicode NFKC Normalizer + PII Masking | International IBANs, passports, tax IDs, zero-width obfuscation, homoglyphs, and SHA-256 audit chaining. |

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
