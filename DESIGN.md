# DESIGN.md — ControlPlane AI Architecture & Technical Specification

## 1. Executive Overview

**ControlPlane AI** is an enterprise-grade Responsible AI (RAI) Governance Control Plane, real-time guardrail shield, and telemetry monitoring studio. It provides a uniform interface to evaluate, audit, and intercept AI chatbot agents (such as Botpress Cloud Webhooks, OpenAI GPT-4o, Claude 3.5, Gemini, DeepSeek) and autonomous LLM tool chains without exposing platform-specific details to user-facing clients.

ControlPlane AI isolates platform-specific complexity behind clean, modular layers:
1. `validate_target()`: Validates webhook target connectivity.
2. `execute_test()`: Runs adversarial scans and extracts chatbot text responses.
3. `reset_conversation()`: Ensures scan prompt isolation by resetting conversation context.
4. `get_platform_metadata()`: Exposes platform capabilities, delivery mode, and metadata.
5. `evaluate_grounding()`: Context-faithfulness verification against enterprise RAG reference documents.
6. `update_multi_turn_risk()`: Session-level cumulative risk tracking across conversation trajectories.
7. `process_review_decision()`: Human-in-the-Loop review and feedback auto-tuning engine.

---

## 2. System Architecture & Component Interaction

```
┌──────────────────────────────────────┐    HTTP/JSON     ┌──────────────────────┐    imports     ┌────────────────────────┐
│  ControlPlane React Studio           │ ───────────────► │  FastAPI Backend API │ ─────────────► │  Responsible AI Engine │
│  (React 18 + Vite + Tailwind CSS)    │                  │  (app/main.py)       │                │  (guardrail.py)        │
│  ├─ Dual Theme (Light/Dark Mode)     │ ◄─────────────── │  routes/resources.py │ ◄───────────── │  ├─ pii.py             │
│  ├─ One-Click Policy Presets         │                  │  routes/findings.py  │    dict        │  ├─ injection.py       │
│  ├─ Dedicated Policy Detail Views    │                  │  models/db/          │                │  ├─ grounding.py       │
│  ├─ HITL Review Queue & Feedback     │                  │  (SQLite/PostgreSQL) │                │  ├─ multi_turn_risk.py │
│  └─ Trustworthiness & Fatigue Gauges │                  └──────────────────────┘                │  ├─ ai_judge.py        │
└──────────────────────────────────────┘                                                          │  └─ action_risk.py     │
                                                                                                  └────────────────────────┘
```

---

## 3. Real-Time Guardrail Pipeline & Evaluator Engine

