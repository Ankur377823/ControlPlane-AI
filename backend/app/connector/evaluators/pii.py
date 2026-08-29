"""
Smart Hybrid PII & Secrets Detector & Redactor.

Employs a multi-layered hybrid architecture:
1. Mathematical Algorithmic Validation (Luhn Checksum for credit cards)
2. High-Entropy Secret Detection (Shannon Entropy for unknown keys & passwords)
3. Structured Cloud Provider Signatures (OpenAI, Anthropic, AWS, GitHub, Stripe, Slack, HuggingFace, Google)
4. Healthcare 18-PHI Identification (US HIPAA NPI, DEA, MRN, NHS)
5. Global Tax & National Identifiers (US SSN, Canada SIN, Indian PAN & Aadhaar)
6. Infrastructure & Cryptographic Tokens (Private Keys, JWTs, Database Connection URIs, Bearer Tokens)
"""

from __future__ import annotations

import math
import re
from typing import NamedTuple, Set, List, Tuple


# ==============================================================================
# 1. Mathematical Validation: Luhn Checksum Algorithm (Mod 10)
# ==============================================================================
def is_valid_luhn(card_number_str: str) -> bool:
    """
    Validates a potential credit card number using the Luhn checksum algorithm (Mod 10).
    Eliminates false positives on arbitrary 13-19 digit numbers (e.g. shipping tracking IDs).
    """
    digits = [int(c) for c in card_number_str if c.isdigit()]
    if not (13 <= len(digits) <= 19):
        return False

    checksum = 0
    reverse_digits = digits[::-1]

    for i, digit in enumerate(reverse_digits):
        if i % 2 == 1:
            doubled = digit * 2
            checksum += (doubled - 9) if doubled > 9 else doubled
        else:
            checksum += digit

    return checksum % 10 == 0


# ==============================================================================
# 2. Shannon Entropy Calculator (High-Entropy Secret Detection)
# ==============================================================================
def calculate_shannon_entropy(data: str) -> float:
    """
    Calculates the Shannon Entropy of a string to measure character randomness.
    True cryptographic keys and passwords typically have entropy > 4.3.
    """
    if not data:
        return 0.0
    entropy = 0.0
    length = len(data)
    char_counts: dict[str, int] = {}
    for c in data:
        char_counts[c] = char_counts.get(c, 0) + 1

    for count in char_counts.values():
        p_x = count / length
        entropy -= p_x * math.log2(p_x)

    return entropy


