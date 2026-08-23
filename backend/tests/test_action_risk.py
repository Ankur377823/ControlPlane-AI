"""
Unit Tests for Agent Action Risk Evaluator and Tool Call Interception
"""

from fastapi.testclient import TestClient
from app.connector.evaluators.action_risk import evaluate_action_risk
from app.main import app

client = TestClient(app)


def test_evaluator_low_risk():
    res = evaluate_action_risk({"name": "search_web", "parameters": {"query": "weather in Tokyo"}})
    assert res["action_risk_tier"] == "LOW"
    assert res["action"] == "ALLOW"


def test_evaluator_medium_risk():
    res = evaluate_action_risk({"name": "send_email", "parameters": {"to": "boss@acme.com"}})
    assert res["action_risk_tier"] == "MEDIUM"
    assert res["action"] == "MONITOR"


def test_evaluator_high_risk_confirm_required():
    res = evaluate_action_risk({"name": "delete_file", "parameters": {"path": "/var/log/app.log"}})
    assert res["action_risk_tier"] == "HIGH"
    assert res["action"] == "CONFIRM_REQUIRED"


def test_evaluator_critical_risk_blocked():
    res = evaluate_action_risk({"name": "transfer_money", "parameters": {"amount": 50000, "to_account": "ACC999"}})
    assert res["action_risk_tier"] == "CRITICAL"
    assert res["action"] == "BLOCK"


def test_api_check_tool_call_interception():
    payload = {
        "user_prompt": "Clean up logs and delete app data",
        "tool_call": {
            "name": "delete_file",
            "parameters": {"path": "/data/db.sqlite"}
        }
    }
    response = client.post("/api/v1/resources/res_demo/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "CONFIRM_REQUIRED"
    assert data["action_risk_tier"] == "HIGH"
    assert len(data["risk_findings"]) > 0
