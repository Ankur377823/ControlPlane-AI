"""
Cumulative Multi-Turn Session Risk Evaluator for ControlPlane AI

Tracks risk accumulation and escalation across multi-turn conversation sessions.
Prevents "salami slicing" attacks, gradual prompt injection probing, and escalating toxicity.
"""

from __future__ import annotations

import time
import math
from typing import Dict, Any, List, Optional

# In-memory session tracking cache (backed by session ID)
_SESSION_RISK_CACHE: Dict[str, Dict[str, Any]] = {}


def get_session_risk_state(session_id: str) -> Dict[str, Any]:
    """Retrieve existing session trajectory or initialize a fresh state."""
    clean_id = (session_id or "sess_default").strip()
    if clean_id not in _SESSION_RISK_CACHE:
        _SESSION_RISK_CACHE[clean_id] = {
            "session_id": clean_id,
            "turns_count": 0,
            "cumulative_risk_score": 0.0,
            "max_turn_risk": 0.0,
            "turn_history": [],
            "last_active_ts": time.time(),
            "flags_count": 0,
            "status": "normal",
        }
    return _SESSION_RISK_CACHE[clean_id]


def update_multi_turn_risk(
    session_id: str,
    turn_risk_score: float,
    findings: List[Dict[str, Any]],
    decay_factor: float = 0.85,
    escalation_threshold: float = 65.0
) -> Dict[str, Any]:
    """
    Update session state with the current turn's risk score and evaluate cumulative trajectory.
    
    Formula:
      Accumulated_Risk = (decay_factor * Previous_Accumulated_Risk) + (turn_risk_score * 0.5)
    """
    state = get_session_risk_state(session_id)
    now = time.time()
    
    # Time decay: if more than 30 minutes since last turn, decay heavily
    time_delta_sec = max(0.0, now - state["last_active_ts"])
    if time_delta_sec > 1800:
        state["cumulative_risk_score"] *= 0.3
    
    # Calculate new cumulative risk
    prev_accum = state["cumulative_risk_score"]
    new_accum = round((decay_factor * prev_accum) + (turn_risk_score * 0.5), 2)
    
    has_high_finding = any(f.get("severity") in ("HIGH", "CRITICAL") for f in findings)
    flags_count = state["flags_count"] + (1 if has_high_finding or turn_risk_score >= 50 else 0)
    
    turns_count = state["turns_count"] + 1
    max_turn_risk = max(state["max_turn_risk"], turn_risk_score)
    
    # Multi-turn escalation condition:
    # 1. Cumulative score exceeds threshold
    # 2. Repeated probing (3+ suspicious turns)
    is_escalated = (new_accum >= escalation_threshold) or (flags_count >= 3 and turns_count <= 6)
    
    risk_level = "LOW"
    escalation_action = "ALLOW"
    
    if is_escalated:
        risk_level = "CRITICAL" if new_accum >= 85.0 else "HIGH"
        escalation_action = "BLOCK" if new_accum >= 85.0 else "CONFIRM_REQUIRED"
    elif new_accum >= 40.0:
        risk_level = "MEDIUM"
        escalation_action = "MONITOR"

    # Update cache
    state["turns_count"] = turns_count
    state["cumulative_risk_score"] = min(100.0, new_accum)
    state["max_turn_risk"] = max_turn_risk
    state["flags_count"] = flags_count
    state["last_active_ts"] = now
    state["status"] = "escalated" if is_escalated else "normal"
    state["turn_history"].append({
        "turn": turns_count,
        "turn_risk_score": turn_risk_score,
        "cumulative_risk_score": new_accum,
        "timestamp": now,
        "findings_count": len(findings)
    })
    
    # Keep history bounded
    if len(state["turn_history"]) > 20:
        state["turn_history"] = state["turn_history"][-20:]

    return {
        "session_id": session_id,
        "turn_index": turns_count,
        "turn_risk_score": turn_risk_score,
        "cumulative_risk_score": min(100.0, new_accum),
        "is_escalated": is_escalated,
        "risk_level": risk_level,
        "escalation_action": escalation_action,
        "flags_count": flags_count
    }


def reset_session_risk(session_id: str) -> None:
    """Clear or reset session tracking on explicit session reset."""
    clean_id = (session_id or "").strip()
    if clean_id in _SESSION_RISK_CACHE:
        del _SESSION_RISK_CACHE[clean_id]
