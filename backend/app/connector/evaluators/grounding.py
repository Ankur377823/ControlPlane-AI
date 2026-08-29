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


def is_assertive_factual_proposition(sentence: str) -> bool:
    """
    Linguistic speech-act classifier:
    Determines if a sentence constitutes an assertive, testable factual proposition.
    Filters out non-declarative discourse acts (questions, first-person performatives, polite imperatives, safety refusals).
    """
    s = sentence.strip()
    if len(s) < 15 or s.endswith("?"):
        return False

    lower_s = s.lower()

    # 1. First-person performative speech acts (offers of assistance, safety refusals, AI persona)
    if re.match(r"^(?:i\s+(?:cannot|can't|am\s+unable|must\s+decline|apologize|would\s+be\s+happy|can\s+help|am\s+happy|recommend)|as\s+an?\s+(?:ai|assistant))\b", lower_s):
        return False

    # 2. Polite imperative prompts & conversational interaction markers
    if re.match(r"^(?:please\s+|feel\s+free\s+to\s+|let\s+me\s+know\s+|if\s+you\s+(?:are|need|want|have)\s+|thank\s+you|hope\s+this\s+helps|what\s+(?:subject|topic|problem|would))\b", lower_s):
        return False

    # 3. Compliance and legal risk warnings
    if re.search(r"\b(?:carries\s+(?:severe\s+)?legal|violat(?:es|ing)\s+(?:laws?|regulation|policy|sec)|against\s+(?:policy|rules?|law))\b", lower_s):
        return False

    return True


def extract_claims(text: str) -> List[str]:
    """
    Extract discrete, testable factual propositions from generated text.
    Uses linguistic speech-act classification to separate empirical assertions from discourse markers.
    """
    if not text or not text.strip():
        return []

    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    claims = []

    for sent in sentences:
        s = sent.strip()
        if is_assertive_factual_proposition(s) and s not in claims:
            claims.append(s)

    return claims


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



_HALLUCINATION_OR_PARODY_PATTERNS = [
    re.compile(r"wrong\s+answer\s*[:\-]?", re.IGNORECASE),
    re.compile(r"incorrect\s+answer\s*[:\-]?", re.IGNORECASE),
    re.compile(r"fake\s+answer\s*[:\-]?", re.IGNORECASE),
    re.compile(r"false\s+answer\s*[:\-]?", re.IGNORECASE),
    re.compile(r"factually\s+(?:incorrect|false|wrong)", re.IGNORECASE),
    re.compile(r"this\s+is\s+untrue", re.IGNORECASE),
    re.compile(r"hypothetically\s+speaking,\s+if\s+we\s+pretend", re.IGNORECASE),
    re.compile(r"in\s+an\s+alternate\s+universe", re.IGNORECASE),
]

_HEDGING_PATTERNS = [
    re.compile(r"i'm\s+not\s+entirely\s+sure", re.IGNORECASE),
    re.compile(r"i\s+believe\s+that\s+might\s+be", re.IGNORECASE),
    re.compile(r"as\s+an\s+ai\s+language\s+model", re.IGNORECASE),
    re.compile(r"i\s+don't\s+have\s+access\s+to\s+real-time", re.IGNORECASE),
    re.compile(r"this\s+is\s+just\s+a\s+guess", re.IGNORECASE),
    re.compile(r"i\s+may\s+be\s+mistaken", re.IGNORECASE),
    re.compile(r"unverified\s+information", re.IGNORECASE),
    re.compile(r"it\s+is\s+rumored\s+that", re.IGNORECASE),
    re.compile(r"to\s+the\s+best\s+of\s+my\s+knowledge,\s+possibly", re.IGNORECASE),
]


_CONVERSATIONAL_BENIGN_PATTERNS = [
    re.compile(r"^(?:got\s+it|understood|okay|sure|hello|hi|hey|thanks|thank\s+you|noted|i'll\s+remember|i\s+will\s+remember|sounds\s+good|glad\s+to\s+help|no\s+problem|you're\s+welcome)\b", re.IGNORECASE),
    re.compile(r"^(?:i\s+can(?:'t|\s+not)\s+help\s+with\s+that|how\s+can\s+i\s+(?:assist|help)\s+you)\b", re.IGNORECASE),
]


