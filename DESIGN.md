# DESIGN.md — ControlPlane AI Architecture & Technical Specification

## 1. Executive Overview

**ControlPlane AI** is an enterprise AI security control plane, real-time guardrail shield, and telemetry monitoring platform. It provides a uniform interface to interact with, evaluate, and audit AI chatbot agents (such as Botpress Cloud Webhooks) without exposing low-level vendor API details to the frontend UI or report generator.

The **Botpress Connector** isolates platform-specific complexity behind a clean, four-method interface:
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
│   JS Modules)   │                  │  models/db.py        │    dict        │     (HTTP Client)      │
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

ControlPlane AI abstracts database operations inside [backend/app/models/db.py](file:///c:/ControlPlane/backend/app/models/db.py) to support dual database execution environments:

### 1. Storage Drivers & Configuration
- **SQLite Mode (Default Local)**:
  - Triggered when `DATABASE_URL` is unset.
  - Path: `BOTPRESS_CONNECTOR_DB` (defaults to `botpress_connector.db`).
  - Employs SQLite WAL mode for fast connection concurrency.
- **PostgreSQL Mode (Cloud Production)**:
  - Triggered when `DATABASE_URL` is supplied (e.g. **Neon Cloud PostgreSQL**).
  - Drivers: `psycopg2-binary` / `pg8000`.
  - Enables 24/7 cloud persistence, connection pooling, and multi-tenant scaling.

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

### 3. Automated Migration & Sanitation Pipeline
The `_migrate_db(conn)` pipeline executes upon backend boot (`init_db()`):
- Dynamically checks and alters missing columns across tables.
- Automatically cleanses legacy session ID formats (converting legacy strings to `sess_botpress_...`).
- Seeds initial admin accounts (`ankur@acme.com`), policies (`pol_customer_support`), and demo resources.

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
- **Secret Redaction**: Webhook IDs are stored safely and redacted in API responses (`redact_webhook_id`: first 4 + `...` + last 4 characters).
- **SSRF Prevention**: Webhook IDs are appended strictly as path components to the hardcoded domain `https://chat.botpress.cloud/`.
- **Session Security**: Supports both `sessionStorage` and `localStorage` with a **"Remember Me"** toggle to prevent unauthorized session persistence across browser restarts.

---

## 5. Guardrail Evaluation & Policy Engine

When a prompt is evaluated via `POST /api/v1/resources/{id}/check`:

1. **Rule Processing**: Evaluates input against active guardrail policies (`PII_SSN_REDACT`, `PII_EMAIL_MASK`, `PROMPT_INJECTION_SHIELD`, `SECRET_KEY_RULE`).
2. **Action Determination**:
   - `BLOCK`: Halts harmful prompts (e.g. database password extraction, system prompt overrides).
   - `MASK` / `REDACT`: Sanitizes sensitive PII replacing them with `[REDACTED_*]` tokens.
   - `MONITOR`: Allows prompts while recording audit telemetry.
   - `ALLOW`: Passes clean queries with sub-15ms latency.
3. **Governance Scoring**: Calculates Performance (P), Cost ($), and Responsibility (R) metrics.
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
- **Unit Tests (`tests/test_scanner.py` & `test_guardrail.py`)**: Tests `BotpressScanner`, text extraction, error sanitization, and policy scoring.
- **API & Integration Tests (`tests/test_api.py` & `test_full_suite.py`)**: End-to-end REST API verification using FastAPI `TestClient` and mock Botpress server endpoints (`mock_botpress.py`).
- **Pass Criteria**: `45 passed` in `pytest`.
