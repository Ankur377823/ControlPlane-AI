import os
import pytest
from fastapi.testclient import TestClient

try:
    from app.main import app
    from app.connector.evaluators.guardian import (
        evaluate_guardian_checks,
        compute_audit_hash,
        DEFAULT_TOOL_REGISTRY,
    )
    from app.models import db
except ImportError:
    from backend.app.main import app
    from backend.app.connector.evaluators.guardian import (
        evaluate_guardian_checks,
        compute_audit_hash,
        DEFAULT_TOOL_REGISTRY,
    )
    from backend.app.models import db

client = TestClient(app)


def test_guardian_checks_all_layers():
    # Test Check 0: Task Token ACL
    res = evaluate_guardian_checks(
        tool_id="delete_database",
        allowed_tools_acl=["web_search", "read_file"]
    )
    assert not res["allowed"]
    assert res["failed_check"] == 0
    assert res["threat_type"] == "TASK_TOKEN_ACL_VIOLATION"

    # Test Check 1: Tool Registry & Revocation
    res = evaluate_guardian_checks(
        tool_id="web_search",
        revoked_tools=["web_search"]
    )
    assert not res["allowed"]
    assert res["failed_check"] == 1
    assert res["threat_type"] == "REVOKED_TOOL"

    # Test Check 2: Capability Boundaries
    res = evaluate_guardian_checks(
        tool_id="spawn_agent_direct"
    )
    assert not res["allowed"]
    assert res["failed_check"] == 2
    assert res["threat_type"] == "CAPABILITY_BOUNDARY_VIOLATION"

    # Test Check 3: Destructive Pattern Detection
    res = evaluate_guardian_checks(
        tool_id="read_file",
        args={"path": "/etc/passwd"}
    )
    assert not res["allowed"]
    assert res["failed_check"] == 3
    assert res["threat_type"] == "PATH_TRAVERSAL"

    res = evaluate_guardian_checks(
        tool_id="read_file",
        args={"query": "sudo rm -rf /"}
    )
    assert not res["allowed"]
    assert res["failed_check"] == 3
    assert res["threat_type"] == "SHELL_INJECTION"

    # Test Check 4: Sequence Contracts
    res = evaluate_guardian_checks(
        tool_id="write_db",
        agent_id="data_pipeline_agent",
        sequence_so_far=["fetch_dataset"]
    )
    assert not res["allowed"]
    assert res["failed_check"] == 4
    assert res["threat_type"] == "SEQUENCE_CONTRACT_VIOLATION"

    # Test Check 5: Hash Integrity
    res = evaluate_guardian_checks(
        tool_id="web_search",
        tool_schema_hash="invalid_hash_value"
    )
    # Since DEFAULT_TOOL_REGISTRY has None as default, it passes.
    # Let's override it or test with a tool that checks hash.
    # Since DEFAULT_TOOL_REGISTRY hash defaults to None, let's register a hash.
    DEFAULT_TOOL_REGISTRY["web_search"]["hash"] = "valid_sha256_hash"
    res = evaluate_guardian_checks(
        tool_id="web_search",
        tool_schema_hash="invalid_hash_value"
    )
    assert not res["allowed"]
    assert res["failed_check"] == 5
    assert res["threat_type"] == "TOOL_TAMPER_DETECTED"
    # Reset
    DEFAULT_TOOL_REGISTRY["web_search"]["hash"] = None

    # Test Check 6: Adaptive Rules
    res = evaluate_guardian_checks(
        tool_id="web_search",
        args={"query": "restricted content query"},
        adaptive_rules=[
            {
                "name": "Restricted Query Rule",
                "pattern": "restricted content",
                "action": "halt"
            }
        ]
    )
    assert not res["allowed"]
    assert res["failed_check"] == 6
    assert res["threat_type"] == "ADAPTIVE_RULE_VIOLATION"

    # Test Check All Clean
    res = evaluate_guardian_checks(
        tool_id="web_search",
        args={"query": "normal clean query"}
    )
    assert res["allowed"]
    assert res["failed_check"] is None


def test_guardian_api_compatibility(monkeypatch):
    # Set Auth Requirement
    monkeypatch.setenv("GUARDIAN_REQUIRE_AUTH", "true")
    monkeypatch.setenv("TASK_TOKEN_SECRET", "super_secret_auth_token_value")

    # 1. Unauthenticated Request should fail
    resp = client.post("/check", json={"tool_id": "web_search", "args": {}})
    assert resp.status_code == 401

    # 2. Invalid Token Request should fail
    resp = client.post(
        "/check",
        json={"tool_id": "web_search", "args": {}},
        headers={"Authorization": "Bearer bad_token"}
    )
    assert resp.status_code == 403

    # 3. Valid Authenticated Request (Allowed Tool)
    resp = client.post(
        "/check",
        json={
            "tool_id": "web_search",
            "args": {"query": "clean query"},
            "agent_id": "support_agent",
            "sequence_so_far": []
        },
        headers={"Authorization": "Bearer super_secret_auth_token_value"}
    )
    assert resp.status_code == 200
    assert resp.json()["allowed"] is True

    # 4. Valid Authenticated Request (Blocked Tool - Destructive Pattern)
    resp = client.post(
        "/check",
        json={
            "tool_id": "run_script",
            "args": {"command": "cat /etc/passwd"},
        },
        headers={"Authorization": "Bearer super_secret_auth_token_value"}
    )
    assert resp.status_code == 200
    assert resp.json()["allowed"] is False
    assert resp.json()["threat_type"] == "PATH_TRAVERSAL"


def test_guardian_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_hash_chain_tamper_evidence():
    # Setup test resource
    db.init_db()
    res_id = "res_test_hash"
    db.create_resource({
        "id": res_id,
        "account_name": "Test Account",
        "resource_name": "Test Resource",
        "webhook_id": "test-webhook"
    })

    # Log 3 interceptions and verify they chain properly
    ic1 = db.log_interception(
        resource_id=res_id,
        user_prompt="Prompt 1",
        raw_response="Response 1",
        sanitized_prompt="Prompt 1",
        sanitized_response="Response 1",
        action="ALLOW",
        enforcement_mode="monitor",
        latency_ms=10,
        performance_score=100.0,
        cost_score=100.0,
        responsibility_score=100.0,
        triggered_rules=[],
        risk_findings=[]
    )
    assert ic1["hash_chain"] is not None

    ic2 = db.log_interception(
        resource_id=res_id,
        user_prompt="Prompt 2",
        raw_response="Response 2",
        sanitized_prompt="Prompt 2",
        sanitized_response="Response 2",
        action="ALLOW",
        enforcement_mode="monitor",
        latency_ms=10,
        performance_score=100.0,
        cost_score=100.0,
        responsibility_score=100.0,
        triggered_rules=[],
        risk_findings=[]
    )
    assert ic2["hash_chain"] is not None
    assert ic2["hash_chain"] != ic1["hash_chain"]

    # Verify manual hash matching of the chain
    expected_ic2_hash = compute_audit_hash(
        ic1["hash_chain"],
        {
            "id": ic2["id"],
            "resource_id": ic2["resource_id"],
            "user_prompt": ic2["user_prompt"],
            "raw_response": ic2["raw_response"],
            "action": ic2["action"],
            "enforcement_mode": ic2["enforcement_mode"],
            "session_id": ic2["session_id"],
            "tenant_id": ic2["tenant_id"]
        }
    )
    assert ic2["hash_chain"] == expected_ic2_hash
