"""
Bias & Toxic Content Evaluator for ControlPlane AI

Evaluates model inputs and outputs for toxic, discriminatory, or harmful bias.
"""

from __future__ import annotations

from typing import Dict, Any, List

BIAS_KEYWORDS = {
    "hate_speech": ["hate", "racist", "sexist", "bigot", "discriminate"],
    "toxicity": ["stupid", "idiot", "violent", "attack", "kill", "harm"],
    "bias": ["inferior race", "gender inferior", "racial stereotyping", "unqualified gender"]
}


def scan_bias_and_toxicity(text: str) -> Dict[str, Any]:
    if not text or not isinstance(text, str):
        return {
            "has_bias": False,
            "detected_types": [],
            "risk_findings": [],
            "confidence_score": 1.0
        }

    lower_text = text.lower()
    detected_types: List[str] = []
    risk_findings: List[Dict[str, Any]] = []

    for category, keywords in BIAS_KEYWORDS.items():
        for kw in keywords:
            if kw in lower_text:
                if category not in detected_types:
                    detected_types.append(category)
                risk_findings.append({
                    "category": "bias_safety",
                    "severity": "HIGH" if category == "hate_speech" else "MEDIUM",
                    "rule": f"Bias / Toxic Content Flagged ({category})",
                    "description": f"Text contains potential {category} term: '{kw}'",
                    "snippet": kw
                })

    return {
        "has_bias": len(detected_types) > 0,
        "detected_types": detected_types,
        "risk_findings": risk_findings,
        "confidence_score": 0.4 if detected_types else 1.0
    }
