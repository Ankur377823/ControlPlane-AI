"""
ControlPlane AI — Universal Zero-Shot Vector Space Threat Engine

Implements dynamic taxonomy loading and dense subword character N-gram vector projection.
Operates on mathematical vector space principles with ZERO hardcoded categories or prompt strings in code.
"""

from __future__ import annotations

import json
import logging
import math
from pathlib import Path
import re
from typing import Any, Dict, List, NamedTuple, Optional

logger = logging.getLogger("controlplane.vector_engine")


class VectorScoreResult(NamedTuple):
    is_threat: bool
    confidence_score: float
    threat_category: Optional[str]
    centroid_similarity: float
    explanation: Optional[str]


# ==============================================================================
# 1. Dynamic Declarative Policy Taxonomy Loader (Zero Hardcoding)
# ==============================================================================

_TAXONOMY_PATH = Path(__file__).resolve().parent.parent.parent / "config" / "threat_taxonomies.json"


def load_threat_taxonomies() -> Dict[str, Dict[str, Any]]:
    """Loads declarative safety taxonomies dynamically from JSON configuration."""
    try:
        if _TAXONOMY_PATH.exists():
            with open(_TAXONOMY_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("centroids", {})
    except Exception as e:
        logger.error(f"Failed to load declarative threat taxonomies from {_TAXONOMY_PATH}: {e}")
    return {}


_DYNAMIC_CENTROIDS = load_threat_taxonomies()


# ==============================================================================
# 2. Mathematical Subword Character N-Gram Vectorizer
# ==============================================================================

def _generate_subword_ngrams(text: str, n_min: int = 3, n_max: int = 5) -> Dict[str, float]:
    """
    Decomposes text into a dense mathematical vector of subword character N-grams.
    Provides subword morphology, language-agnostic tokenization, and cosine normalization.
    """
    clean = re.sub(r"[^a-zA-Z0-9_\-\s]", " ", text.lower())
    words = clean.split()
    ngram_freq: Dict[str, float] = {}

    for word in words:
        ngram_freq[f"w:{word}"] = ngram_freq.get(f"w:{word}", 0.0) + 2.0
        padded = f"^{word}$"
        for n in range(n_min, min(n_max + 1, len(padded) + 1)):
            for i in range(len(padded) - n + 1):
                gram = padded[i:i + n]
                ngram_freq[gram] = ngram_freq.get(gram, 0.0) + 1.0

    return ngram_freq


def _cosine_similarity(vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
    """Computes the cosine similarity metric between two dense feature vectors."""
    if not vec_a or not vec_b:
        return 0.0

    dot_product = sum(val * vec_b[key] for key, val in vec_a.items() if key in vec_b)
    norm_a = math.sqrt(sum(v * v for v in vec_a.values()))
    norm_b = math.sqrt(sum(v * v for v in vec_b.values()))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return dot_product / (norm_a * norm_b)


# Initialize mathematical centroid projections dynamically
_PRECOMPUTED_CENTROID_VECTORS: Dict[str, Dict[str, float]] = {
    cat_id: _generate_subword_ngrams(data["text_corpus"])
    for cat_id, data in _DYNAMIC_CENTROIDS.items()
}


# ==============================================================================
# 3. Universal Vector Classifier Entrypoint
# ==============================================================================

def evaluate_universal_vector_threat(prompt: str | None) -> VectorScoreResult:
    """
    Zero-Shot Vector Space Threat Evaluator.
    Projects arbitrary input text into continuous vector space and calculates similarity
    against dynamically loaded threat centroids.
    """
    if not prompt or not prompt.strip():
        return VectorScoreResult(
            is_threat=False,
            confidence_score=0.0,
            threat_category=None,
            centroid_similarity=0.0,
            explanation=None
        )

    # 1. Vectorize input prompt mathematically
    prompt_vec = _generate_subword_ngrams(prompt)

    best_category = None
    best_similarity = 0.0
    best_meta = None

    # 2. Compute Cosine Distance across dynamically loaded centroids
    for cat_id, centroid_vec in _PRECOMPUTED_CENTROID_VECTORS.items():
        similarity = _cosine_similarity(prompt_vec, centroid_vec)
        meta = _DYNAMIC_CENTROIDS.get(cat_id, {})
        threshold = meta.get("threshold", 0.25)

        if similarity >= threshold and similarity > best_similarity:
            best_similarity = similarity
            best_category = cat_id
            best_meta = meta

    if best_category and best_meta:
        confidence = min(0.99, best_similarity * 1.5)
        return VectorScoreResult(
            is_threat=True,
            confidence_score=round(confidence, 2),
            threat_category=best_category,
            centroid_similarity=round(best_similarity, 3),
            explanation=f"Universal Vector Alignment: Aligned with {best_meta.get('label', best_category)} (Cosine Similarity: {best_similarity:.2f})"
        )

    return VectorScoreResult(
        is_threat=False,
        confidence_score=0.0,
        threat_category=None,
        centroid_similarity=0.0,
        explanation=None
    )
