"""
PII (Personally Identifiable Information) Detector & Redactor.

Scans prompts and responses for sensitive data (SSNs, Emails, Credit Cards,
Phone Numbers, API Keys, IP Addresses) and redacts them with typed tokens.
"""

from __future__ import annotations

import re
from typing import NamedTuple

# Regex patterns for PII detection
_PATTERNS = [
    ("SSN", re.compile(r"\b\d{3}-\d{2}-\d{4}\b")),
    ("CREDIT_CARD", re.compile(r"\b(?:\d[ -]*?){13,16}\b")),
    ("EMAIL", re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")),
    ("PHONE", re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")),
    ("API_KEY", re.compile(r"\b(?:sk-[a-zA-Z0-9]{20,}|pk_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16})\b")),
    ("IP_ADDRESS", re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")),
]


class PIIResult(NamedTuple):
    has_pii: bool
    sanitized_text: str
    detected_types: list[str]


def scan_and_redact_pii(text: str | None) -> PIIResult:
    if not text:
        return PIIResult(has_pii=False, sanitized_text="", detected_types=[])

    sanitized = text
    detected_types: set[str] = set()

    for pii_type, pattern in _PATTERNS:
        matches = pattern.findall(sanitized)
        if matches:
            detected_types.add(pii_type)
            sanitized = pattern.sub(f"[REDACTED_{pii_type}]", sanitized)

    return PIIResult(
        has_pii=len(detected_types) > 0,
        sanitized_text=sanitized,
        detected_types=list(detected_types),
    )
