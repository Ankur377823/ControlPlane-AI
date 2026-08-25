# DESIGN.md — ControlPlane AI Architecture & Technical Specification

## 1. Executive Overview

**ControlPlane AI** is an enterprise Responsible AI (RAI) Governance Control Plane, real-time guardrail shield, and telemetry monitoring studio. It provides a uniform interface to evaluate, audit, and intercept AI chatbot agents (such as Botpress Cloud Webhooks, OpenAI GPT-4o, Claude 3.5, Gemini, DeepSeek) and autonomous LLM tool chains without exposing platform-specific details to user-facing clients.

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
│  ├─ Dual Theme (Light/Dark Mode)     │ ◄─────────────── │  routes/resources.py │ ◄───────────── │  ├─ grounding.py       │
│  ├─ Auth & Toast Contexts            │                  │  routes/findings.py  │    dict        │  ├─ multi_turn_risk.py │
│  └─ Modular Views & Telemetry Modals │                  │  models/db/          │                │  ├─ ai_judge.py        │
└──────────────────────────────────────┘                  └──────────────────────┘                │  └─ action_risk.py     │
                                                                                                  └────────────────────────┘
```

---

## 3. Frontend Architecture (React + Vite + Tailwind CSS)

The user interface has been decomposed from a monolithic single-file layout into a modern componentized **React SPA**:

### Component Structure:
* **Context Layer**:
  * [`AuthContext.jsx`](file:///c:/ControlPlane/frontend/src/context/AuthContext.jsx): Session persistence, tenant switching, role enforcement (`ADMIN` / `USER`), and admin approvals.
  * [`ThemeContext.jsx`](file:///c:/ControlPlane/frontend/src/context/ThemeContext.jsx): Dual Light / Dark mode management with `localStorage` persistence and dynamic `<html>` class toggling.
  * [`ToastContext.jsx`](file:///c:/ControlPlane/frontend/src/context/ToastContext.jsx): Global floating notifications.
* **Layout & Shell**:
  * [`AppShell.jsx`](file:///c:/ControlPlane/frontend/src/components/layout/AppShell.jsx): Main layout frame.
  * [`Sidebar.jsx`](file:///c:/ControlPlane/frontend/src/components/layout/Sidebar.jsx): Multi-group navigation, active item highlight, and user profile switcher.
  * [`Header.jsx`](file:///c:/ControlPlane/frontend/src/components/layout/Header.jsx): Dynamic route breadcrumbs, live tenant switcher, and Theme Toggle button (☀️ / 🌙).
* **View Modules**:
  * `DashboardView.jsx`: High-level metrics, trust score, P/C/R gauges, velocity, and enforcement action breakdown.
  * `RiskFindingsView.jsx`: Real-time finding telemetry, search input, severity dropdown, and source filter tabs.
  * `EventOverviewView.jsx`: Interception details, raw/masked payload diffs, and Human-in-the-Loop review actions.
  * `InventoryView.jsx` & `OnboardResourceView.jsx`: AI chatbot resources directory and preset connector forms.
  * `AgentRuntimeView.jsx`: Autonomous agent action risk sandbox with Action Risk Tier evaluation.
  * `PoliciesView.jsx`: Security guardrail policy configurator with PII sensitivity, token limits, and GDPR/HIPAA presets.
  * `EnrollmentTokensView.jsx`: Extension activation tokens management and revocation.
  * `EndpointAIView.jsx`: Extension connection status and setup guide.
  * `RedTeamScannerView.jsx`: Adversarial vulnerability probes and PDF compliance report generation.
  * `HallucinationsView.jsx`: FacTool factuality verifier with sample presets.
  * `DocumentationView.jsx`: 14 interactive documentation chapters and REST API recipes.
* **Chrome Extension**:
  * Located in [`frontend/extension/`](file:///c:/ControlPlane/frontend/extension/) with a permanent sleek dark-mode popup and client-side prompt interception.

---

## 4. Database Specifications & Modular Persistence Architecture

ControlPlane AI abstracts database operations inside the [backend/app/models/db/](file:///c:/ControlPlane/backend/app/models/db/) package directory to support dual database execution environments:

### 1. Storage Drivers & Configuration
* **SQLite Mode (Default Local)**:
  * Triggered when `DATABASE_URL` is unset.
  * Path: `BOTPRESS_CONNECTOR_DB` (defaults to `botpress_connector.db`).
  * Employs SQLite WAL mode for fast connection concurrency.
* **PostgreSQL Mode (Cloud Production)**:
  * Triggered when `DATABASE_URL` is supplied (e.g. **Neon Cloud PostgreSQL**).
  * Drivers: `psycopg2-binary` / `pg8000`.
  * Enables 24/7 cloud persistence, connection pooling, and multi-tenant scaling.

### 2. Schema Specifications & Relations

```
┌──────────────┐         ┌────────────────┐         ┌─────────────────┐
│    users     │         │   resources    │         │  interceptions  │
├──────────────┤         ├────────────────┤         ├─────────────────┤
│ id (PK)      │         │ id (PK)        │         │ id (PK)         │
│ username     │         │ account_name   │         │ resource_id(FK) │
│ email        │         │ resource_name  │         │ timestamp       │
│ password_hash│         │ webhook_id     │         │ user_prompt     │
│ role         │         │ use_case_type  │         │ sanitized_prompt│
│ tenant_id    │         │ policy_id (FK) │         │ action          │
└──────────────┘         └───────┬────────┘         │ session_id      │
                                 │                  │ hash_chain      │
                                 ▼                  │ status          │
                         ┌────────────────┐         └────────┬────────┘
                         │    policies    │                  │
                         ├────────────────┤                  ▼
                         │ id (PK)        │         ┌─────────────────┐
                         │ name           │         │ review_decisions│
                         │ use_case_type  │         ├─────────────────┤
                         │ enforcement    │         │ id (PK)         │
                         │ pii_redaction  │         │ interception_id │
                         │ hallucination  │         │ reviewer_id     │
                         └────────────────┘         │ decision        │
                                                    │ reviewer_notes  │
                                                    └─────────────────┘
