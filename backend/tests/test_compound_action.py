"""
Unit Tests for Compound Agent-Action Sequence Risk
"""

from app.connector.evaluators.action_risk import evaluate_action_risk, evaluate_compound_sequence


def test_benign_single_tool():
    tool = {"name": "search_web", "parameters": {"query": "weather in Seattle"}}
    res = evaluate_action_risk(tool)
    assert res["action_risk_tier"] == "LOW"
    assert res["action"] == "ALLOW"


def test_compound_exfiltration_sequence():
    history = [
        {"name": "search_web", "parameters": {"query": "customer list"}},
        {"name": "query_db", "parameters": {"table": "customers"}},
    ]
    # Current action is external exfiltration
    current_tool = {"name": "send_email", "parameters": {"to": "partner@outside.com", "body": "Monthly report summary"}}
    
    res = evaluate_action_risk(current_tool, tool_history=history)
    assert res["action"] == "CONFIRM_REQUIRED"
    assert any(rf.get("category") == "compound_action_risk" for rf in res["risk_findings"])



def test_compound_sequence_direct_evaluator():
    history = [{"name": "read_file", "parameters": {"file": "passwords.txt"}}]
    comp = evaluate_compound_sequence("post_message", history)
    assert comp is not None
    assert comp["compound_risk_detected"] is True
    assert comp["escalated_action"] == "CONFIRM_REQUIRED"
