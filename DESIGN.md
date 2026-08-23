# DESIGN.md — ControlPlane AI Architecture & Technical Specification

## 1. Executive Overview

**ControlPlane AI** is an enterprise AI security control plane, real-time guardrail shield, and telemetry monitoring platform. It provides a uniform interface to evaluate, audit, and intercept AI chatbot agents (such as Botpress Cloud Webhooks) and autonomous LLM tool use (such as LegionForge agent calls) without exposing platform-specific details to user-facing clients.

The **Botpress Connector** isolates platform-specific complexity behind a clean, modular interface:
1. `validate_target()`: Validates webhook target connectivity.
2. `execute_test()`: Runs adversarial scans and extracts chatbot text responses.
3. `reset_conversation()`: Ensures scan prompt isolation by resetting conversation context.
4. `get_platform_metadata()`: Exposes platform capabilities, delivery mode, and metadata.

---

## 2. System Architecture & Component Interaction

```
┌─────────────────┐    HTTP/JSON     ┌──────────────────────┐    imports     ┌────────────────────────┐
│  ControlPlane   │ ───────────────► │  FastAPI Backend API │ ─────────────► │  BotpressScanner       │
│  Frontend SPA   │                  │  (app/main.py)       │                │  (orchestration)       │
│  (index.html +  │ ◄─────────────── │  routes/resources.py │ ◄───────────── │  └─ BotpressChatClient │
│   JS Modules)   │                  │  models/db/          │    dict        │     (HTTP Client)      │
└─────────────────┘                  └──────────────────────┘                └───────────┬────────────┘
                                                                                         │ HTTPS
                                                                                         ▼
                                                                             ┌────────────────────────┐
                                                                             │ Botpress Chat API      │
                                                                             │ chat.botpress.cloud/   │
                                                                             └────────────────────────┘
```

---

## 3. Database Specifications & Dual Persistence Architecture

