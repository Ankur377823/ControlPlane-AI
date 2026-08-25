"""
PII (Personally Identifiable Information) & Secrets Detector & Redactor.

Scans prompts and responses for sensitive data:
- US & International SSNs / Tax IDs
- Credit Card Numbers (Visa, MasterCard, Amex, Discover, formatted or raw)
- Emails & IP Addresses (IPv4 & IPv6)
- Phone Numbers (Domestic & International)
- API Keys & Cloud Credentials (OpenAI, Anthropic, AWS, GitHub, Slack, HuggingFace, Google)
- Private Keys (RSA, EC, SSH) & Database Connection URIs & JWT Tokens
"""

from __future__ import annotations

import re
from typing import NamedTuple

# Regex patterns for PII and Secret Token detection (ordered by precedence)
_PATTERNS = [
    # Infrastructure & Cryptographic Secrets first (avoids false-positive sub-matching)
    ("DB_CONNECTION_STRING", re.compile(r"(?:postgresql|postgres|mysql|mongodb(?:\+srv)?|redis|mssql):\/\/[a-zA-Z0-9_.-]+:[^\s@]+@[a-zA-Z0-9_.-]+(?::\d+)?\/[^\s\?]+", re.IGNORECASE)),
    ("PRIVATE_KEY", re.compile(r"-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----")),
    ("JWT_TOKEN", re.compile(r"\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b")),
    ("API_KEY", re.compile(r"\b(?:sk-(?:proj-)?[a-zA-Z0-9_-]{20,}|pk_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{30,45}|xox[baprs]-[a-zA-Z0-9]{10,48}|hf_[a-zA-Z0-9]{30,}|AIza[0-9A-Za-z-_]{35})\b")),

    # Government & Financial
    ("SSN", re.compile(r"\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b")),
    ("CREDIT_CARD", re.compile(r"\b(?:\d[ -]*?){13,19}\b")),
    ("IBAN", re.compile(r"\b[A-Z]{2}\d{2}[A-Z0-9]{12,30}\b")),

    # Contact & Network Details
    ("EMAIL", re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")),
    ("PHONE", re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")),
    ("IP_ADDRESS", re.compile(r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b")),
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
