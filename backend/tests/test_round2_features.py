"""
Unit Tests for Final Round 2 Features:
1. Bias & Toxicity Evaluator
2. Feedback Loop & Auto-Tuning Endpoint
3. Trustworthiness Index Analytics
4. Action Risk & Geographic Policies
"""

from fastapi.testclient import TestClient
from app.connector.evaluators.bias_safety import scan_bias_and_toxicity
from app.main import app

client = TestClient(app)


def test_bias_evaluator():
    res = scan_bias_and_toxicity("This is a racist and bigoted statement")
    assert res["has_bias"] is True
    assert "hate_speech" in res["detected_types"]
    assert len(res["risk_findings"]) > 0


def test_feedback_loop_endpoint():
    # First create a test check to generate a finding
    check_res = client.post("/api/v1/resources/res_demo/check", json={"user_prompt": "my email is test@domain.com"})
    assert check_res.status_code == 200
    fid = check_res.json()["interception_id"]

    # Submit feedback for this finding
    fb_res = client.post(f"/api/v1/findings/{fid}/feedback", json={"feedback_type": "false_positive", "notes": "Test false positive feedback"})
    assert fb_res.status_code == 200
    fb_data = fb_res.json()
    assert fb_data["status"] == "false_positive"
    assert fb_data["auto_tune_applied"] is True


def test_trustworthiness_analytics_metrics():
    res = client.get("/api/v1/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert "trustworthiness_score" in data
    assert "false_positive_rate_percent" in data
    assert "false_negative_rate_percent" in data
    assert data["trustworthiness_score"] >= 80.0
