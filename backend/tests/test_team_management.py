from datetime import datetime, timedelta, timezone
from uuid import UUID

import pytest
from sqlalchemy import select

from app.models.team import TeamMember


async def create_published_event(client, admin_headers):
    now = datetime.now(timezone.utc)
    response = await client.post(
        "/api/v1/events/",
        headers=admin_headers,
        json={
            "title": "Team management workflow",
            "start_date": (now + timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
            "min_team_size": 1,
            "max_team_size": 4,
        },
    )
    assert response.status_code == 201
    event_id = response.json()["id"]
    published = await client.patch(
        f"/api/v1/events/{event_id}/status?new_status=published",
        headers=admin_headers,
    )
    assert published.status_code == 200
    return event_id


@pytest.mark.asyncio
async def test_team_leadership_transfer_and_member_exit(
    client,
    admin_headers,
    auth_headers,
    second_user_headers,
    second_user,
):
    event_id = await create_published_event(client, admin_headers)
    created = await client.post(
        f"/api/v1/events/{event_id}/teams/",
        headers=auth_headers,
        json={"name": "Orbit Builders"},
    )
    assert created.status_code == 201
    team_id = created.json()["id"]

    joined = await client.post(
        f"/api/v1/events/{event_id}/teams/join",
        headers=second_user_headers,
        json={"invitation_code": created.json()["invitation_code"]},
    )
    assert joined.status_code == 200

    private_lookup = await client.get(f"/api/v1/teams/{team_id}", headers=second_user_headers)
    assert private_lookup.status_code == 200
    anonymous_lookup = await client.get(f"/api/v1/teams/{team_id}")
    assert anonymous_lookup.status_code == 401

    transfer = await client.post(
        f"/api/v1/events/{event_id}/teams/{team_id}/transfer-leadership",
        headers=auth_headers,
        json={"new_leader_id": str(second_user.id)},
    )
    assert transfer.status_code == 200
    assert transfer.json()["leader_id"] == str(second_user.id)

    old_leader_exit = await client.delete(
        f"/api/v1/events/{event_id}/teams/{team_id}/leave",
        headers=auth_headers,
    )
    assert old_leader_exit.status_code == 204

    new_leader_exit = await client.delete(
        f"/api/v1/events/{event_id}/teams/{team_id}/leave",
        headers=second_user_headers,
    )
    assert new_leader_exit.status_code == 400

    my_teams = await client.get("/api/v1/teams/", headers=auth_headers)
    assert my_teams.status_code == 200
    assert all(team["id"] != team_id for team in my_teams.json())


@pytest.mark.asyncio
async def test_only_team_leader_can_remove_a_member(
    client,
    db_session,
    admin_headers,
    auth_headers,
    second_user_headers,
):
    event_id = await create_published_event(client, admin_headers)
    created = await client.post(
        f"/api/v1/events/{event_id}/teams/",
        headers=auth_headers,
        json={"name": "Removal workflow"},
    )
    team_id = created.json()["id"]
    joined = await client.post(
        f"/api/v1/events/{event_id}/teams/join",
        headers=second_user_headers,
        json={"invitation_code": created.json()["invitation_code"]},
    )
    assert joined.status_code == 200
    member_id = joined.json()["id"]

    forbidden = await client.delete(
        f"/api/v1/events/{event_id}/teams/{team_id}/members/{member_id}",
        headers=second_user_headers,
    )
    assert forbidden.status_code == 403

    removed = await client.delete(
        f"/api/v1/events/{event_id}/teams/{team_id}/members/{member_id}",
        headers=auth_headers,
    )
    assert removed.status_code == 204
    remaining_members = await db_session.scalars(select(TeamMember).where(TeamMember.id == UUID(member_id)))
    assert remaining_members.first() is None
