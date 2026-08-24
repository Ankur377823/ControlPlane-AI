"""
Unit Tests for Human Review Queue & Trustworthiness Analytics APIs
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_review_queue():
    res = client.get("/api/v1/findings/review-queue")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)


def test_review_decision_lifecycle():
    # 1. Trigger an interception to generate a finding
    check_res = client.post(
        "/api/v1/resources/res_demo/check",
        json={"user_prompt": "My credit card is 4532-1234-5678-9012"}
    )
    assert check_res.status_code == 200
    fid = check_res.json()["interception_id"]

    # 2. Submit Review Decision (Approve)
    review_res = client.post(
        f"/api/v1/findings/{fid}/review",
        json={
            "decision": "approve",
            "reviewer_notes": "Verified harmless test card token",
            "reviewer_id": "usr_compliance_officer"
        }
    )
    assert review_res.status_code == 200
    rev_data = review_res.json()
    assert rev_data["status"] == "approved"
    assert rev_data["decision"] == "approve"


def test_trustworthiness_analytics_endpoint():
    res = client.get("/api/v1/analytics/trustworthiness")
    assert res.status_code == 200
    data = res.json()
    assert "trustworthiness_score" in data
    assert "precision_percent" in data
    assert "recall_percent" in data
    assert "false_positive_rate_percent" in data
    assert "false_negative_rate_percent" in data
    assert "detector_accuracies" in data
    assert data["trustworthiness_score"] >= 80.0
