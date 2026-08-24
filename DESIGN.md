# DESIGN.md — ControlPlane AI Architecture & Technical Specification

## 1. Executive Overview

**ControlPlane AI** is an enterprise Responsible AI (RAI) Governance Control Plane, real-time guardrail shield, and telemetry monitoring platform. It provides a uniform interface to evaluate, audit, and intercept AI chatbot agents (such as Botpress Cloud Webhooks, OpenAI GPT-4o, Claude 3.5, Gemini, DeepSeek) and autonomous LLM tool chains without exposing platform-specific details to user-facing clients.

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
┌─────────────────┐    HTTP/JSON     ┌──────────────────────┐    imports     ┌────────────────────────┐
│  ControlPlane   │ ───────────────► │  FastAPI Backend API │ ─────────────► │  Responsible AI Engine │
│  Frontend SPA   │                  │  (app/main.py)       │                │  (guardrail.py)        │
│  (index.html +  │ ◄─────────────── │  routes/resources.py │ ◄───────────── │  ├─ grounding.py       │
│   JS Modules)   │                  │  routes/findings.py  │    dict        │  ├─ multi_turn_risk.py │
└─────────────────┘                  │  models/db/          │                │  ├─ ai_judge.py        │
                                     └──────────────────────┘                │  └─ action_risk.py     │
                                                                             └────────────────────────┘
```

---

## 3. Database Specifications & Modular Persistence Architecture

ControlPlane AI abstracts database operations inside the [backend/app/models/db/](file:///c:/ControlPlane/backend/app/models/db/) package directory (modularized into connection, users, resources, policies, scans, interceptions, reviews, and tokens sub-modules) to support dual database execution environments:

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

### 3. Package File Split & Individual Responsibilities
* [`connection.py`](file:///c:/ControlPlane/backend/app/models/db/connection.py): Holds SQLite/Postgres selection parameters, transaction decorator (`get_conn`), migrations run, and initial database setup seeds.
* [`users.py`](file:///c:/ControlPlane/backend/app/models/db/users.py): User verification database listings, sign-ins, and registrations.
* [`resources.py`](file:///c:/ControlPlane/backend/app/models/db/resources.py): Monitored chatbot webhooks CRUD.
* [`policies.py`](file:///c:/ControlPlane/backend/app/models/db/policies.py): Policy guardrail configurations CRUD for Customer Support, Copilot, Decision Support, and Agents.
* [`reviews.py`](file:///c:/ControlPlane/backend/app/models/db/reviews.py): Dedicated Human-in-the-Loop review queue, decision overrides, and real-time Trustworthiness Analytics.
* [`scans.py`](file:///c:/ControlPlane/backend/app/models/db/scans.py): Audit scanner entries CRUD.
* [`interceptions.py`](file:///c:/ControlPlane/backend/app/models/db/interceptions.py): Telemetry interceptions logs and analytics summary metrics.
* [`tokens.py`](file:///c:/ControlPlane/backend/app/models/db/tokens.py): Activation tokens management CRUD.

---

## 4. Evaluators & Decision Pipeline

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

## 5. Botpress Connector & AI Red Team Scanner Architecture

The **Botpress Connector** ([`backend/app/connector/scanner.py`](file:///c:/ControlPlane/backend/app/connector/scanner.py)) isolates platform-specific Chat API complexities behind a clean interface:

### 1. Core Connector Contract:
* `validate_target()`: Probes `/hello` and conversation initialization. Returns boolean without surfacing raw network exceptions.
* `execute_test(vulnerability_id, attack_id, test_input)`: Sends adversarial probes, polls for bot replies, and packages execution time, status, and metadata.
* `reset_conversation()`: Establishes test isolation between attack runs to prevent conversational bias.
* `get_platform_metadata()`: Returns platform identity (`botpress`), delivery mode (`poll`), and redacted webhook identifier.

### 2. Error Sanitization Matrix:
| Botpress HTTP Status | Internal Connector Error | Sanitized User Message |
|---|---|---|
| 400 | `BotpressError` | "The Botpress API rejected the request as malformed." |
| 401 / 403 | `BotpressAuthError` | "Authentication failed. Access to Botpress resource is forbidden." |
| 404 | `BotpressNotFoundError` | "Webhook ID not found. Verify the Chat integration is enabled." |
| 429 | `BotpressRateLimitError` | "Botpress rate limit or free-tier quota exceeded." |
| 5xx | `BotpressServerError` | "Botpress returned a server error. Platform temporarily unavailable." |
| Timeout | `BotpressTimeoutError` | "Timed out waiting for a response from Botpress." |
| Connection Failure | `BotpressConnectionError` | "Could not connect to the Botpress Chat API." |

---

## 6. Cryptographic Log Integrity (SHA-256 Hash Chain)

All telemetry interceptions are chained cryptographically to ensure audit records cannot be retroactively modified or deleted.

$$\text{Current Hash} = \text{SHA-256}(\text{Previous Hash} + \text{Interception Payload})$$

### Implementation Details:
* **Seed Value**: The genesis hash is `"GENESIS_HASH_00000000000000000000000000000000"` for the first entry.
* **Ordering Verification**: Hash chains are constructed dynamically by querying `ORDER BY rowid DESC LIMIT 1` from the database.
* **Tamper Evidence**: Any modification to a log entry causes a hash mismatch in all subsequent nodes, rendering the violation instantly evident.

---

## 7. Testing & Verification

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