The master evaluator orchestrator ([`guardrail.py`](file:///c:/ControlPlane/backend/app/connector/guardrail.py)) executes in **sub-15ms** via a tiered architecture:

### 1. Deterministic Fast-Path Layer (<15ms)
* **PII & Secrets Redactor ([`pii.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/pii.py))**:
  * Scans for SSNs, credit cards (Luhn validated), IBANs, phone numbers, emails, JWT tokens, OpenAI/GitHub/AWS API keys, and database connection URIs.
  * Replaces tokens with structured tags: `[REDACTED_CREDIT_CARD]`, `[REDACTED_API_KEY]`, `[REDACTED_EMAIL]`.
* **3-Tier Prompt Injection Detector ([`injection.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/injection.py))**:
  * **L1 Regex Shield**: Direct instruction resets, system prompt extraction, delimiter hijacking (`[SYSTEM]`, `<override>`).
  * **L2 Heuristic Indicator Engine**: Typo-tolerant keyword scoring across bypass terms, target secrets, and role shifts.
  * **L3 Semantic LLM Judge**: Calibrated fallback for ambiguous borderline phrasing.
* **Zero-LLM Guardian ([`guardian.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/guardian.py))**:
  * 7 deterministic checks: Tool ACL verification, revocation tokens, path traversal (`../etc/passwd`), shell injection (`sudo rm -rf`, `chmod 777`), and SQL drop statements.

### 2. Evidence-Backed RAG Grounding ([`grounding.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/grounding.py))
* **Atomic Claim Extraction**: Splits complex model responses into testable factual propositions.
* **Context-Faithfulness Scoring**:
  $$\text{Grounding Score} = \frac{\sum_{i=1}^{N} \text{Supported}(\text{Claim}_i)}{N}$$
* **Live Search Evidence**: When context docs are absent, queries the Google Serper API for real-time web citations.

### 3. Multi-Turn Session Risk Accumulator ([`multi_turn_risk.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/multi_turn_risk.py))
* Prevents salami-slicing attacks across extended sessions using an exponential decay model:
  $$A_t = 0.85 \times A_{t-1} + 0.5 \times R_t$$
  * Where $A_t$ is cumulative session risk score, and $R_t$ is individual turn risk.
  * When $A_t \ge 75.0$, the session escalates automatically to `BLOCK` or `CONFIRM_REQUIRED`.

### 4. Compound Agent Action Sequences ([`action_risk.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/action_risk.py))
* Classifies tool invocations into 4 Risk Tiers: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
* Evaluates trajectory state transitions:
  $$\text{Data Read Tool} \longrightarrow \text{External Data Exfiltration Tool} \implies \text{Action: CONFIRM\_REQUIRED / BLOCK}$$

---

## 4. Regulatory Framework Presets & Smart Hybrid Governance

| Preset ID | Preset Name | Enforcement Mode | PII Sensitivity | Factuality Threshold | Primary Target Threats |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `UNIFIED_ENTERPRISE_ALL` | **All-in-One Master Shield** | `MASK` (Smart Hybrid) | `CRITICAL` | `0.85` | Auto-mask PII + Hard-block Injections + HITL Wire Transfers |
| `EU_AI_ACT` | **EU AI Act High-Risk Tier** | `BLOCK` | `CRITICAL` | `0.80` | System Prompt Leaks, Jailbreaks, Human Review < 0.85 |
| `US_HIPAA` | **US HIPAA Safe Harbor** | `BLOCK` | `CRITICAL` | `0.85` | 18-PHI Identifiers, Patient Record Leaks, Clinical Drift |
| `EU_GDPR` | **EU GDPR Strict Privacy** | `MASK` | `CRITICAL` | `0.70` | Token Redaction, Credit Cards, PII Harvesting, Audit Trails |
| `FIN_ADVISORY` | **SEC Reg SCI Advisory** | `BLOCK` | `HIGH` | `0.85` | Fabricated Financial Numerics, Exfiltration, Wire Transfers |
| `BALANCED_COPILOT` | **Internal Copilot** | `MASK` | `MEDIUM` | `0.50` | Developer API Keys, Shell Commands, High Throughput (4096 tok) |

---

## 5. Human-in-the-Loop (HITL) Feedback & Trustworthiness Index

The governance feedback loop balances safety against **alert fatigue**:

```
┌────────────────────────────┐      Reviewer Action      ┌────────────────────────────┐
│ Interception Event Logged  │ ────────────────────────► │ HITL Review Queue          │
│ (Score < Threshold)        │                           │ • Approve (True Positive)  │
└────────────────────────────┘                           │ • Reject (False Positive)  │
                                                         │ • Policy Override          │
                                                         └─────────────┬──────────────┘
                                                                       │
                                                                       ▼
┌────────────────────────────┐    Re-calculate Metrics   ┌────────────────────────────┐
│ Policy Threshold Auto-Tune │ ◄──────────────────────── │ Trustworthiness Engine     │
│ (Tighten / Relax bounds)   │                           │ • Trust Index (97.2%)      │
└────────────────────────────┘                           │ • False Positive Rate (FPR)│
                                                         │ • False Negative Rate(FNR) │
                                                         └────────────────────────────┘
```

### Trustworthiness Index Mathematical Formulation:
$$\text{Trust Index} = 100 \times \left(1.0 - \left(0.6 \times \text{FPR} + 0.4 \times \text{FNR}\right)\right)$$
$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}, \quad \text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$

---

## 6. Cryptographic Audit Integrity (SHA-256 Hash Chaining)

Every intercepted prompt, sanitized transformation, and model decision is logged with a tamper-evident cryptographic hash chain in [`guardian.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/guardian.py):

$$H_n = \text{SHA256}(H_{n-1} \,\|\, \text{Timestamp} \,\|\, \text{UserPrompt} \,\|\, \text{Action} \,\|\, \text{RiskFindings})$$

Auditors can verify that historical logs have not been altered or purged by validating the hash sequence.

---

## 7. Docker Architecture & Live File Watch

ControlPlane AI's [`docker-compose.yml`](file:///c:/ControlPlane/docker-compose.yml) employs Compose File Watch:

```yaml
develop:
  watch:
    - action: sync
      path: ./backend
      target: /app/backend
    - action: sync
      path: ./frontend
      target: /app/frontend
    - action: rebuild
      path: ./requirements.txt
    - action: rebuild
      path: ./Dockerfile
```

Running `docker compose up --build --watch` provides zero-downtime hot-reloading across both backend Python APIs and frontend React components.
