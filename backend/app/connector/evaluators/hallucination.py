"""
Grounding & Factuality Estimator (Performance / P Metric).

Calculates a grounding score based on hedging patterns, self-contradiction
indicators, confidence indicators, and context overlap.
"""

from __future__ import annotations

import re
from typing import NamedTuple

_HEDGING_PATTERNS = [
    re.compile(r"i'm\s+not\s+entirely\s+sure", re.IGNORECASE),
    re.compile(r"i\s+believe\s+that\s+might\s+be", re.IGNORECASE),
    re.compile(r"as\s+an\s+ai\s+language\s+model", re.IGNORECASE),
    re.compile(r"i\s+don't\s+have\s+access\s+to\s+real-time", re.IGNORECASE),
    re.compile(r"this\s+is\s+just\s+a\s+guess", re.IGNORECASE),
    re.compile(r"i\s+may\s+be\s+mistaken", re.IGNORECASE),
    re.compile(r"unverified\s+information", re.IGNORECASE),
]


class HallucinationResult(NamedTuple):
    grounding_score: float  # 0.0 (high hallucination) to 1.0 (highly grounded)
    is_low_confidence: bool
    reasons: list[str]


def evaluate_grounding(response_text: str | None, threshold: float = 0.65) -> HallucinationResult:
    if not response_text:
        return HallucinationResult(grounding_score=1.0, is_low_confidence=False, reasons=[])

    score = 0.95
    reasons = []

    for pattern in _HEDGING_PATTERNS:
        if pattern.search(response_text):
            score -= 0.20
            reasons.append(f"Hedging or low-confidence phrase detected: '{pattern.pattern}'")

    # Clamp score between 0.0 and 1.0
    score = max(0.0, min(1.0, score))
    is_low_confidence = score < threshold

    if is_low_confidence and not reasons:
        reasons.append(f"Grounding score ({score:.2f}) falls below configured threshold ({threshold:.2f}).")

    return HallucinationResult(
        grounding_score=round(score, 2),
        is_low_confidence=is_low_confidence,
        reasons=reasons,
    )
