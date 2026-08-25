"""
Evidence-Backed Factuality & RAG Grounding Evaluator for ControlPlane AI

Evaluates LLM responses for:
1. Atomic factual claim extraction
2. Context-Faithfulness / Grounding against trusted RAG documents
3. External Web Search verification (Serper API fallback)
4. Hallucination and unsupported claim scoring
"""

from __future__ import annotations

import os
import re
import json
import logging
from typing import Optional, Dict, Any, List, Tuple

logger = logging.getLogger("controlplane.grounding")


def extract_claims(text: str) -> List[str]:
    """
    Extract discrete, testable factual propositions/claims from generated text.
    Handles sentence-level propositions and filters conversational fluff.
    """
    if not text or not text.strip():
        return []

    # Clean text and split by sentence terminators
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    claims = []

    # Filter non-factual or purely conversational statements
    fluff_patterns = [
        r"^(hello|hi|hey|sure|certainly|i can help|as an ai|thank you|good day)",
        r"^(let me know|feel free|hope this helps|is there anything else)",
    ]

    for sent in sentences:
        s = sent.strip()
        if len(s) < 15:
            continue
        if any(re.search(p, s, re.IGNORECASE) for p in fluff_patterns):
            continue
        # Deduplicate and append
        if s not in claims:
            claims.append(s)

    return claims if claims else [text.strip()]


def verify_against_context(claim: str, context_docs: List[str]) -> Tuple[bool, float, Optional[str]]:
    """
    Check if a claim is supported/grounded by provided reference documents (RAG context).
    Returns (is_grounded, confidence_score, matching_snippet).
    """
    if not context_docs or not claim:
        return False, 0.0, None

    # Comprehensive stopwords and pronouns
    stopwords = {
        "the", "a", "an", "is", "are", "was", "were", "and", "or", "in", "on", "at", "to", "for",
        "of", "with", "you", "your", "we", "our", "they", "their", "he", "she", "it", "its", "have",
        "has", "had", "can", "will", "may", "any", "all", "some", "this", "that", "which", "what",
        "from", "into", "been", "being", "there", "here", "then", "when", "where", "how", "why"
    }
    claim_words = [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\-]{2,}\b', claim) if w.lower() not in stopwords]
    
    if not claim_words:
        return True, 0.90, "Trivially grounded"

    best_match_ratio = 0.0
    best_snippet = None

    for doc in context_docs:
        doc_lower = doc.lower()
        matched_words = [w for w in claim_words if w in doc_lower]
        ratio = len(matched_words) / len(claim_words)
        
        if ratio > best_match_ratio:
            best_match_ratio = ratio
            best_snippet = doc[:200] + ("..." if len(doc) > 200 else "")

    is_grounded = best_match_ratio >= 0.50
    confidence = round(min(1.0, best_match_ratio * 1.15), 2)
    return is_grounded, confidence, best_snippet



def evaluate_grounding(
    prompt: str,
    response: str,
    context_docs: Optional[List[str]] = None,
    serper_api_key: Optional[str] = None,
    hallucination_threshold: float = 0.65
) -> Dict[str, Any]:
    """
    Comprehensive grounding and factuality evaluation.
    
    Returns structured evaluation with:
    - is_grounded (bool)
    - grounding_score (0.0 - 1.0)
    - ungrounded_claims (List[Dict])
    - risk_tier (LOW / MEDIUM / HIGH)
    - action (ALLOW / MONITOR / CONFIRM_REQUIRED / BLOCK)
    """
    claims = extract_claims(response)
    context_docs = context_docs or []
    
    verified_claims = []
    ungrounded_claims = []
    
    total_score = 0.0
    serper_key = serper_api_key or os.environ.get("SERPER_API_KEY", "")

    for c in claims:
        # Check against RAG context first
        if context_docs:
            grounded, conf, snippet = verify_against_context(c, context_docs)
        elif serper_key:
            # Live Serper Web Search Verification
            grounded, conf, snippet = verify_against_serper(prompt, c, serper_key)
        else:
            # Fallback heuristic:
            # 1. Check for specific numbers / dates without grounding context
            has_specific_numbers = bool(re.search(r'\b\d{4,}\b|\$\d+|\b\d+\.\d+%\b', c))
            # 2. Check for general factual/informational queries without reference docs
            is_factual_q = bool(re.search(r'\b(who|what|where|when|which|how|why|name|capital|leader|head|founder|inventor|date|population|currency|author)\b', prompt, re.IGNORECASE))
            
            if is_factual_q and len(context_docs) == 0:
                # Open factual assertion with zero grounding reference
                grounded = False
                conf = 0.35
                snippet = "Unverified assertion without approved enterprise reference context"
            else:
                grounded = not has_specific_numbers
                conf = 0.85 if grounded else 0.45
                snippet = None


        claim_record = {
            "claim": c,
            "grounded": grounded,
            "confidence": conf,
            "evidence_snippet": snippet
        }

        if grounded:
            verified_claims.append(claim_record)
            total_score += conf
        else:
            ungrounded_claims.append(claim_record)
            total_score += (conf * 0.5)

    num_claims = max(1, len(claims))
    grounding_score = round(total_score / num_claims, 2)
    has_hallucination = grounding_score < hallucination_threshold or len(ungrounded_claims) > 0

    if grounding_score >= 0.80 and not ungrounded_claims:
        risk_tier = "LOW"
        action = "ALLOW"
    elif grounding_score >= 0.55:
        risk_tier = "MEDIUM"
        action = "MONITOR"
    else:
        risk_tier = "HIGH"
        action = "CONFIRM_REQUIRED"

    return {
        "is_grounded": not has_hallucination,
        "grounding_score": grounding_score,
        "total_claims": len(claims),
        "verified_claims": verified_claims,
        "ungrounded_claims": ungrounded_claims,
        "risk_tier": risk_tier,
        "action": action,
        "evidence_source": "rag_context" if context_docs else ("serper_live_search" if serper_key else "heuristic_search")
    }


