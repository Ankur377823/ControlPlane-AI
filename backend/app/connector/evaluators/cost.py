"""
Cost & Compute Analyzer ($ Metric).

Estimates token count, evaluates query cost efficiency, and alerts if
input/output volume exceeds configured policy bounds.
"""

from __future__ import annotations

from typing import NamedTuple


class CostResult(NamedTuple):
    estimated_tokens: int
    cost_score: float  # 0.0 (wasteful/expensive) to 1.0 (efficient)
    exceeds_budget: bool
    reason: str | None


def analyze_cost(
    prompt: str | None, response: str | None, max_token_limit: int = 2048
) -> CostResult:
    prompt_len = len(prompt or "")
    response_len = len(response or "")

    # Rough heuristic: ~4 characters per token
    est_tokens = (prompt_len + response_len) // 4

    cost_score = 1.0
    reason = None
    exceeds_budget = False

    if est_tokens > max_token_limit:
        cost_score = max(0.2, 1.0 - (est_tokens - max_token_limit) / max_token_limit)
        exceeds_budget = True
        reason = f"Estimated token count ({est_tokens}) exceeds maximum budget limit ({max_token_limit})."
    elif est_tokens > (max_token_limit * 0.75):
        cost_score = 0.75
        reason = f"High token usage warning: {est_tokens} tokens estimated."

    return CostResult(
        estimated_tokens=est_tokens,
        cost_score=round(cost_score, 2),
        exceeds_budget=exceeds_budget,
        reason=reason,
    )
