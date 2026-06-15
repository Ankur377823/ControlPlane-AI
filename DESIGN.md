# DESIGN.md — Botpress Chat API Connector

## 1. Problem statement

An AI security platform that performs red-team scanning needs a uniform way
to "talk to" a customer's AI agent regardless of which SaaS platform it runs
on (Botpress, Decagon, Microsoft Copilot Studio, Salesforce Agentforce, ...).
Each platform exposes a different API shape for creating conversations and
exchanging messages, with different auth models, rate limits, and reply
semantics (synchronous vs. asynchronous).

A **connector** isolates that platform-specific complexity behind a single,
small interface (`validate_target`, `execute_test`, `reset_conversation`,
`get_platform_metadata`). The scanning engine, the onboarding UI, the
scheduler, and the reporting layer never need to know they're talking to
Botpress specifically -- they call the same four methods for every
connector. This is what lets the platform add a new SaaS agent integration
without touching the core scanning pipeline, and lets each connector be
developed, tested, and hardened independently.

## 2. Architecture

```
┌────────────┐   HTTPS    ┌──────────────────┐   imports   ┌────────────────────┐
│  Frontend  │ ─────────▶ │  Backend API     │ ──────────▶ │  BotpressScanner    │
│ (index.html│            │  (FastAPI)       │             │  (orchestration)    │
│  + fetch)  │ ◀───────── │  routes/         │ ◀────────── │  └─ BotpressChat-   │
└────────────┘   JSON     │  resources.py    │   dict      │     Client (HTTP)   │
                           │  models/db.py    │             └─────────┬──────────┘
                           │  (SQLite)        │                       │ HTTPS
                           └──────────────────┘                       ▼
                                                          ┌──────────────────────────┐
                                                          │ Botpress Chat API         │
                                                          │ chat.botpress.cloud/{id}  │
                                                          └──────────────────────────┘
```

Layers, outside-in:

- **Frontend** (`frontend/index.html`): a single-page vanilla JS app. Talks
  only to the backend's REST API, never directly to Botpress (avoids
  exposing webhook IDs / keys to the browser and avoids CORS issues with
  `chat.botpress.cloud`).
- **Backend API** (`backend/app/main.py`, `routes/resources.py`): FastAPI
  app. Owns persistence (SQLite via `models/db.py`), request validation
  (Pydantic), and secret redaction. Translates REST requests into calls on
  a per-resource `BotpressScanner` instance.
- **Connector** (`backend/app/connector/`): the reusable, platform-specific
  piece.
  - `scanner.py` -- `BotpressScanner`: orchestration (conversation
    lifecycle, polling loop, error -> result mapping). This is the class
    that would be invoked by a real scanning worker.
  - `client.py` -- `BotpressChatClient`: thin HTTP wrapper around the
    Botpress Chat API. No business logic, no retries, no polling -- just
    request/response.
  - `config.py` -- typed config object (`BotpressTargetConfig`).
  - `errors.py` -- exception hierarchy + `sanitize_error` /
    `redact_webhook_id`.

The split between `scanner.py` and `client.py` is the key design decision
(Section 5 of the spec, "Separation of concerns"): `client.py` is mockable
at the HTTP boundary for integration tests, while `scanner.py` is mockable
at the *client* boundary for fast unit tests.

## 3. Onboarding model

Fields captured at onboarding (`POST /api/v1/resources`):

| Field | Required | Notes |
|---|---|---|
| `account_name` | yes | free-text grouping label, not validated against Botpress |
| `resource_name` | yes | free-text, surfaces in UI and scan reports |
| `webhook_id` | yes | the only field that talks to Botpress; **not** a free-form URL (see Security) |
| `encryption_key` | no | only meaningful if manual auth is enabled on the Chat integration |
| `user_id` | no | paired with `encryption_key` |
| `description` | no | free-text, surfaces in scan reports |
| `reply_timeout_sec` | no, default 60 | per-resource override |
| `poll_interval_sec` | no, default 2 | per-resource override |

Validation rules:

- `account_name`, `resource_name`, `webhook_id` must be non-empty strings
  (enforced by Pydantic `Field(..., min_length=1)`).
