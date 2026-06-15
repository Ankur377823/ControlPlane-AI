"""
A minimal mock of the Botpress Chat API (`https://chat.botpress.cloud/{webhook_id}`),
implemented as a FastAPI app so it can be driven via httpx's ASGITransport in
integration tests with zero real network calls.

Simulated webhook IDs (used by test_api.py / test_scanner.py):

  "valid-webhook"        -- normal flow. Bot replies after REPLY_AFTER_POLLS
                             calls to list_messages (simulates async delay).
  "missing-webhook"      -- /hello returns 404 (webhook not found / not published)
  "rate-limited-webhook" -- every call returns 429 (quota exceeded)
  "slow-webhook"         -- bot NEVER replies (used for timeout test)
"""

from __future__ import annotations

import uuid

from fastapi import FastAPI, HTTPException, Request

app = FastAPI()

REPLY_AFTER_POLLS = 2

# In-memory state, reset between test runs via reset_state()
_conversations: dict[str, dict] = {}


def reset_state() -> None:
    _conversations.clear()


@app.get("/{webhook_id}/hello")
def hello(webhook_id: str):
    if webhook_id == "missing-webhook":
        raise HTTPException(status_code=404, detail="webhook not found")
    if webhook_id == "rate-limited-webhook":
        raise HTTPException(status_code=429, detail="rate limited")
    return {"status": "ok"}


@app.post("/{webhook_id}/users")
def create_user(webhook_id: str):
    if webhook_id == "rate-limited-webhook":
        raise HTTPException(status_code=429, detail="rate limited")
    return {"user": {"id": "user_1"}, "key": "fake-user-key"}


@app.post("/{webhook_id}/conversations")
def create_conversation(webhook_id: str):
    if webhook_id == "rate-limited-webhook":
        raise HTTPException(status_code=429, detail="rate limited")

    conv_id = "conv_" + uuid.uuid4().hex[:8]
    _conversations[conv_id] = {
        "messages": [],
        "list_calls": 0,
        "webhook_id": webhook_id,
    }
    return {"conversation": {"id": conv_id}}


@app.post("/{webhook_id}/messages")
async def create_message(webhook_id: str, request: Request):
    if webhook_id == "rate-limited-webhook":
        raise HTTPException(status_code=429, detail="rate limited")

    body = await request.json()
    conversation_id = body.get("conversationId")
    if conversation_id not in _conversations:
        raise HTTPException(status_code=404, detail="conversation not found")

    payload = body.get("payload")
    if not payload:
        raise HTTPException(status_code=400, detail="payload is required")

    msg_id = "msg_" + uuid.uuid4().hex[:8]

    _conversations[conversation_id]["messages"].append(
        {
            "id": msg_id,
            "userId": "user_1",
            "payload": payload,
        }
    )

    # Pre-stage the bot's reply, but it only becomes visible to
    # list_messages after REPLY_AFTER_POLLS calls (simulates async delay).
    # "slow-webhook" never stages a reply, to exercise the timeout path.
    if webhook_id != "slow-webhook":
        user_text = (payload or {}).get("text", "")
        reply_text = f"I received: {user_text[:50]}"
        _conversations[conversation_id]["pending_bot_reply"] = {
            "id": "msg_" + uuid.uuid4().hex[:8],
            "userId": "bot_1",
            "payload": {"type": "text", "text": reply_text},
        }

    return {"message": {"id": msg_id}}


@app.get("/{webhook_id}/conversations/{conversation_id}/messages")
def list_messages(webhook_id: str, conversation_id: str):
    if webhook_id == "rate-limited-webhook":
        raise HTTPException(status_code=429, detail="rate limited")

    if conversation_id not in _conversations:
        raise HTTPException(status_code=404, detail="conversation not found")

    conv = _conversations[conversation_id]
    conv["list_calls"] += 1

    messages = list(conv["messages"])

    pending = conv.get("pending_bot_reply")
    if pending and conv["list_calls"] >= REPLY_AFTER_POLLS:
        if not any(m["id"] == pending["id"] for m in conv["messages"]):
            conv["messages"].append(pending)
        messages = list(conv["messages"])

    return {"messages": messages}
