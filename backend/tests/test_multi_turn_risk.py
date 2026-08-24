"""
Unit Tests for Cumulative Multi-Turn Session Risk Evaluator
"""

from app.connector.evaluators.multi_turn_risk import update_multi_turn_risk, reset_session_risk, get_session_risk_state


def test_single_turn_normal():
    session_id = "sess_unit_test_01"
    reset_session_risk(session_id)
    
    res = update_multi_turn_risk(session_id, turn_risk_score=15.0, findings=[])
    assert res["turn_index"] == 1
    assert res["cumulative_risk_score"] == 7.5
    assert res["is_escalated"] is False
    assert res["escalation_action"] == "ALLOW"


def test_multi_turn_risk_accumulation_and_escalation():
    session_id = "sess_unit_test_02"
    reset_session_risk(session_id)

    # Turn 1: Moderate risk finding
    res1 = update_multi_turn_risk(session_id, turn_risk_score=50.0, findings=[{"severity": "MEDIUM"}])
    assert res1["turn_index"] == 1
    assert res1["cumulative_risk_score"] == 25.0

    # Turn 2: High risk finding
    res2 = update_multi_turn_risk(session_id, turn_risk_score=70.0, findings=[{"severity": "HIGH"}])
    assert res2["turn_index"] == 2
    # 0.85 * 25 + 35 = 21.25 + 35 = 56.25
    assert res2["cumulative_risk_score"] >= 50.0

    # Turn 3: Repeated high risk probing -> triggers escalation
    res3 = update_multi_turn_risk(session_id, turn_risk_score=75.0, findings=[{"severity": "HIGH"}])
    assert res3["turn_index"] == 3
    assert res3["is_escalated"] is True
    assert res3["escalation_action"] in ("CONFIRM_REQUIRED", "BLOCK")
