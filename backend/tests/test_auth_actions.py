import re

import pytest


@pytest.mark.asyncio
async def test_email_verification_uses_action_token_and_updates_account(client, monkeypatch):
    sent_messages = []

    async def capture_email(*, to, subject, body_html):
        sent_messages.append({"to": to, "subject": subject, "body": body_html})
        return True

    monkeypatch.setattr("app.utils.email.send_email", capture_email)
    registered = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "verify-me@example.com",
            "username": "verify_me",
            "full_name": "Verify Me",
            "password": "secure-password-123",
        },
    )
    assert registered.status_code == 201
    assert sent_messages[0]["to"] == "verify-me@example.com"

    token = re.search(r"token=([^&'\"]+)", sent_messages[0]["body"]).group(1)
    verified = await client.post(f"/api/v1/auth/verify-email/{token}")
    assert verified.status_code == 200
    assert verified.json()["message"] == "Email verified successfully"

    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "verify-me@example.com", "password": "secure-password-123"},
    )
    assert login.status_code == 200
    assert "access_token" in login.cookies
    assert "refresh_token" in login.cookies

    wrong_action = await client.post(f"/api/v1/auth/verify-email/{login.cookies['access_token']}")
    assert wrong_action.status_code == 400


@pytest.mark.asyncio
async def test_password_reset_keeps_response_generic_and_revokes_existing_sessions(
    client,
    monkeypatch,
    auth_headers,
    test_user,
):
    sent_messages = []

    async def capture_email(*, to, subject, body_html):
        sent_messages.append({"to": to, "subject": subject, "body": body_html})
        return True

    monkeypatch.setattr("app.utils.email.send_email", capture_email)

    existing_account = await client.post(
        "/api/v1/auth/password-reset",
        json={"email": test_user.email},
    )
    unknown_account = await client.post(
        "/api/v1/auth/password-reset",
        json={"email": "unknown@example.com"},
    )
    assert existing_account.status_code == unknown_account.status_code == 200
    assert existing_account.json() == unknown_account.json()
    assert len(sent_messages) == 1

    token = re.search(r"token=([^&'\"]+)", sent_messages[0]["body"]).group(1)
    reset = await client.post(
        "/api/v1/auth/password-reset/confirm",
        json={"token": token, "new_password": "new-secure-password-456"},
    )
    assert reset.status_code == 200

    revoked_session = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert revoked_session.status_code == 401

    login = await client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "new-secure-password-456"},
    )
    assert login.status_code == 200

    token_reuse = await client.post(
        "/api/v1/auth/password-reset/confirm",
        json={"token": token, "new_password": "another-password-789"},
    )
    assert token_reuse.status_code == 400