- `webhook_id` is stored and used **only** to build
  `https://chat.botpress.cloud/{webhook_id}` -- it is never interpolated
  into an arbitrary URL or used as a redirect target.
- No format validation is performed against `webhook_id` beyond
  non-emptiness; Botpress webhook IDs are UUID-like but this isn't enforced
  server-side, since `validate_target()` is the real check.

Secret storage:

- `encryption_key` is stored in SQLite alongside the rest of the resource
  row (`models/db.py`). For this demo, SQLite is unencrypted at rest --
  acceptable for a take-home, **not** for production (see Section 10).
- `to_public_dict()` is the *only* function allowed to produce a
  resource representation for the API/UI, and it omits `encryption_key`
  and `user_id` entirely, replacing `webhook_id` with a redacted form
  (`redact_webhook_id` / `_redact`: first 4 + `...` + last 4 chars).

## 4. Botpress integration deep-dive

### Connect -> converse -> receive reply

1. **Connect**: `POST /{webhook_id}/users` with an empty body returns a
   `user_key`, used as the `x-user-key` header on all subsequent calls.
   If manual auth (`encryption_key` + `user_id`) is configured, the
   connector attempts to derive the key locally instead of calling
   `/users` (see "Known limitations" -- this derivation is a documented
   best-effort placeholder).
2. **Create conversation**: `POST /{webhook_id}/conversations` (with
   `x-user-key`) returns `{"conversation": {"id": ...}}`.
3. **Send message**: `POST /{webhook_id}/messages` with
   `{"conversationId": "...", "payload": {"type": "text", "text": "<prompt>"}}`.
4. **Receive reply**: see below.

### SSE vs. polling -- decision

**Polling was implemented** (`_wait_for_bot_reply` in `scanner.py`), with
the SSE path documented but not implemented in this submission. Rationale:

- The spec's own constants (60s timeout, 2s poll interval) are framed
  around polling, and `delivery_mode` is already a first-class field in
  the result/metadata contract -- the API and UI do not need to change
  when SSE is added later.
- Polling requires no long-lived connections, which matters on free-tier
  PaaS hosts that often kill idle/streaming HTTP connections (Section 8 of
  the spec explicitly calls out free-tier hosting).
- Polling is trivially mockable with a plain request/response stub
  (`tests/mock_botpress.py`); SSE mocking requires a streaming test
  harness, which adds risk inside an 8-hour window.

**Production recommendation**: implement SSE
(`GET /{webhook_id}/conversations/{id}/listen`, `message_created` events)
as the primary path with polling as a fallback when the SSE connection
drops -- this is the "supports both with a config flag" bonus described in
the spec, and is the natural next increment given the current
`delivery_mode` field already exists.

### Text extraction

`client.extract_bot_text()` handles:

- `type: "text"` -> the text itself (required minimum).
- `type: "image" | "audio" | "video" | "file"` -> a placeholder string
  (`"[unsupported <type> message]"`) so a scan never silently records
  `None` for a real reply.
- `type: "carousel"` -> concatenated card titles.
- `type: "dropdown" | "choice"` -> the prompt text if present.
- Anything else -> `"[unsupported message type: <type>]"`.

`client.is_bot_message()` distinguishes the bot's reply from the
connector's own outgoing message using the `direction` field
(`"outgoing"` = bot), falling back to "no `userId`" if `direction` is
absent.

## 5. Session / conversation strategy

- **One conversation is reused across multiple `execute_test` calls** for
  a given `BotpressScanner` instance, by default.
- **Rotation** happens only when the caller explicitly requests it: the
  scan API's `reset_conversation: true` flag (default `true`) calls
  `scanner.reset_conversation()` before each prompt, which drops the
  cached `_conversation_id` so the next `_ensure_conversation()` call
  creates a brand-new conversation.
- **The user (`_user_key`) is never rotated** within a scanner instance --
  only the conversation. Creating a new "user" per prompt would burn
  free-tier quota for no isolation benefit, since Botpress conversation
  history (not user identity) is what could bias a bot's later replies.

