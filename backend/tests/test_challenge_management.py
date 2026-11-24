from datetime import datetime, timedelta, timezone

import pytest


async def create_event(client, organizer_headers, title):
    now = datetime.now(timezone.utc)
    response = await client.post(
        "/api/v1/events/",
        headers=organizer_headers,
        json={
            "title": title,
            "start_date": (now + timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
        },
    )
    assert response.status_code == 201
    event_id = response.json()["id"]
    published = await client.patch(
        f"/api/v1/events/{event_id}/status?new_status=published",
        headers=organizer_headers,
    )
    assert published.status_code == 200
    return event_id


@pytest.mark.asyncio
async def test_organizer_can_manage_challenge_and_category_for_owned_event(
    client,
    organizer_headers,
    second_user_headers,
):
    event_id = await create_event(client, organizer_headers, "Owned challenge event")

    forbidden = await client.post(
        f"/api/v1/events/{event_id}/challenges/categories",
        headers=second_user_headers,
        json={"name": "Unauthorized category", "order": 1},
    )
    assert forbidden.status_code == 403

    category = await client.post(
        f"/api/v1/events/{event_id}/challenges/categories",
        headers=organizer_headers,
        json={"name": "Community", "description": "Local solutions", "order": 1},
    )
    assert category.status_code == 201
    category_id = category.json()["id"]

    listed_categories = await client.get(f"/api/v1/events/{event_id}/challenges/categories")
    assert listed_categories.status_code == 200
    assert [item["name"] for item in listed_categories.json()] == ["Community"]

    criteria = await client.post(
        f"/api/v1/events/{event_id}/challenges/criteria",
        headers=organizer_headers,
        json={
            "challenge_category_id": category_id,
            "name": "Impact",
            "max_score": 10,
            "weight": 2,
        },
    )
    assert criteria.status_code == 201

    challenge_payload = {
        "category_id": category_id,
        "title": "Improve local transport",
        "description": "Build a practical prototype",
        "requirements": "Include a working demo",
        "documentation_url": "https://example.com/brief",
    }
    created = await client.post(
        f"/api/v1/events/{event_id}/challenges/",
        headers=organizer_headers,
        json=challenge_payload,
    )
    assert created.status_code == 201
    challenge_id = created.json()["id"]

    visible = await client.get(f"/api/v1/events/{event_id}/challenges/{challenge_id}")
    assert visible.status_code == 200
    assert visible.json()["title"] == challenge_payload["title"]

    update_payload = {**challenge_payload, "title": "Safer local transport"}
    updated = await client.put(
        f"/api/v1/events/{event_id}/challenges/{challenge_id}",
        headers=organizer_headers,
        json=update_payload,
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Safer local transport"

    deleted = await client.delete(
        f"/api/v1/events/{event_id}/challenges/{challenge_id}",
        headers=organizer_headers,
    )
    assert deleted.status_code == 204
    missing = await client.get(f"/api/v1/events/{event_id}/challenges/{challenge_id}")
    assert missing.status_code == 404


@pytest.mark.asyncio
async def test_challenge_category_cannot_be_reused_across_events(client, organizer_headers):
    event_id = await create_event(client, organizer_headers, "First challenge event")
    other_event_id = await create_event(client, organizer_headers, "Second challenge event")
    category = await client.post(
        f"/api/v1/events/{event_id}/challenges/categories",
        headers=organizer_headers,
        json={"name": "First category", "order": 1},
    )

    response = await client.post(
        f"/api/v1/events/{other_event_id}/challenges/",
        headers=organizer_headers,
        json={"category_id": category.json()["id"], "title": "Cross-event challenge"},
    )
    assert response.status_code == 404
