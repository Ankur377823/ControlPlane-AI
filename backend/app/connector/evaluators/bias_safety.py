"""
Bias & Toxic Content Evaluator for ControlPlane AI

Evaluates model inputs and outputs for toxic, discriminatory, or harmful content:
- Hate Speech & Severe Harassment
- Toxic / Violent Content & Self-Harm
- Cyberattack & Exploit Generation Attempts
- System Resource Abuse Instructions
"""

from __future__ import annotations

import re
from typing import Dict, Any, List

_SAFETY_PATTERNS = [
    ("cyberattack_malware", re.compile(r"\b(?:create|generate|write)\s+(?:a\s+)?(?:ransomware|keylogger|trojan|rootkit|exploit\s+payload|ddos\s+script|reverse\s+shell|zero-day)\b", re.IGNORECASE)),
    ("vulnerability_exploit", re.compile(r"\b(?:sql\s+injection\s+payload|xss\s+payload|bypass\s+waf|crack\s+password\s+hash|buffer\s+overflow\s+exploit)\b", re.IGNORECASE)),
    ("severe_toxicity", re.compile(r"\b(?:kill\s+yourself|commit\s+suicide|self[\s-]harm|how\s+to\s+make\s+a\s+bomb|synthesize\s+(?:poison|explosives))\b", re.IGNORECASE)),
    ("hate_speech", re.compile(r"\b(?:subhuman\s+race|ethnic\s+cleansing|white\s+supremacy|racial\s+slur|inferior\s+gender)\b", re.IGNORECASE)),
]

BIAS_KEYWORDS = {
    "hate_speech": ["hate", "racist", "sexist", "bigot", "discriminate", "racial stereotyping"],
    "toxicity": ["violent", "attack", "kill", "harm", "abuse", "terrorist"],
    "bias": ["inferior race", "gender inferior", "racial stereotyping", "unqualified gender", "ageist discrimination"]
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

    # 1. Advanced Regex Threat Scans
    for cat_name, pattern in _SAFETY_PATTERNS:
        match = pattern.search(text)
        if match:
            if cat_name not in detected_types:
                detected_types.append(cat_name)
            risk_findings.append({
                "category": "bias_safety",
                "severity": "CRITICAL" if "malware" in cat_name or "toxicity" in cat_name else "HIGH",
                "rule": f"Safety Policy Violation ({cat_name.replace('_', ' ').title()})",
                "description": f"Dangerous or malicious pattern matched: '{match.group(0)}'",
                "snippet": match.group(0)
            })

    # 2. Keyword Biases & Moderation Triggers
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
        "confidence_score": 0.3 if any(f["severity"] == "CRITICAL" for f in risk_findings) else (0.5 if detected_types else 1.0)
    }