**Impact on scan isolation**: with `reset_conversation=true` (the default),
each prompt in a scan is sent to a fresh conversation, so one adversarial
prompt cannot "set up" a later one via shared context -- each result is an
independent measurement. Setting it to `false` allows **multi-turn attack
sequences** (e.g. a priming prompt followed by an extraction prompt) to
share state, which is useful for more sophisticated red-team scripts but
makes individual results harder to interpret in isolation. The UI exposes
this as a single checkbox ("Start a fresh conversation for this test").

## 6. Error handling matrix

| Botpress HTTP status | Exception class | User-visible message |
|---|---|---|
| 400 | `BotpressError` | "The Botpress API rejected the request as malformed." |
| 401 | `BotpressAuthError` | "Authentication failed. Check the encryption key / user ID." |
| 403 | `BotpressAuthError` | "Access to this Botpress resource is forbidden." |
| 404 | `BotpressNotFoundError` | "Webhook ID not found. Verify the Chat integration is enabled and published." |
| 429 | `BotpressRateLimitError` | "Botpress rate limit or free-tier quota exceeded. Try again later." |
| 5xx | `BotpressServerError` | "Botpress returned a server error. The bot platform may be temporarily unavailable." |
| network timeout | `BotpressTimeoutError` | "Timed out waiting for a response from Botpress." |
| connection error | `BotpressConnectionError` | "Could not connect to the Botpress Chat API." |
| bot never replies (within `reply_timeout_sec`) | n/a (returned in result, not raised) | "Bot did not reply within the configured timeout." |

All of the above are produced by `errors.sanitize_error`, which never
echoes the original exception message, response body, or headers -- only
one of this fixed set of strings. `execute_test` catches every
`BotpressError` and `requests.exceptions.RequestException` and converts it
into `{"success": false, "error": "<one of the above>", ...}` rather than
letting anything propagate to the API layer as a 500 with a stack trace.
`validate_target` goes one step further and never raises at all -- it
returns `True`/`False`.

## 7. Security

- **Credential storage**: `encryption_key` / `user_id` are stored in
  SQLite as plain columns for this demo. `to_public_dict()` is the single
  chokepoint that strips them before any API response. See Section 10 for
  the production-grade approach (KMS-backed secret store, per-tenant
  encryption).
- **Log redaction**: `redact_webhook_id()` produces a `first4...last4`
  form used in all `metadata` returned from `execute_test` /
  `get_platform_metadata`, and would be the only form written to
  structured logs in production. `sanitize_error` guarantees no raw
  exception text (which could contain the full webhook URL, including the
  ID) reaches logs or the UI.
- **SSRF**: `webhook_id` is a path segment appended to a fixed,
  hardcoded base (`https://chat.botpress.cloud/`), never a user-supplied
  URL or hostname. This means onboarding cannot be used to make the
  backend issue requests to arbitrary internal/external hosts -- the only
  variable is a path component on a single allow-listed domain. The
  `base_url_override` field on `BotpressTargetConfig` exists *only* for
  tests (pointing at the in-process mock server) and must never be wired
  to user input in a production deployment.
- **Rate limits**: Botpress's free tier (~500 messages/month) is treated
  as an external constraint the connector must surface cleanly (429 ->
  `BotpressRateLimitError`), not retry aggressively. No automatic retry
  loop is implemented for 429s -- a production version would add bounded
  exponential backoff with jitter, plus per-resource rate accounting so
  the platform can warn customers before they exhaust quota.
- **Auth on this demo's API**: none (see `README.md` "Auth" section). All
  endpoints are open. CORS is wide-open (`allow_origins=["*"]`) to match.

## 8. Observability (production plan)

This demo logs only via uvicorn's default access logs. In production, each
connector call would emit structured (JSON) logs / metrics including:

- `resource_id`, `vulnerability_id`, `attack_id` (no raw `webhook_id` or
  secrets -- redacted form only)
- `execution_time_ms`, `delivery_mode`, `success`
- A counter of Botpress HTTP status codes by class (2xx/4xx/5xx) per
  resource, to detect a customer's integration breaking or quota
  exhaustion proactively
- A histogram of `execution_time_ms` to catch bots that are degrading
  (useful both operationally and as a security signal -- a sudden latency
  spike on a "jailbreak" prompt can itself be informative)
- Trace-level spans around `_ensure_user_key`, `_ensure_conversation`,
  `create_message`, and the poll loop, so a slow scan can be attributed to
  a specific Botpress call

