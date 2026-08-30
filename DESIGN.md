# ControlPlane AI — Technical Architecture & System Design Specification

> 📍 **Cross-Reference Links**:
> * Master Project Overview & How-To Guides: **[`README.md`](file:///c:/ControlPlane/README.md)**
> * Chrome Extension Installation Guide: **[`EXTENSION_SETUP.md`](file:///c:/ControlPlane/EXTENSION_SETUP.md)**
> * Live Production Deployment: **[https://controlplane-ai-utso.onrender.com/](https://controlplane-ai-utso.onrender.com/)**

---

## 1. Executive Architecture Summary

**ControlPlane AI** is an enterprise-grade Responsible AI (RAI) Governance Control Plane, real-time guardrail shield, and security monitoring studio. It provides a uniform interface to evaluate, audit, and intercept AI chatbot applications and autonomous LLM tool execution chains with **sub-15ms latency** and **zero cloud egress penalties**.

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

## 2. Mathematical Foundations & Algorithmic Design

ControlPlane AI implements a 4-tier filtering hierarchy that resolves 95% of traffic deterministically in $<10\text{ms}$ at $\$0.00$ compute cost, preserving local LLM inference only for ambiguous borderline cases.

### 1. Shannon Information Entropy (Secret & API Key Scanner)
Secrets (such as AWS keys, JWT tokens, and database URIs) exhibit higher character entropy than natural language prose. Information entropy $H(X)$ is computed as:

$$H(X) = -\sum_{i=1}^{k} p(x_i) \log_2 p(x_i)$$

Where $p(x_i)$ is the frequency of character $x_i$ in string $X$. Tokens exceeding $H(X) \ge 4.2$ with length $\ge 20$ characters trigger instant `MASK` redaction.

### 2. Luhn Mod-10 Algorithm (Credit Card Validation)
To prevent credit card leaks without regex false positives, digits $d_1 d_2 \dots d_n$ are validated via:

$$\sum_{i=1}^{n} f(d_i, i) \equiv 0 \pmod{10}$$

Where $f(d_i, i) = d_i$ for odd positions from the right, and $f(d_i, i) = 2d_i - 9$ (if $2d_i > 9$) for even positions.

### 3. Continuous Vector Space Cosine Distance
Inputs are vectorized into dense subword $N$-gram representations ($N \in [3, 5]$). Threat score against centroid vector $\mathbf{C}_j \in \mathbb{R}^d$ is computed via Cosine Distance:

$$\text{Sim}(\mathbf{u}, \mathbf{C}_j) = \frac{\mathbf{u} \cdot \mathbf{C}_j}{\|\mathbf{u}\|_2 \|\mathbf{C}_j\|_2}$$

Where $\mathbf{u}$ is the subword frequency vector of the input prompt. Similarity values above threshold $\tau_j$ trigger rule violations.

### 4. Multi-Turn Exponential Session Risk Decay
To detect multi-turn social engineering across long chat sessions, session risk accumulates exponentially across turns $t$:

$$\text{SessionRisk}_t = (0.85 \times \text{SessionRisk}_{t-1}) + (0.50 \times \text{TurnRisk}_t)$$

If $\text{SessionRisk}_t \ge 1.50$, the session is flagged for human intervention in the HITL Review Queue.

---

## 3. Detailed Architecture Across 15 Core Components

| Component ID | Module Name | Architectural Layer | Primary Function |
| :--- | :--- | :--- | :--- |
| `dashboard` | Executive Dashboard | UI Studio | Real-time security metrics, velocity charts, channel activity. |
| `inventory` | Monitored Resources | Management Layer | Endpoint registry, webhook onboarding, health tracking. |
| `agent-runtime` | AI Agent Runtime | Execution Interceptor | Tool call safety (LOW to CRITICAL risk tiers), OS command protection. |
| `security-center` | Security Center | Threat Intel | Security score, threat radar, NIST AI RMF posture mapping. |
| `review-queue` | HITL Review Queue | Human-in-the-Loop | Pending approval queue, auditor override, closed-loop tuning. |
| `risk-findings` | Risk Findings & Telemetry | Telemetry Layer | Incident log, session telemetry, source/severity filters, CSV export. |
| `policy-engine` | Policy Engine & Rules | Governance Engine | 5 regulatory presets, Luhn Mod-10, Shannon entropy, regex rules. |
| `enrollment-tokens` | Enrollment Tokens | Auth / Device Layer | Cryptographic tokens (`tp_tok_...`), device registration & revocation. |
| `red-team-scanner` | AI Red Team Scanner | Testing Suite | Automated attack probing, jailbreak testing, PDF report generator. |
| `rag-grounding` | Hallucination Studio | Factuality Engine | Atomic claim extraction, RAG context matching, Serper web citations. |
| `chrome-extension` | Chrome Extension | Endpoint Ingress | Manifest V3 client shield, sub-15ms prompt interception. |
| `rest-gateway` | REST AI Gateway | Proxy Ingress | OpenAI-compatible proxy (`/v1/chat/completions`), compliance headers. |
| `botpress-connector` | Botpress Connector | Chatbot Ingress | Native webhook listener (`/api/botpress/webhook`), async callbacks. |
| `fastapi-backend` | FastAPI Core Engine | Backend Core | Async Python engine, CORS governance, database ORM layer. |
| `audit-chain` | SHA-256 Audit Ledger | Forensic Storage | Sequential cryptographic hash chain linking all interception logs. |

---

## 4. SHA-256 Tamper-Evident Forensic Audit Chain

Every intercepted prompt, guardrail decision, and review action is cryptographically signed and chained sequentially:

$$\text{Hash}_N = \text{SHA256}\left(\text{Hash}_{N-1} \parallel \text{Payload}_N \parallel \text{Timestamp}_N\right)$$

This guarantees cryptographic proof of log integrity for SOC 2, HIPAA, and GDPR regulatory compliance audits.

---

## 5. UI Design System & Aesthetic Tokens

ControlPlane AI implements a high-contrast dark/light mode design system built with Vanilla CSS variables and Tailwind CSS:

* **Dark Mode Canvas**: `#08090b` (Deep Space Dark)
* **Card Panels**: `#0e1014` with `#22252c` borders
* **Primary High-Contrast Accent**: `#0f172a` (Light Mode) / `#ffffff` (Dark Mode)
* **Risk Accents**:
  - `CRITICAL`: `#f43f5e` (Rose Red)
  - `HIGH`: `#f97316` (Orange)
  - `MEDIUM`: `#f59e0b` (Amber)
  - `LOW`: `#10b981` (Emerald)
* **Typography**: Modern, readable `font-sans` (Inter / system-ui) for body prose with crisp monospace (`JetBrains Mono`) for code and tokens.