def verify_against_serper(prompt: str, claim: str, serper_key: str) -> Tuple[bool, float, Optional[str]]:
    """
    Queries Google via Serper API and evaluates whether the claim correctly answers the prompt.
    Uses OpenAI for intelligent evidence comparison if OPENAI_API_KEY is configured.
    """
    try:
        import httpx
        # Search the original question to retrieve ground truth evidence
        search_query = prompt[:120] if prompt and len(prompt) > 5 else claim[:120]
        resp = httpx.post(
            'https://google.serper.dev/search',
            headers={'X-API-KEY': serper_key, 'Content-Type': 'application/json'},
            json={'q': search_query},
            timeout=5.0
        )
        if resp.status_code == 200:
            data = resp.json()
            organics = data.get('organic', [])
            answer_box = data.get('answerBox', {}).get('answer') or data.get('answerBox', {}).get('snippet', '')
            
            snippets = []
            if answer_box:
                snippets.append(answer_box)
            for org in organics[:3]:
                if org.get('snippet'):
                    snippets.append(org['snippet'])
            
            combined_evidence = " | ".join(snippets) if snippets else ""
            
            openai_key = os.environ.get("OPENAI_API_KEY", "")
            if openai_key and combined_evidence:
                try:
                    import openai
                    client = openai.OpenAI(api_key=openai_key)
                    judge_prompt = (
                        f"Question: \"{prompt}\"\n"
                        f"Proposed Answer/Claim: \"{claim}\"\n"
                        f"Google Web Search Evidence: \"{combined_evidence[:500]}\"\n\n"
                        f"Is the Proposed Answer factually correct according to the real-world evidence?\n"
                        f"Return JSON: {{\"factuality\": true/false, \"reasoning\": \"brief explanation\"}}"
                    )
                    j_comp = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[{"role": "user", "content": judge_prompt}],
                        temperature=0.0,
                        response_format={"type": "json_object"}
                    )
                    j_res = json.loads(j_comp.choices[0].message.content.strip())
                    is_factual = bool(j_res.get("factuality", False))
                    reasoning = j_res.get("reasoning", combined_evidence[:150])
                    conf = 0.95 if is_factual else 0.10
                    return is_factual, conf, reasoning
                except Exception as e:
                    logger.debug(f"OpenAI serper judge notice: {e}")

            # Fallback heuristic if OpenAI is not available
            if combined_evidence:
                claim_words = [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\-]{3,}\b', claim)]
                comb_lower = combined_evidence.lower()
                matches = sum(1 for w in claim_words if w in comb_lower)
                ratio = matches / max(1, len(claim_words))
                if ratio >= 0.60:
                    return True, 0.85, combined_evidence[:150]
                else:
                    return False, 0.20, f"Search evidence contradicts claim: {combined_evidence[:150]}..."

    except Exception as e:
        logger.debug(f"Serper check notice: {e}")
    return False, 0.40, "No supporting search evidence retrieved"