## 9. Testing strategy

- **Unit tests** (`tests/test_scanner.py`): `BotpressScanner` +
  `BotpressChatClient` driven entirely by a `FakeSession` (no
  `requests`/network at all). Cover: `validate_target` success/404/500/
  timeout/idempotency, `execute_test` happy path and bot-timeout, secret
  non-leakage in errors, conversation reset producing a new conversation
  id, HTTP-status -> exception-class mapping, and `extract_bot_text` /
  `is_bot_message` for `text`, `image`, and `carousel` payloads.
- **Integration tests** (`tests/test_api.py`): the real FastAPI app +
  SQLite (per-test temp file), with the connector's HTTP client redirected
  to an in-process mock Botpress server (`tests/mock_botpress.py`) via
  Starlette's `TestClient` as the injected `session`. Covers onboarding +
  redaction, `/validate` success and 404 ("webhook not found"), `/scan`
  happy path including the **async reply** (the mock only returns the bot
  message after `REPLY_AFTER_POLLS` polls, exercising the real wait loop),
  a `429` rate-limit case, and a timeout case (`slow-webhook` never
  replies).
- **Mock server fidelity**: `mock_botpress.py` implements the same five
  endpoints the real client calls (`/hello`, `/users`, `/conversations`,
  `/messages` POST, and `/conversations/{id}/messages` GET) with the same
  response shapes assumed by `client.py`. If the real Botpress API differs
  from these assumptions, both the mock and the client would need updating
  together -- they are intentionally co-located in their assumptions.
- **Live smoke test** (manual, see README): onboard via the UI against a
  real Botpress bot, validate, run a sample scan, confirm a real reply
  appears. CI never requires Botpress credentials.

## 10. Production hardening (conceptual)

- **Feature-flag rollout**: wrap new connector behavior (e.g. SSE delivery)
  behind a per-resource or per-tenant flag so it can be rolled out
  gradually and rolled back without a deploy.
- **Backward compatibility**: the `execute_test` result shape (Section 5
  of the spec) is the contract the scanning engine and report generator
  depend on. Any new fields (e.g. a future `delivery_mode: "sse"`) must be
  additive; `metadata` is intentionally an open dict for this reason.
- **Multi-tenant**: today, one SQLite file holds all resources. A
  multi-tenant version would namespace by `tenant_id` on every table, move
  secrets to a dedicated secrets manager (e.g. KMS-encrypted columns or a
  vault), and run `BotpressScanner` instances inside a worker pool (e.g.
  Celery/RQ) rather than inline in the request/response cycle, so a slow
  bot reply doesn't tie up an API worker for up to 60 seconds.
- **Connection pooling**: `BotpressChatClient` currently creates a fresh
  `requests.Session()` per `BotpressScanner`; a production version would
  share a session (or async HTTP client) across scanner instances for
  connection reuse.

## 11. Known limitations

- **Manual auth (`encryption_key` + `user_id`) key derivation**
  (`client._derive_manual_user_key`) is a documented best-effort
  placeholder (HMAC-SHA256 of `user_id` with `encryption_key`). It was not
  independently verified against a live Botpress bot with manual auth
  enabled within the time available. If it doesn't match Botpress's actual
  scheme, the practical effect is that manual-auth resources behave like
  anonymous ones (the connector still functions, just without the
  persistent-identity benefit of manual auth).
- **Rich message types**: only `text`, and best-effort placeholders for
  `image`/`audio`/`video`/`file`/`carousel`/`dropdown`/`choice`, are
  parsed. Other Botpress payload types return a generic
  `"[unsupported message type: ...]"` string rather than `None`, but are
  not deeply parsed.
- **Free-tier message cap** (~500/month): the connector does not track
  remaining quota; it only reports `429` when Botpress itself returns one.
- **SSE not implemented** (see Section 4) -- polling only, with
  `delivery_mode` reserved for a future SSE path.
- **No automatic retries** on 429/5xx -- by design for this submission
  (to avoid burning quota during evaluation), but would be added with
  bounded backoff in production.
- **SQLite, unencrypted at rest** -- acceptable for this demo's
  single-evaluator use; not appropriate for storing real customer
  `encryption_key` values in production.
