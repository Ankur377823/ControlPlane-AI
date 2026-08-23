"""
Tests for FacTool Hallucination & Factuality Verification API Route
"""

from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_verify_hallucination_success():
    payload = {
        "prompt": "Introduce Graham Neubig",
        "response": "Graham Neubig is a professor at MIT.",
        "category": "kbqa"
    }

    response = client.post("/api/v1/hallucination/verify", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data
    
    detailed_info = data["data"]["detailed_information"][0]
    assert detailed_info["prompt"] == "Introduce Graham Neubig"
    assert len(detailed_info["claim_level_factuality"]) > 0
    # Check claim breakdown includes false factuality flag for MIT claim
    claim_item = detailed_info["claim_level_factuality"][0]
    assert claim_item["factuality"] is False
    assert "MIT" in claim_item["reasoning"] or "Carnegie Mellon" in claim_item["reasoning"]


def test_verify_hallucination_missing_fields():
    payload = {
        "prompt": "",
        "response": ""
    }
    response = client.post("/api/v1/hallucination/verify", json=payload)
    assert response.status_code == 400
