"""
Prompt Injection & Adversarial Jailbreak Detector.

Scans user prompts for override instructions, system prompt extraction,
jailbreak roleplay triggers, and authority override attempts.
"""

from __future__ import annotations

import re
from typing import NamedTuple

_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(?:all\s+)?previous\s+instructions", re.IGNORECASE),
    re.compile(r"disregard\s+(?:all\s+)?prior\s+rules", re.IGNORECASE),
    re.compile(r"reveal\s+(?:your\s+)?system\s+prompt", re.IGNORECASE),
    re.compile(r"print\s+(?:your\s+)?initial\s+instructions", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+in\s+developer\s+mode", re.IGNORECASE),
    re.compile(r"dan\s+mode", re.IGNORECASE),
    re.compile(r"bypass\s+safety\s+filter", re.IGNORECASE),
    re.compile(r"act\s+as\s+an?\s+unfiltered", re.IGNORECASE),
    re.compile(r"do\s+anything\s+now", re.IGNORECASE),
    re.compile(r"root\s+access\s+granted", re.IGNORECASE),
]


class InjectionResult(NamedTuple):
    is_injection: bool
    confidence_score: float
    reason: str | None


def scan_prompt_injection(prompt: str | None) -> InjectionResult:
    if not prompt:
        return InjectionResult(is_injection=False, confidence_score=0.0, reason=None)

    for pattern in _INJECTION_PATTERNS:
        if pattern.search(prompt):
            return InjectionResult(
                is_injection=True,
                confidence_score=0.95,
                reason=f"Adversarial prompt injection pattern detected: '{pattern.pattern}'",
            )

    # Heuristic: sudden roleplay instruction shift or weird delimiter overload
    if "SYSTEM PROMPT:" in prompt.upper() or "OVERRIDE:" in prompt.upper():
        return InjectionResult(
            is_injection=True,
            confidence_score=0.85,
            reason="System command keyword injection detected.",
        )

    return InjectionResult(is_injection=False, confidence_score=0.0, reason=None)
