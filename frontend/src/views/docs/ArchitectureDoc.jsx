import React from 'react';
import { Shield, Zap, Filter, Scale, Eye, Cpu, Database, CheckCircle2, ArrowDown, ArrowRight, Lock } from 'lucide-react';

export function ArchitectureDoc() {
  return (
    <div className="space-y-10 animate-fade-in text-slate-200 font-mono leading-relaxed max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-3 border-b border-[#22252c] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#181b22] border border-[#2a2d36] text-white text-xs font-bold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-white" />
          <span>CONTROLPLANE AI // TECHNICAL SPECIFICATIONS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
          Multi-Tier Interception & Security Architecture
        </h1>
        <p className="text-xs text-[#8a8f98] leading-relaxed max-w-3xl">
          ControlPlane AI is engineered with a sub-15ms fast-path pipeline combining deterministic pattern filters, RAG evidence-grounding, state-machine agent safety, and cryptographic audit persistence.
        </p>
      </div>

      {/* SYSTEM ARCHITECTURE WIREFRAME DIAGRAM */}
      <section id="system-diagram" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>[1] 4-TIER THREAT CASCADING INTERCEPTION ENGINE</span>
          </h2>
          <span className="text-[10px] text-[#555a64] uppercase font-mono">LATENCY &lt; 15MS</span>
        </div>

        {/* ASCII Flowchart */}
        <div className="p-5 border border-dashed border-[#2a2d36] rounded-lg bg-[#07080a] text-[#d4d4d8] text-[10px] sm:text-[11px] leading-tight overflow-x-auto shadow-inner select-none font-mono">
          <pre>
{`+-----------------------------------------------------------------------------------+
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
+---------------------------------------+   +---------------------------------------+`}
          </pre>
        </div>
      </section>

      {/* 5-PHASE SCANNING PIPELINE DIAGRAM */}
      <section id="scanning-pipeline" className="space-y-4 pt-6 border-t border-[#22252c]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>[2] 5-PHASE COMPREHENSIVE SCANNING PIPELINE</span>
          </h2>
          <span className="text-[10px] text-[#555a64] uppercase font-mono">AUTOMATED RED-TEAM</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded bg-[#090a0d] border border-[#22252c] space-y-1.5">
            <div className="text-[10px] font-bold text-[#8a8f98] uppercase">PHASE 1</div>
            <div className="font-bold text-white">PII & Secrets</div>
            <div className="text-[11px] text-[#717682] leading-normal">
              Luhn Mod-10 card check, SSNs, API tokens, Shannon entropy calculation.
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#090a0d] border border-[#22252c] space-y-1.5">
            <div className="text-[10px] font-bold text-[#8a8f98] uppercase">PHASE 2</div>
            <div className="font-bold text-white">Unicode Evasion</div>
            <div className="text-[11px] text-[#717682] leading-normal">
              Zero-width stripper, homoglyph normalization, ChatML delimiter sanitization.
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#090a0d] border border-[#22252c] space-y-1.5">
            <div className="text-[10px] font-bold text-[#8a8f98] uppercase">PHASE 3</div>
            <div className="font-bold text-white">Vector Threat</div>
            <div className="text-[11px] text-[#717682] leading-normal">
              N-gram continuous subword vector space projection across 134 taxonomy centroids.
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#090a0d] border border-[#22252c] space-y-1.5">
            <div className="text-[10px] font-bold text-[#8a8f98] uppercase">PHASE 4</div>
            <div className="font-bold text-white">Speech-Act RAG</div>
            <div className="text-[11px] text-[#717682] leading-normal">
              Propositional claim verification vs conversational speech acts with Serper web search.
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#090a0d] border border-[#22252c] space-y-1.5">
            <div className="text-[10px] font-bold text-[#8a8f98] uppercase">PHASE 5</div>
            <div className="font-bold text-white">SHA-256 Audit</div>
            <div className="text-[11px] text-[#717682] leading-normal">
              Cryptographic hash chaining for SOC 2, HIPAA, and EU AI Act compliance.
            </div>
          </div>
        </div>
      </section>

      {/* CORE MODULE SPECIFICATIONS TABLE */}
      <section id="technology-stack" className="space-y-4 pt-6 border-t border-[#22252c]">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>[3] CORE MODULE SPECIFICATIONS</span>
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[#22252c] bg-[#090a0d] shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#050608] border-b border-[#22252c] text-[#8a8f98] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Component Module</th>
                <th className="py-3 px-4">File Path</th>
                <th className="py-3 px-4">Technical Responsibilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e222b] text-[#d4d4d8] text-[11px]">
              <tr>
                <td className="py-3 px-4 font-bold text-white">Master Guardrail Orchestrator</td>
                <td className="py-3 px-4 text-[#8a8f98]">backend/app/connector/guardrail.py</td>
                <td className="py-3 px-4">Coordinates 9 evaluator modules and computes composite P/C/R scores</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Universal Vector Engine</td>
                <td className="py-3 px-4 text-[#8a8f98]">backend/app/connector/evaluators/universal_vector_engine.py</td>
                <td className="py-3 px-4">Subword n-gram vectorization and dynamic centroid evaluation</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">PII & Secret Evaluator</td>
                <td className="py-3 px-4 text-[#8a8f98]">backend/app/connector/evaluators/pii.py</td>
                <td className="py-3 px-4">Luhn card check, Shannon entropy secret detection, and PII masking</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">RAG Grounding Evaluator</td>
                <td className="py-3 px-4 text-[#8a8f98]">backend/app/connector/evaluators/grounding.py</td>
                <td className="py-3 px-4">Speech-act claim extraction, contextual verification, and Serper API fallback</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Zero-LLM Guardian</td>
                <td className="py-3 px-4 text-[#8a8f98]">backend/app/connector/evaluators/guardian.py</td>
                <td className="py-3 px-4">Deterministic security checks and SHA-256 cryptographic hash chaining</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">HITL Review Queue</td>
                <td className="py-3 px-4 text-[#8a8f98]">backend/app/models/db/reviews.py</td>
                <td className="py-3 px-4">Human review decision persistence and closed-loop feedback threshold auto-tuning</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Chrome Extension Shield</td>
                <td className="py-3 px-4 text-[#8a8f98]">frontend/extension/content.js</td>
                <td className="py-3 px-4">Client-side form interception across ChatGPT, Claude, Gemini, Copilot, and DeepSeek</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
