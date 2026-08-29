"""
ControlPlane AI — Anti-Evasion & Adversarial Text Normalizer

Pre-processes input text before security evaluation:
1. Strips invisible zero-width Unicode characters and soft hyphens.
2. Normalizes cross-script homoglyphs (e.g., Cyrillic/Greek lookalikes to Latin).
3. Resolves leetspeak and obfuscated character substitutions (e.g., "byp4ss" -> "bypass").
4. Normalizes whitespace and space-splitting exploits (e.g., "i g n o r e" -> "ignore").
"""

from __future__ import annotations

import re
import unicodedata
from typing import NamedTuple, Set


class NormalizationResult(NamedTuple):
    normalized_text: str
    original_text: str
    has_evasion_attempts: bool
    evasion_flags: list[str]


# Zero-width, formatting, and invisible Unicode characters
_ZERO_WIDTH_CHARS = re.compile(
    r"[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD\u2060\u180E\u2000-\u200A\u2028\u2029]"
)

# Common Cyrillic and Greek homoglyphs mapped to ASCII equivalents
_HOMOGLYPH_MAP = {
    # Cyrillic lowercase to Latin
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ж": "zh",
    "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n",
    "о": "o", "п": "p", "р": "p", "с": "c", "т": "t", "у": "y", "ф": "f",
    "х": "x", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch", "ы": "y", "э": "e",
    "ю": "yu", "я": "ya", "і": "i", "ї": "yi", "є": "ye", "ґ": "g",
    # Cyrillic uppercase to Latin
    "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H", "О": "O",
    "Р": "P", "С": "C", "Т": "T", "У": "Y", "Х": "X",
    # Greek to Latin
    "α": "a", "β": "b", "γ": "g", "ε": "e", "ζ": "z", "η": "h", "θ": "th",
    "ι": "i", "κ": "k", "λ": "l", "μ": "m", "ν": "n", "ξ": "x", "ο": "o",
    "π": "p", "ρ": "r", "σ": "s", "τ": "t", "υ": "u", "φ": "ph", "χ": "ch",
    "ψ": "ps", "ω": "o",
}

# Common Leetspeak dictionary for adversarial keywords
_LEET_MAP = {
    "0": "o",
    "1": "i",
    "!": "i",
    "3": "e",
    "4": "a",
    "@": "a",
    "5": "s",
    "$": "s",
    "7": "t",
    "+": "t",
    "8": "b",
}

# Known security keywords to look for in space-split or leet attacks
_TARGET_KEYWORDS: Set[str] = {
    "ignore", "bypass", "system", "prompt", "override", "secret", "password",
    "admin", "root", "jailbreak", "unfiltered", "credentials", "compliance",
    "instructions", "directive"
}


def strip_zero_width_chars(text: str) -> tuple[str, bool]:
    """Removes all zero-width, formatting, and invisible Unicode control characters generically."""
    # Uses Unicode General Category: 'Cf' (Format), 'Cc' (Control), 'Cs' (Surrogate), 'Zl' (Line separator), 'Zp' (Paragraph separator)
    # Preserves standard whitespace ('\n', '\t', ' ')
    cleaned_chars = []
    has_evasion = False
    for c in text:
        cat = unicodedata.category(c)
        if cat in ("Cf", "Cs", "Zl", "Zp") or (cat == "Cc" and c not in "\r\n\t"):
            has_evasion = True
            continue
        cleaned_chars.append(c)
    cleaned = "".join(cleaned_chars)
    return cleaned, has_evasion


def normalize_homoglyphs(text: str) -> tuple[str, bool]:
    """Replaces visually deceptive cross-script homoglyphs with ASCII Latin equivalents."""
    replaced = []
    has_homoglyphs = False
    for char in text:
        if char in _HOMOGLYPH_MAP:
            replaced.append(_HOMOGLYPH_MAP[char])
            has_homoglyphs = True
        else:
            replaced.append(char)
    return "".join(replaced), has_homoglyphs


def decode_leetspeak(text: str) -> str:
    """Decodes numbers and symbols used to conceal security keywords (e.g., 'byp4ss' -> 'bypass')."""
    words = text.split()
    decoded_words = []
    for word in words:
        # Check if the word contains digits/symbols that translate to a target keyword
        trans_word = "".join(_LEET_MAP.get(c, c) for c in word.lower())
        if trans_word in _TARGET_KEYWORDS or any(kw in trans_word for kw in _TARGET_KEYWORDS):
            decoded_words.append(trans_word)
        else:
            decoded_words.append(word)
    return " ".join(decoded_words)


def collapse_split_words(text: str) -> str:
    """Collapses space-injected keywords like 'i g n o r e' -> 'ignore'."""
    pattern = re.compile(r"\b([a-zA-Z])\s+([a-zA-Z])\s+([a-zA-Z])\s+([a-zA-Z])(?:\s+([a-zA-Z]))?(?:\s+([a-zA-Z]))?(?:\s+([a-zA-Z]))?\b")
    def _join_match(m):
        chars = [g for g in m.groups() if g is not None]
        candidate = "".join(chars).lower()
        if candidate in _TARGET_KEYWORDS or any(candidate.startswith(kw) for kw in _TARGET_KEYWORDS):
            return candidate
        return m.group(0)
    return pattern.sub(_join_match, text)


def normalize_adversarial_input(text: str | None) -> NormalizationResult:
    """
    Main Anti-Evasion Normalization Entrypoint.
    Transforms obfuscated adversarial input into canonical text.
    """
    if not text:
        return NormalizationResult(
            normalized_text="",
            original_text=text or "",
            has_evasion_attempts=False,
            evasion_flags=[]
        )

    flags = []

    # 1. Strip zero-width & invisible Unicode
    cleaned_zw, has_zw = strip_zero_width_chars(text)
    if has_zw:
        flags.append("ZERO_WIDTH_UNICODE_STRIPPED")

    # 2. Normalize Unicode NFKC
    nfkc_text = unicodedata.normalize("NFKC", cleaned_zw)

    # 3. Normalize deceptive homoglyphs
    norm_homoglyphs, has_hg = normalize_homoglyphs(nfkc_text)
    if has_hg:
        flags.append("HOMOGLYPH_NORMALIZED")

    # 4. Decode Leetspeak
    norm_leet = decode_leetspeak(norm_homoglyphs)
    if norm_leet != norm_homoglyphs:
        flags.append("LEETSPEAK_NORMALIZED")

    # 5. Collapse space-injected characters
    norm_split = collapse_split_words(norm_leet)
    if norm_split != norm_leet:
        flags.append("SPACE_SPLIT_COLLAPSED")

    # 6. Normalize whitespace
    normalized_final = re.sub(r"\s+", " ", norm_split).strip()

    return NormalizationResult(
        normalized_text=normalized_final,
        original_text=text,
        has_evasion_attempts=len(flags) > 0,
        evasion_flags=flags
    )
