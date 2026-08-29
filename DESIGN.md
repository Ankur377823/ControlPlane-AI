# DESIGN.md — ControlPlane AI Architecture & Technical Specifications

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
   - ChatML delimiters (`<|im_start|>`, `<|im_end|>`)
   - Llama-3 instruction headers (`<|start_header_id|>`)
   - Unicode zero-width evasion stripper (`'Cf'`, `'Cs'`, `'Zl'`, `'Cc'`)
2. **Tier 2: Universal Vector Space Projection (< 8ms)**:
   - Dense subword $N$-gram character vectorizer ($N \in [3, 5]$)
   - Continuous Cosine Similarity Distance in $\mathbb{R}^d$
   - Dynamically loads 134 NIST AI RMF & Meta Llama Guard 3 centroids from [`threat_taxonomies.json`](file:///c:/ControlPlane/backend/app/config/threat_taxonomies.json)
3. **Tier 3: Sliding-Window Prompt Chunking (< 12ms)**:
   - Slices long documents into 450-token overlapping windows
   - 100-token stride prevents "needle-in-a-haystack" payload obfuscation
4. **Tier 4: Contextual LLM Judge (Ollama / Local LLM) (~150ms)**:
   - Invoked strictly when $0.40 \le \text{Risk Score} < 0.70$
   - On-premise zero-shot intent reasoning without cloud egress

---

## 3. 5-Phase Automated Real-Time Scan Pipeline

The standard REST scanning routes (`POST /api/v1/scan/input` and `POST /api/v1/scan/output`) execute a 5-phase automated inspection lifecycle:

1. **Phase 1: Smart PII & Secrets Detection (Presidio + Luhn + Shannon Entropy)**:
   - Evaluates credit cards via the mathematical **Luhn Modulo-10 Checksum Algorithm**.
   - Evaluates unlabeled secret keys via **Shannon Information Entropy**:
     $$H = -\sum_{i=1}^{k} p_i \log_2(p_i)$$
   - Returns structured character offsets (`start`, `end`, `score`, `text`) with configurable actions (`mask`, `redact`, `hash`, `block`).
2. **Phase 2: Anti-Evasion Normalization Engine**:
   - Strips zero-width and invisible formatting code points using Unicode Consortium General Categories (`'Cf'`, `'Cs'`, `'Zl'`, `'Zp'`, `'Cc'`).
   - Normalizes homoglyphs via NFKC Unicode representation and decodes leetspeak substitutions.
3. **Phase 3: 4-Tier Adversarial Prompt Defense**:
   - Evaluates delimiter escaping, jailbreaks, and prompt injections across all 4 threat tiers.
4. **Phase 4: Content Safety & Regulatory Harm Detection**:
   - Projects prompt into the Universal Safety Taxonomy (`threat_taxonomies.json`) covering pediatric harm, third-trimester pregnancy contraindications (Misoprostol), toxic ingestion, and invasive DIY surgery.
5. **Phase 5: Stateful Multi-Turn Session Intelligence**:
   - Tracks session risk accumulation using exponential time decay:
     $$\text{Accumulated\_Risk}_t = (0.85 \times \text{Accumulated\_Risk}_{t-1}) + (0.50 \times \text{Turn\_Risk}_t)$$
   - Automatically escalates persistent boundary probing across turns.

---

## 4. Zero-Hardcode Declarative Policy System

All safety taxonomies, concept centroids, descriptions, and threshold tolerances are decoupled from Python code and stored in declarative JSON configuration:

* **Configuration Path**: [`backend/app/config/threat_taxonomies.json`](file:///c:/ControlPlane/backend/app/config/threat_taxonomies.json)
* **Mathematical Vector Engine**: [`backend/app/connector/evaluators/universal_vector_engine.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/universal_vector_engine.py)
* **Mathematical Vector Cosine Formula**:
  $$\text{Sim}(\mathbf{u}, \mathbf{C}) = \frac{\mathbf{u} \cdot \mathbf{C}}{\|\mathbf{u}\|_2 \|\mathbf{C}\|_2}$$
* **Generalization**: Allows the engine to generalize across millions of unseen prompts, misspellings, and multi-lingual translations (Spanish, Russian, Hindi, Chinese) with zero code modifications.

---

## 5. Output Factuality Grounding & Speech-Act Theory

Output auditing in [`backend/app/connector/evaluators/grounding.py`](file:///c:/ControlPlane/backend/app/connector/evaluators/grounding.py) employs **Linguistic Speech-Act Propositional Classification**:
- Distinguishes non-assertive conversational speech acts (assistance offers, clarifying questions, safety refusals) from testable declarative factual claims.
- Non-assertive propositions yield 0 testable claims, correctly maintaining `grounding_score = 1.0` and `is_grounded = True` without generating false-positive hallucination flags.
- Testable factual claims are verified against enterprise RAG reference documents or live search evidence.

---

## 6. The 5 Canonical Enterprise Regulatory Frameworks

| Policy Archetype | Enforcement Mode | Algorithmic Protection | Core Threat Defenses |
| :--- | :---: | :--- | :--- |
| **Customer Support (`pol_customer_support`)** | `MASK` | Luhn Mod-10 + RFC Regexes + Vector Classifier | Customer credit cards, phone numbers, emails, addresses, competitor steering, and DAN jailbreaks. |
| **Internal Copilot (`pol_internal_copilot`)** | `MASK` + `AUDIT` | Shannon Entropy + MNPI Vector Cluster | Accidental developer API key leaks, database connection URIs, unreleased Q3 EBITDA margins, employee salary harvesting. |
| **Healthcare / HIPAA (`pol_us_hipaa`)** | `BLOCK` | Universal Gestational & Medical Harm Centroids | Bulk cardiology/ICU patient chart dumps, third-trimester Misoprostol dosage, pediatric opioid combinations, toxic bleach home remedies. |
| **Autonomous Agents (`pol_ai_agent`)** | `CONFIRM_REQUIRED` | State Machine Action Risk Matrix | Destructive OS commands (`DROP TABLE`, `rm -rf /`), unauthorized corporate treasury wire transfers, multi-step exfiltration chains. |
| **Global Privacy / GDPR (`pol_eu_gdpr`)** | `REDACT` | Unicode NFKC Normalizer + PII Masking | International IBANs, passports, tax IDs, zero-width obfuscation, homoglyphs, and SHA-256 audit chaining. |