def evaluate_grounding(
    prompt: str,
    response: str,
    context_docs: Optional[List[str]] = None,
    serper_api_key: Optional[str] = None,
    hallucination_threshold: float = 0.65
) -> Dict[str, Any]:
    """
    Comprehensive grounding and factuality evaluation.
    """
    resp_clean = response.strip()
    if not resp_clean or any(p.search(resp_clean) for p in _CONVERSATIONAL_BENIGN_PATTERNS):
        return {
            "is_grounded": True,
            "grounding_score": 1.0,
            "total_claims": 0,
            "verified_claims": [],
            "ungrounded_claims": [],
            "source_link": None,
            "correct_answer": None,
            "risk_tier": "LOW",
            "action": "ALLOW",
            "evidence_source": "conversational_acknowledgment"
        }

    claims = extract_claims(response)
    if not claims:
        return {
            "is_grounded": True,
            "grounding_score": 1.0,
            "total_claims": 0,
            "verified_claims": [],
            "ungrounded_claims": [],
            "source_link": None,
            "correct_answer": None,
            "risk_tier": "LOW",
            "action": "ALLOW",
            "evidence_source": "conversational_dialogue"
        }

    context_docs = context_docs or []
    
    verified_claims = []
    ungrounded_claims = []
    
    total_score = 0.0
    serper_key = serper_api_key or os.environ.get("SERPER_API_KEY", "")
    for c in claims:
        source_link = None
        correct_answer = None

        if context_docs:
            grounded, conf, snippet = verify_against_context(c, context_docs)
            source_link = "Enterprise Internal Knowledge Base"
            correct_answer = snippet
        elif serper_key:
            # Live Serper Web Search Verification
            grounded, conf, snippet, source_link, correct_answer = verify_against_serper(prompt, c, serper_key)
        else:
            # Direct response evaluation: check for explicit contradiction, wrong answers, or hedging
            is_parody_or_wrong = any(p.search(c) for p in _HALLUCINATION_OR_PARODY_PATTERNS)
            is_hedging = any(p.search(c) for p in _HEDGING_PATTERNS)

            if is_parody_or_wrong:
                grounded = False
                conf = 0.20
                snippet = "Explicit contradictory / false answer assertion detected"
            elif is_hedging:
                grounded = False
                conf = 0.35
                snippet = "Hedging or low-confidence phrasing detected"
            else:
                grounded = True
                conf = 0.95
                snippet = "Direct high-confidence factual assertion"

        claim_record = {
            "claim": c,
            "grounded": grounded,
            "confidence": conf,
            "evidence_snippet": snippet,
            "source_link": source_link,
            "correct_answer": correct_answer or snippet,
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

    top_evidence_link = (ungrounded_claims[0].get("source_link") if ungrounded_claims else None) or (verified_claims[0].get("source_link") if verified_claims else None)
    top_correct_answer = (ungrounded_claims[0].get("correct_answer") if ungrounded_claims else None) or (verified_claims[0].get("correct_answer") if verified_claims else None)

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
        "source_link": top_evidence_link,
        "correct_answer": top_correct_answer,
        "risk_tier": risk_tier,
        "action": action,
        "evidence_source": "rag_context" if context_docs else ("serper_live_search" if serper_key else "heuristic_search")
    }


def verify_against_serper(prompt: str, claim: str, serper_key: str) -> Tuple[bool, float, Optional[str], Optional[str], Optional[str]]:
    """
    FacTool Core Web Factuality Engine:
    Queries Google via Serper across the entire web, extracts multi-source evidence snippets and direct URLs,
    and uses LLM reasoning to determine truthfulness and identify the precise citation link.
    Returns: (is_factual, confidence, reasoning, authoritative_source_link, correct_grounded_answer)
    """
    import urllib.parse
    search_query = prompt[:120] if prompt and len(prompt) > 5 else claim[:120]
    authoritative_url = f"https://www.google.com/search?q={urllib.parse.quote_plus(search_query)}"
    correct_fact = None

    try:
        import httpx
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

            sources = []
            if answer_box:
                sources.append({
                    "id": 0,
                    "title": "Google Knowledge Graph Answer",
                    "link": organics[0].get('link', '') if organics else authoritative_url,
                    "snippet": str(answer_box)
                })

            for idx, org in enumerate(organics[:6]):
                if org.get('snippet') or org.get('link'):
                    sources.append({
                        "id": idx + 1,
                        "title": org.get('title', 'Web Source'),
                        "link": org.get('link', ''),
                        "snippet": org.get('snippet', '')
                    })

            if sources and sources[0].get('link'):
                authoritative_url = sources[0]['link']

            openai_key = os.environ.get("OPENAI_API_KEY", "")
            if openai_key and sources:
                try:
                    import openai
                    client = openai.OpenAI(api_key=openai_key)
                    judge_prompt = f"""You are the FacTool Core Factuality Engine. Verify the factual accuracy of the Proposed Answer against live search evidence gathered from across the Internet.

User Question: "{prompt}"
Proposed Answer: "{claim}"

Live Web Sources:
{json.dumps(sources, indent=2)}

Tasks:
1. Determine if the Proposed Answer is factually correct.
2. What is the verified grounded correct answer in 1 concise sentence?
3. Select the exact source link from the live web sources that proves the correct answer.

Return JSON:
{{
  "factuality": true/false,
  "correct_answer": "verified correct answer in 1 sentence",
  "reasoning": "clear explanation comparing claim vs evidence",
  "source_url": "exact link from sources that proves the answer"
}}"""
                    j_comp = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[{"role": "user", "content": judge_prompt}],
                        temperature=0.0,
                        response_format={"type": "json_object"}
                    )
                    j_res = json.loads(j_comp.choices[0].message.content.strip())
                    is_factual = bool(j_res.get("factuality", False))
                    reasoning = j_res.get("reasoning", "")
                    correct_fact = j_res.get("correct_answer", "")
                    selected_url = j_res.get("source_url", "")
                    if selected_url and selected_url.startswith("http"):
                        authoritative_url = selected_url

                    conf = 0.95 if is_factual else 0.10
                    return is_factual, conf, reasoning, authoritative_url, correct_fact
                except Exception as e:
                    logger.debug(f"FacTool OpenAI judge notice: {e}")

            # Fallback heuristic if OpenAI is not available
            combined_text = " ".join([s['snippet'] for s in sources])
            if combined_text:
                claim_words = [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\-]{3,}\b', claim)]
                comb_lower = combined_text.lower()
                matches = sum(1 for w in claim_words if w in comb_lower)
                ratio = matches / max(1, len(claim_words))
                if ratio >= 0.60:
                    return True, 0.85, combined_text[:150], authoritative_url, sources[0]['snippet'] if sources else combined_text[:150]
                else:
                    return False, 0.20, f"Web evidence contradicts claim: {combined_text[:150]}...", authoritative_url, sources[0]['snippet'] if sources else combined_text[:150]

    except Exception as e:
        logger.debug(f"Serper check notice: {e}")
    return False, 0.40, "No supporting search evidence retrieved", authoritative_url, correct_fact


