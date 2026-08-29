# DESIGN.md — ControlPlane AI Technical Architecture & Deep Specification

> 📍 **Cross-Reference Links**:
> * Master Project Overview: **[`README.md`](file:///c:/ControlPlane/README.md)**
> * Chrome Extension Setup: **[`EXTENSION_SETUP.md`](file:///c:/ControlPlane/EXTENSION_SETUP.md)**
> * Live Production Deployment: **[https://controlplane-ai-utso.onrender.com/](https://controlplane-ai-utso.onrender.com/)**

---

## 1. Executive System Architecture

**ControlPlane AI** is an enterprise-grade Responsible AI (RAI) Governance Control Plane, real-time guardrail shield, and telemetry monitoring studio. It provides a uniform interface to evaluate, audit, and intercept AI chatbot agents (such as OpenAI GPT-4o, Claude 3.5, Gemini, DeepSeek, Copilot) and autonomous LLM tool chains with **sub-15ms latency** and **zero brittle hardcoding**.

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

## 2. 4-Tier Threat Cascading Interception Hierarchy

ControlPlane AI implements a 4-tier filtering hierarchy that resolves 95% of traffic deterministically in $<10\text{ms}$ at $\$0.00$ compute cost, preserving local LLM inference only for ambiguous borderline cases:

1. **Tier 1: YARA & Structural Fast-Path (< 2ms)**:
   - Structural delimiters: ChatML (`<|im_start|>`, `<|im_end|>`) and Llama-3 headers (`<|start_header_id|>`).
   - Unicode Consortium zero-width evasion stripper: Code point categories (`'Cf'`, `'Cs'`, `'Zl'`, `'Cc'`).
   - Algorithmic Mod-10 Luhn checksum validator for credit cards.
   - Shannon Information Entropy scanner for secret API keys:
     $$H = -\sum_{i=1}^{k} p_i \log_2(p_i)$$
2. **Tier 2: Universal Vector Space Projection (< 8ms)**:
   - Dense subword $N$-gram character vectorizer ($N \in [3, 5]$).
   - Continuous Cosine Similarity Distance in $\mathbb{R}^d$:
     $$\text{Sim}(\mathbf{u}, \mathbf{C}) = \frac{\mathbf{u} \cdot \mathbf{C}}{\|\mathbf{u}\|_2 \|\mathbf{C}\|_2}$$
   - Dynamically evaluates input against 134 threat centroids loaded from [`threat_taxonomies.json`](file:///c:/ControlPlane/backend/app/config/threat_taxonomies.json).
3. **Tier 3: Sliding-Window Prompt Chunking (< 12ms)**:
   - Slices long documents into 450-token overlapping windows.
   - 100-token stride prevents "needle-in-a-haystack" payload obfuscation.
4. **Tier 4: Contextual LLM Judge (Ollama / Local LLM) (~150ms)**:
   - Invoked strictly when $0.40 \le \text{Risk Score} < 0.70$.
   - On-premise zero-shot intent reasoning without cloud egress.

---

## 3. Detailed Architecture Across All 7 System Modules

### 1. Automated AI Red Team Scanner (`backend/app/red_team/`)
- **Module Architecture**: `runner.py` dispatches vulnerability probe suites against target endpoints; `evaluator.py` evaluates responses into `DEFENDED` or `VULNERABLE`; `datasets.py` provides probe vectors.
- **Attack Probe Suites**:
  - *Prompt Injections*: System prompt leaks, role-play overrides, ChatML header injections.
  - *PII & Secrets Extraction*: Direct requests for credit cards, SSNs, and database credentials.
  - *Jailbreak Suites*: Authority bypass, compliance simulation, multi-turn escalation.
- **Executive PDF Audit Generator**: Client-side PDF compilation using `jsPDF` featuring overall score, vulnerability count, and probe breakdowns.

### 2. Secure AI Agent Runtime & Tool Interception (`backend/app/connector/evaluators/multi_turn_risk.py`)
- **Tool Interception Engine**: Intercepts tool call instructions issued by autonomous AI agents before execution.
- **Action Risk Matrix**:
  - `search_web` $\rightarrow$ `LOW` Risk $\rightarrow$ `ALLOW`
  - `send_email` $\rightarrow$ `MEDIUM` Risk $\rightarrow$ `MONITOR`
  - `delete_file` / `delete_email` $\rightarrow$ `HIGH` Risk $\rightarrow$ `CONFIRM_REQUIRED` (Human-in-the-Loop)
  - `transfer_money` / `sudo rm -rf` $\rightarrow$ `CRITICAL` Risk $\rightarrow$ `BLOCK`
- **Stateful Multi-Turn Session Intelligence**: Tracks exponential risk accumulation across conversational turns:
  $$\text{Accumulated\_Risk}_t = (0.85 \times \text{Accumulated\_Risk}_{t-1}) + (0.50 \times \text{Turn\_Risk}_t)$$

### 3. Declarative Policy Engine & Taxonomies (`backend/app/config/threat_taxonomies.json`)
- **Decoupled Architecture**: All threat categories, centroids, regex masks, and regulatory thresholds are stored in `threat_taxonomies.json` with dynamic live reloading without server restarts.
- **5 Regulatory Frameworks**:
  1. *Customer Support (`pol_customer_support`)*: `MASK`
  2. *Internal Copilot (`pol_internal_copilot`)*: `MASK` + `AUDIT`
  3. *Healthcare / HIPAA (`pol_us_hipaa`)*: `BLOCK`
  4. *Autonomous Agents (`pol_ai_agent`)*: `CONFIRM_REQUIRED`
  5. *Global GDPR (`pol_eu_gdpr`)*: `REDACT`

### 4. Hallucination & Speech-Act RAG Grounding (`backend/app/connector/evaluators/grounding.py`)
- **Speech-Act Propositional Theory**: Distinguishes non-assertive conversational speech acts (offers of assistance, safety refusals) from testable declarative factual claims.
- **Context-Faithfulness & Live Web Search**: Verifies testable claims against enterprise RAG reference documents or live Google Serper web search evidence without generating false-positive hallucination flags on conversational text.

### 5. Human-in-the-Loop (HITL) Review Queue (`backend/app/models/db/reviews.py`)
- **Review Lifecycle**: Persists `CONFIRM_REQUIRED` and `FLAGGED` interception events for operator review (`Approve`, `Reject`, `Policy Override`).
- **Closed-Loop Threshold Auto-Tuning**: Auto-adjusts vector similarity tolerances based on reviewer feedback to systematically reduce false positive rates over time.

### 6. Enrollment Tokens & Network Shield (`backend/app/routes/tokens.py` & `frontend/extension/`)
- **Auto-Enrollment Tokens**: Generates 48-day activation tokens (`tp_tok_...`) binding browser extensions and API clients to tenant accounts.
- **Main-World Network Interceptor**: Manifest V3 extension intercepting outgoing `fetch` and `XMLHttpRequest` calls on ChatGPT, Claude, Gemini, DeepSeek, and Botpress.

### 7. Monitored AI Resources & Webhook Inventory (`backend/app/models/db/connection.py`)
- **Database Abstraction**: Zero-config SQLite local development + Neon Cloud PostgreSQL production mode.
- **Resource Management**: Tracks active AI chatbots and webhooks with automated health validation.

---

## 4. Testing & Verification Suite

ControlPlane AI includes an extensive, automated test suite (**134/134 Passing**):
```bash
pytest backend/tests -v
```

- `test_universal_vector_engine.py`: Verifies zero-shot threat vector projections across all 5 policy archetypes.
- `test_grounding.py`: Verifies speech-act claim extraction and RAG grounding.
- `test_pii.py`: Verifies Luhn Mod-10 credit card check and Shannon entropy secret detection.
- `test_red_team_package.py`: Verifies automated red-team vulnerability probes and PDF report generation.