ControlPlane AI abstracts database operations inside the [backend/app/models/db/](file:///c:/ControlPlane/backend/app/models/db/) package directory (modularized into connection, users, resources, policies, scans, interceptions, and tokens sub-modules) to support dual database execution environments:

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
                                 │                  │ tenant_id       │
                                 ▼                  └─────────────────┘
                         ┌────────────────┐
                         │    policies    │
                         ├────────────────┤
                         │ id (PK)        │
                         │ name           │
                         │ use_case_type  │
                         │ enforcement    │
                         └────────────────┘
```

### 3. Package File Split & Individual Responsibilities
* [`connection.py`](file:///c:/ControlPlane/backend/app/models/db/connection.py): Holds SQLite/Postgres selection parameters, transaction decorator (`get_conn`), migrations run, and initial database setup seeds.
* [`users.py`](file:///c:/ControlPlane/backend/app/models/db/users.py): User verification database listings, sign-ins, and registrations.
* [`resources.py`](file:///c:/ControlPlane/backend/app/models/db/resources.py): Monitored chatbot webhooks CRUD.
* [`policies.py`](file:///c:/ControlPlane/backend/app/models/db/policies.py): Policy guardrail configurations CRUD.
* [`scans.py`](file:///c:/ControlPlane/backend/app/models/db/scans.py): Audit scanner entries CRUD.
* [`interceptions.py`](file:///c:/ControlPlane/backend/app/models/db/interceptions.py): Telemetry interceptions logs and analytics summary metrics.
* [`tokens.py`](file:///c:/ControlPlane/backend/app/models/db/tokens.py): Activation tokens management CRUD.

---

## 4. Onboarding & Security Specification

### Onboarding Schema (`POST /api/v1/resources`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `account_name` | String | Yes | Workspace or organization grouping label |
| `resource_name` | String | Yes | Name of the Botpress Chatbot resource |
| `webhook_id` | String | Yes | Botpress Webhook Identifier |
| `use_case_type` | String | No | Security category (`customer_support`, `internal_copilot`, `decision_support`) |
| `ai_provider` | String | No | Default provider (`botpress`) |
| `reply_timeout_sec` | Integer | No (Default: 60) | Timeout waiting for bot response |
| `poll_interval_sec` | Integer | No (Default: 2) | Polling interval duration |

### Security Controls:
* **Secret Redaction**: Webhook IDs are stored safely and redacted in API responses (`redact_webhook_id`: first 4 + `...` + last 4 characters).
* **SSRF Prevention**: Webhook IDs are appended strictly as path components to the hardcoded domain `https://chat.botpress.cloud/`.
* **Session Security**: Supports both `sessionStorage` and `localStorage` with a **"Remember Me"** toggle to prevent unauthorized session persistence across browser restarts.

---

## 5. Guardrail Evaluation & Policy Engine

When a prompt is evaluated via `POST /api/v1/resources/{id}/check`:

1. **Rule Processing**: Evaluates input against active guardrail policies (`PII_SSN_REDACT`, `PII_EMAIL_MASK`, `PROMPT_INJECTION_SHIELD`, `SECRET_KEY_RULE`).
2. **Action Determination**:
   * `BLOCK`: Halts harmful prompts (e.g. database password extraction, system prompt overrides).
   * `MASK` / `REDACT`: Sanitizes sensitive PII replacing them with `[REDACTED_*]` tokens.
   * `MONITOR`: Allows prompts while recording audit telemetry.
   * `ALLOW`: Passes clean queries with sub-15ms latency.
3. **Governance Scoring**: Calculates Performance (P), Cost ($), and Responsibility (R) metrics:
   * **Performance Score (P)**: Evaluates prompt structure and factuality indicators.
   * **Cost Score ($)**: Monitors tokens count against maximum budget constraints.
   * **Responsibility Score (R)**: Aggregates toxicity, injection, and data disclosure ratings.
4. **Session Tracking**: Assigns a unique Session ID (`sess_botpress_...`) for multi-turn session auditability.

---

## 6. Error Handling Matrix

| Botpress HTTP Status | Internal Exception | User-Facing Sanitized Message |
|---|---|---|
| 400 | `BotpressError` | "The Botpress API rejected the request as malformed." |
| 401 / 403 | `BotpressAuthError` | "Authentication failed. Access to Botpress resource is forbidden." |
| 404 | `BotpressNotFoundError` | "Webhook ID not found. Verify the Chat integration is enabled." |
| 429 | `BotpressRateLimitError` | "Botpress rate limit or free-tier quota exceeded." |
| 5xx | `BotpressServerError` | "Botpress returned a server error. Platform temporarily unavailable." |
| Timeout | `BotpressTimeoutError` | "Timed out waiting for a response from Botpress." |
| Connection Error | `BotpressConnectionError` | "Could not connect to the Botpress Chat API." |

---

## 7. Testing & Verification

The codebase enforces 100% clean test coverage:
* **Unit Tests (`tests/test_scanner.py`, `test_guardrail.py` & `test_guardian.py`)**: Tests `BotpressScanner`, text extraction, error sanitization, policy scoring, 7 deterministic checks, and hash chaining.
* **API & Integration Tests (`tests/test_api.py` & `test_full_suite.py`)**: End-to-end REST API verification using FastAPI `TestClient` and mock Botpress server endpoints (`mock_botpress.py`).
* **Pass Criteria**: `59 passed` in `pytest`.

---

## 8. LegionForge Guardian 7-Check Engine & REST API Design

To protect autonomous LLM agents against prompt injection and unauthorized capability use, we run 7 deterministic, zero-LLM checks in a sequential pipeline before executing any tool call.

### Endpoints:
1. `POST /check`: Accepts `tool_id`, `action`, `args`, `agent_id`, `run_id`, `sequence_so_far`, and `tool_schema_hash`. Checks are executed in sequence, returning `allowed: false` at the first check failure.
2. `POST /report`: Asynchronously ingests security threat reports generated by LLM agent runtimes.
3. `GET /rules`: Exposes a read-only list of configured tool schemas, plays, and active capabilities.

### The 7 Checks in Order:
1. **Tool Schema Validation**: Verifies that arguments strictly conform to parameter JSON Schemas.
2. **Capability Check**: Asserts the active agent's role configuration permits executing the given tool name.
3. **Resource Bound Validation**: Confirms parameters do not violate filesystem boundaries or numeric allocations.
4. **Data Sanitization**: Automatically scrubs outbound queries for PII (SSNs, cards) before sending to external services.
5. **Playbook Alignment**: Checks current sequential actions flow against predefined playbooks state trees.
6. **Human-in-the-Loop Intercept**: Blocks execution on highly critical operations until approved by an administrator.
7. **Anomaly Detection**: Evaluates query volumes bounds to intercept loops and rate overflow.

---

## 9. Cryptographic Log Integrity (SHA-256 Hash Chain)

All telemetry interceptions are chained cryptographically to ensure audit records cannot be retroactively modified or deleted.

$$\text{Current Hash} = \text{SHA-256}(\text{Previous Hash} + \text{Interception Payload})$$

### Implementation Details:
* **Seed Value**: The genesis hash is `"GENESIS_HASH_00000000000000000000000000000000"` for the first entry.
* **Ordering Verification**: Hash chains are constructed dynamically by querying `ORDER BY rowid DESC LIMIT 1` from the database.
* **Tamper Evidence**: Any modification to a log entry causes a hash mismatch in all subsequent nodes, rendering the violation instantly evident.
