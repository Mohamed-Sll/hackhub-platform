from datetime import datetime, timedelta, timezone

import pytest


async def create_published_event(client, admin_headers, *, title="Registration test"):
    now = datetime.now(timezone.utc)
    response = await client.post(
        "/api/v1/events/",
        headers=admin_headers,
        json={
            "title": title,
            "start_date": (now + timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
        },
    )
    event_id = response.json()["id"]
    published = await client.patch(
        f"/api/v1/events/{event_id}/status?new_status=published",
        headers=admin_headers,
    )
    assert published.status_code == 200
    return event_id


@pytest.mark.asyncio
async def test_public_registration_needs_no_account_and_is_unique_per_email(client, admin_headers):
    event_id = await create_published_event(client, admin_headers)

    first = await client.post(
        f"/api/v1/events/{event_id}/registrations",
        json={"full_name": "  Ada Lovelace  ", "email": "ADA@example.com"},
    )
    duplicate = await client.post(
        f"/api/v1/events/{event_id}/registrations",
        json={"full_name": "Ada Lovelace", "email": "ada@example.com"},
    )

    assert first.status_code == 201
    assert first.json() == {"message": "Your registration has been received."}
    assert duplicate.status_code == 409


@pytest.mark.asyncio
async def test_registration_roster_is_private_and_removable(client, admin_headers, auth_headers):
    event_id = await create_published_event(client, admin_headers)
    registered = await client.post(
        f"/api/v1/events/{event_id}/registrations",
        json={"full_name": "Grace Hopper", "email": "grace@example.com"},
    )
    assert registered.status_code == 201

    anonymous = await client.get(f"/api/v1/events/{event_id}/registrations")
    participant = await client.get(f"/api/v1/events/{event_id}/registrations", headers=auth_headers)
    owner = await client.get(f"/api/v1/events/{event_id}/registrations", headers=admin_headers)

    assert anonymous.status_code == 401
    assert participant.status_code == 403
    assert owner.status_code == 200
    assert owner.json()["items"][0]["email"] == "grace@example.com"

    registration_id = owner.json()["items"][0]["id"]
    removed = await client.delete(
        f"/api/v1/events/{event_id}/registrations/{registration_id}",
        headers=admin_headers,
    )
    assert removed.status_code == 204


@pytest.mark.asyncio
async def test_registration_is_closed_for_draft_and_closed_events(client, admin_headers):
    now = datetime.now(timezone.utc)
    draft = await client.post(
        "/api/v1/events/",
        headers=admin_headers,
        json={
            "title": "Draft event",
            "start_date": (now + timedelta(days=3)).isoformat(),
            "end_date": (now + timedelta(days=4)).isoformat(),
        },
    )
    draft_id = draft.json()["id"]
    draft_result = await client.post(
        f"/api/v1/events/{draft_id}/registrations",
        json={"full_name": "Katherine Johnson", "email": "kj@example.com"},
    )
    assert draft_result.status_code == 404

    event_id = await create_published_event(client, admin_headers, title="Closed event")
    await client.patch(f"/api/v1/events/{event_id}/status?new_status=in_progress", headers=admin_headers)
    closed = await client.patch(f"/api/v1/events/{event_id}/status?new_status=closed", headers=admin_headers)
    assert closed.status_code == 200
    closed_result = await client.post(
        f"/api/v1/events/{event_id}/registrations",
        json={"full_name": "Katherine Johnson", "email": "kj@example.com"},
    )
    assert closed_result.status_code == 400
