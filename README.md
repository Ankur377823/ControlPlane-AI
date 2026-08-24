# ControlPlane AI — Responsible AI Control Plane & Governance Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Cloud-336791.svg)](https://neon.tech/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Pytest-75%2F75%20Passed-emerald.svg)](#-testing--verification)

**ControlPlane AI** is an enterprise-grade **Responsible AI (RAI) Governance Control Plane** and real-time guardrail platform designed to safeguard, monitor, audit, and auto-tune AI assistants, chatbots, and autonomous agents across diverse organizational use cases.

---

## 🌟 Executive Summary & Round 2 Capabilities

ControlPlane AI bridges the critical gap between raw AI safety/guardrails and comprehensive Responsible AI governance:

1. **Use-Case & Resource Risk Profiles**: Adaptive policies for **Customer Support** (latency-prioritized), **Internal Copilot** (credential protection), **Decision Support** (strict grounding & bias verification), and **Autonomous Agents** (compound trajectory safety).
2. **Evidence-Backed Grounding & Factuality**: Claim extraction paired with RAG context-faithfulness scoring and live web search verification (Serper API fallback).
3. **Human-in-the-Loop (HITL) Review Queue**: Real-time review lifecycle for `CONFIRM_REQUIRED` and `FLAGGED` events with Approve, Reject, and Policy Override actions.
4. **Self-Tuning Feedback Loop & Trustworthiness Index**: Tracks True/False Positive rates, Precision, Recall, and auto-tunes policy thresholds upon reviewer feedback.
5. **Cumulative Multi-Turn Session Risk**: Time-decayed rolling risk accumulator to detect conversational drift, salami slicing, and gradual probing.
6. **Compound Agent-Action Sequence Risk**: State-machine tracking sequential tool calls (e.g. `query_database` $\rightarrow$ `read_file` $\rightarrow$ `export_data` $\rightarrow$ `send_email`) to stop data exfiltration chains.
7. **AI-as-a-Judge Tiered Fallback**: Invokes secondary semantic evaluation *only* when deterministic confidence is borderline ($0.40 \le \text{Risk} \le 0.70$), preserving sub-15ms latency for normal traffic.
8. **Tamper-Evident SHA-256 Hash Chain Audit**: Cryptographic proof of event integrity across all interceptions.

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

## 📂 Directory Layout

```
ControlPlane/
├── backend/
│   ├── app/
│   │   ├── connector/             # Connectors & evaluators
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
│       ├── test_action_risk.py
│       ├── test_ai_judge.py
│       ├── test_api.py
│       ├── test_compound_action.py
│       ├── test_full_suite.py
│       ├── test_grounding.py
│       ├── test_guardian.py
│       ├── test_guardrail.py
│       ├── test_hallucination.py
│       ├── test_multi_turn_risk.py
│       ├── test_review_queue.py
│       ├── test_round2_features.py
│       └── test_scanner.py
├── frontend/                      # Web Workspace & Chrome Extension
│   ├── css/                       # Modular Design Tokens & Responsive Layouts
│   ├── js/                        # ES6 Modules (API, Router, Views)
│   │   └── views/
│   │       ├── dashboardView.js   # Trustworthiness Index & Executive KPIs
│   │       ├── eventOverviewView.js # Deep-Dive Telemetry & HITL Review Actions
│   │       ├── findingsView.js    # Live Risk Findings Grid
│   │       ├── hallucinationsView.js # Claim-level Grounding Inspector
│   │       └── policiesView.js    # Policy Profile Manager
│   ├── extension/                 # Chrome Network Shield Extension
│   └── index.html                 # Single Page Application
└── Dockerfile                     # Production container spec
```

---

## ⚡ Quick Start

### 1. Run Locally
```bash
# Clone & install dependencies
pip install -r requirements.txt

# Start backend dev server
uvicorn backend.app.main:app --reload --port 8000
```
Open **`http://localhost:8000`** in your browser. Default Admin credentials: `ankur` / `password123`.

### 2. Run with Docker
```bash
docker-compose up --build
```

---

## 🧪 Testing & Verification

Run the full automated test suite covering all 11 Responsible AI capability modules:

```bash
pytest backend/tests -v
```

```
======================= 75 passed, 8 warnings in 5.90s =======================
```

---

## 🔒 Security & Compliance Standards

- **Sub-15ms Latency**: Deterministic fast-path regex checks guarantee near-zero overhead on production channels.
- **Audit Integrity**: Every decision produces a SHA-256 hash chained to the previous record for tamper-evident provenance.
- **Multi-Tenancy**: Isolated workspaces and scoped API tokens (`tp_live_...`) ensure tenant separation across enterprises.
- **Adaptive Governance**: Self-tuning algorithms dynamically adjust detector thresholds based on human reviewer feedback.
