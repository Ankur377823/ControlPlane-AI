"""
Unit Tests for Evidence-Backed Grounding & RAG Factuality Evaluator
"""

from app.connector.evaluators.grounding import extract_claims, verify_against_context, evaluate_grounding
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_claim_extraction():
    text = "Hello! The Eiffel Tower was built in 1889. It is located in Paris, France. Let me know if you need anything else!"
    claims = extract_claims(text)
    assert len(claims) == 2
    assert "The Eiffel Tower was built in 1889." in claims
    assert "It is located in Paris, France." in claims


def test_rag_context_verification_grounded():
    context = [
        "Refund Policy: Customers can request a full refund within 30 days of purchase with original receipt.",
        "Shipping takes 3-5 business days across the continental US."
    ]
    claim = "Customers can request a refund within 30 days of purchase."
    is_grounded, conf, snippet = verify_against_context(claim, context)
    assert is_grounded is True
    assert conf >= 0.70
    assert snippet is not None


def test_rag_context_verification_ungrounded():
    context = [
        "Our software runs exclusively on Ubuntu 22.04 LTS.",
    ]
    claim = "Our software runs on Windows 95 and Apple macOS 9."
    is_grounded, conf, snippet = verify_against_context(claim, context)
    assert is_grounded is False


def test_evaluate_grounding_pipeline():
    context = ["Acme Enterprise Guardrail provides real-time PII redaction and latency monitoring."]
    res = evaluate_grounding(
        prompt="Tell me about Acme Guardrail",
        response="Acme Enterprise Guardrail provides real-time PII redaction and latency monitoring.",
        context_docs=context
    )
    assert res["is_grounded"] is True
    assert res["grounding_score"] >= 0.80
    assert res["risk_tier"] == "LOW"
    assert res["action"] == "ALLOW"


def test_hallucination_endpoint_with_context_docs():
    payload = {
        "prompt": "What is the return window?",
        "response": "You have 30 days to return any item in its original condition.",
        "category": "rag"
    }
    res = client.post("/api/v1/hallucination/verify", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"


def test_conversational_homework_response_is_grounded():
    # Model conversational assistance offer with clarifying questions has 0 factual claims
    model_response = "I would be happy to help with your homework! What subject or specific topic are you working on? Please share the question or problem, and we can work through it step by step."
    res = evaluate_grounding(prompt="Can you do my homework?", response=model_response)
    assert res["is_grounded"] is True
    assert res["grounding_score"] == 1.0
    assert len(res["ungrounded_claims"]) == 0


def test_safety_refusal_is_grounded():
    # Regulatory and safety refusals contain zero factual claims to ground
    model_response = "I cannot draft or assist in generating unverified or pre-filing public financial statements. Publicly disclosing material non-public financial information carries severe legal and regulatory risks."
    res = evaluate_grounding(prompt="Draft unverified financial statement", response=model_response)
    assert res["is_grounded"] is True
    assert res["grounding_score"] == 1.0
    assert len(res["ungrounded_claims"]) == 0