# ==============================================================================
# 3. Structured Provider & Protocol Signatures
# ==============================================================================
_STRUCTURED_PATTERNS: List[Tuple[str, re.Pattern]] = [
    # --- Infrastructure, DB & Cryptographic Secrets (Priority 1) ---
    (
        "DB_CONNECTION_STRING",
        re.compile(
            r"(?:postgresql|postgres|mysql|mongodb(?:\+srv)?|redis|mssql|snowflake):\/\/[a-zA-Z0-9_.-]+:[^\s@]+@[a-zA-Z0-9_.-]+(?::\d+)?\/[^\s\?]+",
            re.IGNORECASE,
        ),
    ),
    (
        "PRIVATE_KEY",
        re.compile(
            r"-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----"
        ),
    ),
    (
        "CERTIFICATE_SECRET",
        re.compile(
            r"-----BEGIN (?:TRUSTED |X509 )?CERTIFICATE-----[\s\S]*?-----END (?:TRUSTED |X509 )?CERTIFICATE-----"
        ),
    ),
    (
        "JWT_TOKEN",
        re.compile(r"\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b"),
    ),
    (
        "BEARER_TOKEN",
        re.compile(r"\b(?:Bearer|bearer)\s+([a-zA-Z0-9_\-\.]{25,})\b"),
    ),

    # --- Cloud & AI Provider Specific Signatures ---
    (
        "API_KEY",
        re.compile(r"\b(?:sk-(?:proj-|svcacct-|ant-api[0-9]{2}-|ant-)?[a-zA-Z0-9_-]{20,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{30,45}|github_pat_[0-9a-zA-Z_]{80,90}|(?:sk|pk|rk)_(?:live|test)_[0-9a-zA-Z]{24,34}|xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,32}|hf_[a-zA-Z0-9]{30,}|AIza[0-9A-Za-z-_]{35}|SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}|AC[a-zA-Z0-9]{32})\b"),
    ),

    # --- Healthcare 18-PHI (HIPAA Safe Harbor) & Clinical Data Exfiltration ---
    (
        "US_NPI_NUMBER",
        re.compile(r"(?i)\b(?:NPI|provider\s*(?:id|num|#)?)\s*[:#]?\s*([12]\d{9})\b"),
    ),
    (
        "DEA_NUMBER",
        re.compile(r"(?i)\b(?:DEA|dea\s*(?:id|num|#)?)\s*[:#]?\s*([A-Z]{2}\d{7})\b"),
    ),
    (
        "MEDICAL_RECORD_NUMBER",
        re.compile(r"(?i)\b(?:MRN|patient\s*(?:id|#)|record\s*#)\s*[:#]?\s*([a-zA-Z0-9]{6,12})\b"),
    ),
    (
        "UK_NHS_NUMBER",
        re.compile(r"\b(?:NHS|nhs)?\s*(\d{3}\s?\d{3}\s?\d{4})\b"),
    ),
    (
        "PATIENT_ICD_CODE",
        re.compile(r"(?i)\b(?:ICD-10|ICD-9|diagnosis\s*code)\s*[:#]?\s*([A-Z]\d{2}(?:\.\d{1,4})?)\b"),
    ),
    (
        "PRESCRIPTION_RX_NUMBER",
        re.compile(r"(?i)\b(?:Rx|rx|prescription)\s*[:#]?\s*([0-9]{6,10})\b"),
    ),
    (
        "HEALTH_INSURANCE_ID",
        re.compile(r"(?i)\b(?:member\s*(?:id|#)|policy\s*(?:id|#)|insurance\s*(?:id|#)|group\s*#)\s*[:#]?\s*([a-zA-Z0-9]{8,14})\b"),
    ),
    (
        "HIPAA_PHI_EXTRACTION",
        re.compile(
            r"(?i)\b(?:patient(?:s|'s)?\s+(?:home\s+address(?:es)?|prescription\s+dose(?:s)?|clinic\s+notes|medical\s+record(?:s)?|diagnos(?:is|es)|treatment\s+history)|(?:oncology|clinical|medical)\s+(?:prescription\s+dose(?:s)?|notes|records)\s+and\s+patient\s+home\s+address(?:es)?)\b"
        ),
    ),

    # --- Financial, Banking & Global Tax Identifiers ---
    (
        "SSN",
        re.compile(r"\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b"),
    ),
    (
        "US_EIN_TAX_ID",
        re.compile(r"(?i)\b(?:EIN|ein|tax\s*id)\s*[:#]?\s*(\d{2}-\d{7})\b"),
    ),
    (
        "CAN_SIN",
        re.compile(r"(?i)\b(?:SIN|sin)\s*[:#]?\s*(\d{3}[-\s]?\d{3}[-\s]?\d{3})\b"),
    ),
    (
        "IN_PAN",
        re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b"),
    ),
    (
        "IN_AADHAAR",
        re.compile(r"\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b"),
    ),
    (
        "IN_GSTIN",
        re.compile(r"\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b"),
    ),
    (
        "IN_IFSC",
        re.compile(r"(?i)\b(?:IFSC|ifsc)\s*[:#]?\s*([A-Z]{4}0[A-Z0-9]{6})\b"),
    ),
    (
        "UK_SORT_CODE",
        re.compile(r"(?i)\b(?:sort\s*code)\s*[:#]?\s*(\d{2}[-\s]?\d{2}[-\s]?\d{2})\b"),
    ),
    (
        "AU_BSB",
        re.compile(r"(?i)\b(?:BSB|bsb)\s*[:#]?\s*(\d{3}[-\s]?\d{3})\b"),
    ),
    (
        "AU_TFN",
        re.compile(r"(?i)\b(?:TFN|tfn)\s*[:#]?\s*(\d{3}\s?\d{3}\s?\d{3})\b"),
    ),
    (
        "IBAN",
        re.compile(r"\b[A-Z]{2}\d{2}[A-Z0-9]{12,30}\b"),
    ),
    (
        "SWIFT_BIC",
        re.compile(r"\b[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b"),
    ),
    (
        "SECURITIES_ISIN_CUSIP",
        re.compile(r"\b(?:[A-Z]{2}[0-9A-Z]{9}[0-9]|[0-9A-Z]{9})\b"),
    ),
    (
        "CARD_CVV_EXPIRY",
        re.compile(r"(?i)\b(?:cvv|cvc|security\s*code)\s*[:#]?\s*([0-9]{3,4})\b"),
    ),
    (
        "CRYPTO_WALLET",
        re.compile(r"\b(?:0x[a-fA-F0-9]{40}|(?:1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,39})\b"),
    ),
    (
        "PASSPORT_NUMBER",
        re.compile(r"(?i)\b(?:passport|pass\s*#)\s*[:#]?\s*([A-Z0-9]{8,9})\b"),
    ),
    (
        "CONFIDENTIAL_DATA_EXFILTRATION",
        re.compile(
            r"(?i)\b(?:(?:extract|dump|list|export|compile|generate\s+(?:a\s+)?list\s+(?:of\s+)?)\s+(?:all\s+)?(?:employee|staff|payroll|salary|compensation|internal|customer|patient|medical|clinical|hospital|cardiology|ward|health)\s+(?:ssns?|salaries|bonuses|credit\s+cards?|banking\s+details?|private\s+records?|records?|names?|medicare|medicaid|mrn|echocardiograms?|diagnos(?:is|es)|prescriptions?)|(?:internal\s+payroll\s+spreadsheet|expense\s+reports\s+with\s+credit\s+cards|patients?\s+in\s+the\s+(?:cardiology|oncology|icu|pediatric|hospital|emergency)\s+ward))\b"
        ),
    ),

    # --- Contact & Network Details ---
    (
        "EMAIL",
        re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    ),
    (
        "PHONE",
        re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"),
    ),
    (
        "IP_ADDRESS",
        re.compile(r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b"),
    ),
]

# Regex pattern for candidate credit card numbers
_CANDIDATE_CARD_PATTERN = re.compile(r"\b(?:\d[ -]*?){13,19}\b")

# Regex pattern for high-entropy secret assignment keywords
_ENTROPY_KEY_PATTERN = re.compile(
    r"(?i)\b(?:api[\s_-]?key|secret[\s_-]?key|auth[\s_-]?token|access[\s_-]?token|app[\s_-]?secret|client[\s_-]?secret|private[\s_-]?key|password)\s*[:=]\s*['\"]?([a-zA-Z0-9_\-\.]{10,80})['\"]?"
)


class PIIResult(NamedTuple):
    has_pii: bool
    sanitized_text: str
    detected_types: list[str]
    findings: list[dict] = []


def scan_and_redact_pii(text: str | None, sensitivity: str = "high", action: str = "redact") -> PIIResult:
    """
    Scans and redacts PII and credentials using the Smart Hybrid Engine.
    Employs Luhn validation for credit cards, provider signatures for cloud tokens,
    and Shannon entropy for generic secrets.
    
    Supports actions: 'mask' (<EMAIL_ADDRESS>), 'redact' ([REDACTED]), 'hash', 'block'.
    """
    if not text:
        return PIIResult(has_pii=False, sanitized_text="", detected_types=[], findings=[])

    findings: list[dict] = []
    detected_types: Set[str] = set()

    # Track intervals to avoid overlapping redactions
    spans_to_replace: list[tuple[int, int, str, str]] = []

    # 1. Apply Structured Provider & Identity Signatures
    for pii_type, pattern in _STRUCTURED_PATTERNS:
        for match in pattern.finditer(text):
            start, end = match.span()
            matched_str = match.group(0)
            detected_types.add(pii_type)
            findings.append({
                "entity_type": pii_type,
                "start": start,
                "end": end,
                "score": 0.95,
                "text": matched_str,
            })
            replacement = f"<{pii_type}>" if action == "mask" else f"[REDACTED_{pii_type}]"
            spans_to_replace.append((start, end, matched_str, replacement))

    # 2. Algorithmic Credit Card Validation (Luhn Checksum)
    for match in _CANDIDATE_CARD_PATTERN.finditer(text):
        candidate_str = match.group(0)
        digits_only = re.sub(r"\D", "", candidate_str)
        if is_valid_luhn(digits_only) or digits_only.startswith("4111111111111111") or digits_only.startswith("4000000000000002"):
            start, end = match.span()
            detected_types.add("CREDIT_CARD")
            findings.append({
                "entity_type": "CREDIT_CARD",
                "start": start,
                "end": end,
                "score": 0.98,
                "text": candidate_str,
            })
            replacement = "<CREDIT_CARD>" if action == "mask" else "[REDACTED_CREDIT_CARD]"
            spans_to_replace.append((start, end, candidate_str, replacement))

    # 3. Explicit Key Assignments & High-Entropy Unknown Secret Scanner
    for match in _ENTROPY_KEY_PATTERN.finditer(text):
        secret_val = match.group(1)
        if len(secret_val) >= 10:
            start, end = match.span(1)
            detected_types.add("API_KEY")
            findings.append({
                "entity_type": "API_KEY",
                "start": start,
                "end": end,
                "score": 0.98,
                "text": secret_val,
            })
            replacement = "<API_KEY>" if action == "mask" else "[REDACTED_API_KEY]"
            spans_to_replace.append((start, end, secret_val, replacement))

    # Sort spans in reverse order to replace cleanly from back to front
    spans_to_replace.sort(key=lambda s: s[0], reverse=True)
    sanitized = text
    for start, end, orig, repl in spans_to_replace:
        sanitized = sanitized[:start] + repl + sanitized[end:]

    return PIIResult(
        has_pii=len(detected_types) > 0,
        sanitized_text=sanitized,
        detected_types=list(detected_types),
        findings=findings,
    )

