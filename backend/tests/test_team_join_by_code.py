from datetime import datetime, timedelta, timezone

import pytest


@pytest.mark.asyncio
async def test_join_by_code_is_authenticated_and_uses_existing_event_rules(
    client,
    admin_headers,
    auth_headers,
    second_user_headers,
):
    now = datetime.now(timezone.utc)
    event_response = await client.post(
        "/api/v1/events/",
        headers=admin_headers,
        json={
            "title": "Invite code workflow",
            "start_date": (now + timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
            "min_team_size": 1,
            "max_team_size": 2,
        },
    )
    assert event_response.status_code == 201
    event_id = event_response.json()["id"]
    published = await client.patch(
        f"/api/v1/events/{event_id}/status?new_status=published",
        headers=admin_headers,
    )
    assert published.status_code == 200

    team_response = await client.post(
        f"/api/v1/events/{event_id}/teams/",
        headers=auth_headers,
        json={"name": "Code join team"},
    )
    assert team_response.status_code == 201
    team = team_response.json()

    anonymous = await client.post(
        "/api/v1/teams/join",
        json={"invitation_code": team["invitation_code"]},
    )
    assert anonymous.status_code == 401

    invalid = await client.post(
        "/api/v1/teams/join",
        headers=second_user_headers,
        json={"invitation_code": "NOPE1234"},
    )
    assert invalid.status_code == 404
    assert invalid.json()["detail"] == "Invalid invitation code"

    malformed = await client.post(
        "/api/v1/teams/join",
        headers=second_user_headers,
        json={"invitation_code": "not a code"},
    )
    assert malformed.status_code == 422

    joined = await client.post(
        "/api/v1/teams/join",
        headers=second_user_headers,
        json={"invitation_code": team["invitation_code"]},
    )
    assert joined.status_code == 200
    assert joined.json()["team_id"] == team["id"]
    assert joined.json()["status"] == "accepted"


@pytest.mark.asyncio
async def test_team_join_code_attempts_are_rate_limited(client, auth_headers):
    for _ in range(10):
        response = await client.post(
            "/api/v1/teams/join",
            headers=auth_headers,
            json={"invitation_code": "NOPE1234"},
        )
        assert response.status_code == 404

    limited = await client.post(
        "/api/v1/teams/join",
        headers=auth_headers,
        json={"invitation_code": "NOPE1234"},
    )
    assert limited.status_code == 429