```

---

## 5. Evaluators & Decision Pipeline

The evaluator layer is organized in [backend/app/connector/evaluators/](file:///c:/ControlPlane/backend/app/connector/evaluators/):

1. **Fast Deterministic Security Checks** (Sub-15ms):
   * [`pii.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/pii.py): Regex matching and redaction for SSNs, credit cards, phones, and emails.
   * [`injection.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/injection.py): DAN overrides, system prompt extraction, and jailbreak detection.
   * [`bias_safety.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/bias_safety.py): Hate speech, toxicity, and discriminatory keyword filters.
   * [`cost.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/cost.py): Token budget limits and cost forecasting.
2. **Evidence & RAG Grounding**:
   * [`grounding.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/grounding.py): Atomic claim extraction and context-faithfulness verification against enterprise knowledge documents.
3. **Compound Agent-Action Risk**:
   * [`action_risk.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/action_risk.py): Action tier classification (LOW/MEDIUM/HIGH/CRITICAL) and tool sequence state-machine (e.g. data read $\rightarrow$ external exfiltration).
4. **Cumulative Multi-Turn Session Risk**:
   * [`multi_turn_risk.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/multi_turn_risk.py): Time-decayed rolling session score tracker for gradual probing and boundary drift.
5. **AI-as-a-Judge Tiered Fallback**:
   * [`ai_judge.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/ai_judge.py): Secondary model evaluation invoked *only* for ambiguous scores ($0.40 - 0.70$).
6. **Master Orchestrator**:
   * [`guardrail.py`](file:///c:/ControlPlane/backend/app/connector/guardrail.py): Combines all signals into unified Governance Scores (P, C, R) and outputs the action (`ALLOW`, `MASK`, `CONFIRM_REQUIRED`, `BLOCK`, `MONITOR`).

---

## 6. Botpress Connector & AI Red Team Scanner Architecture

The **Botpress Connector** ([`backend/app/connector/scanner.py`](file:///c:/ControlPlane/backend/app/connector/scanner.py)) isolates platform-specific Chat API complexities behind a clean interface:

### 1. Core Connector Contract:
* `validate_target()`: Probes connectivity and conversation initialization. Returns boolean without surfacing raw network exceptions.
* `execute_test(vulnerability_id, attack_id, test_input)`: Sends adversarial probes, polls for bot replies, and packages execution time, status, and metadata.
* `reset_conversation()`: Establishes test isolation between attack runs to prevent conversational bias.
* `get_platform_metadata()`: Returns platform identity (`botpress`), delivery mode (`poll`), and redacted webhook identifier.

---

## 7. Cryptographic Log Integrity (SHA-256 Hash Chain)

All telemetry interceptions are chained cryptographically to ensure audit records cannot be retroactively modified or deleted:

$$\text{Current Hash} = \text{SHA-256}(\text{Previous Hash} + \text{Interception Payload})$$

* **Seed Value**: The genesis hash is `"GENESIS_HASH_00000000000000000000000000000000"` for the first entry.
* **Tamper Evidence**: Any modification to a log entry causes a hash mismatch in all subsequent nodes, rendering the violation instantly evident.

---

## 8. Testing & Verification

The test suite in [backend/tests/](file:///c:/ControlPlane/backend/tests/) validates all system layers:
* `test_action_risk.py` & `test_compound_action.py`: Action tiers and compound sequence exfiltration triggers.
* `test_grounding.py` & `test_hallucination.py`: Claim extraction, RAG context-faithfulness, and Serper API search verification.
* `test_multi_turn_risk.py`: Cumulative risk decay and multi-turn escalation.
* `test_ai_judge.py`: Ambiguity band triggers and judge reasoning.
* `test_review_queue.py`: Human-in-the-Loop review lifecycle and Trustworthiness Analytics APIs.
* `test_guardian.py`: 7-check deterministic zero-LLM agent security layers.
* `test_guardrail.py`: Real-time guardrail orchestrator and enforcement modes.
* `test_full_suite.py` & `test_api.py`: Comprehensive end-to-end integration flows.
* `test_scanner.py`: Botpress scanner error mapping and rate limit handling.

**Pass Criteria**: `75 passed` in `pytest`.
