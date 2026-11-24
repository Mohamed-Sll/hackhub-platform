import hashlib
from datetime import datetime, timedelta, timezone
from uuid import UUID

import pytest

from app.models.certificate import Certificate


@pytest.mark.asyncio
async def test_team_project_evaluation_ranking_and_certificates(
    client,
    db_session,
    admin_headers,
    auth_headers,
    judge_headers,
    second_judge_headers,
):
    now = datetime.now(timezone.utc)
    event_response = await client.post(
        "/api/v1/events/",
        headers=admin_headers,
        json={
            "title": "Workflow Hackathon",
            "start_date": (now + timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
            "min_team_size": 1,
            "max_team_size": 4,
        },
    )
    assert event_response.status_code == 201
    event_id = event_response.json()["id"]
    published_event = await client.patch(
        f"/api/v1/events/{event_id}/status?new_status=published",
        headers=admin_headers,
    )
    assert published_event.status_code == 200

    category_response = await client.post(
        f"/api/v1/events/{event_id}/challenges/categories",
        headers=admin_headers,
        json={"name": "Open Innovation", "order": 1},
    )
    assert category_response.status_code == 201
    category_id = category_response.json()["id"]

    criterion_response = await client.post(
        f"/api/v1/events/{event_id}/challenges/criteria",
        headers=admin_headers,
        json={
            "challenge_category_id": category_id,
            "name": "Impact",
            "max_score": 10,
            "weight": 2,
        },
    )
    assert criterion_response.status_code == 201
    criterion_id = criterion_response.json()["id"]

    challenge_response = await client.post(
        f"/api/v1/events/{event_id}/challenges/",
        headers=admin_headers,
        json={"category_id": category_id, "title": "Build for local communities"},
    )
    assert challenge_response.status_code == 201
    challenge_id = challenge_response.json()["id"]

    team_response = await client.post(
        f"/api/v1/events/{event_id}/teams/",
        headers=auth_headers,
        json={"name": "Builders"},
    )
    assert team_response.status_code == 201
    assert team_response.json()["invitation_code"]

    project_response = await client.post(
        f"/api/v1/events/{event_id}/projects/",
        headers=auth_headers,
        json={
            "challenge_id": challenge_id,
            "name": "Community Link",
            "description": "A working prototype",
            "tech_stack": ["FastAPI", "Next.js"],
        },
    )
    assert project_response.status_code == 201
    project_id = project_response.json()["id"]

    hidden_draft = await client.get(f"/api/v1/events/{event_id}/projects/{project_id}")
    assert hidden_draft.status_code == 404

    submitted = await client.post(
        f"/api/v1/events/{event_id}/projects/{project_id}/submit",
        headers=auth_headers,
    )
    assert submitted.status_code == 200
    assert submitted.json()["status"] == "submitted"

    public_project = await client.get(f"/api/v1/events/{event_id}/projects/{project_id}")
    assert public_project.status_code == 200

    evaluation = await client.post(
        f"/api/v1/events/{event_id}/evaluations/",
        headers=judge_headers,
        json={
            "project_id": project_id,
            "scores": [{"criterion_id": criterion_id, "score": 8}],
            "comment": "Strong execution",
        },
    )
    assert evaluation.status_code == 201
    assert evaluation.json()["total_score"] == 16

    second_evaluation = await client.post(
        f"/api/v1/events/{event_id}/evaluations/",
        headers=second_judge_headers,
        json={
            "project_id": project_id,
            "scores": [{"criterion_id": criterion_id, "score": 6}],
            "comment": "A different judge's private feedback",
        },
    )
    assert second_evaluation.status_code == 201

    private_evaluations = f"/api/v1/events/{event_id}/evaluations/projects/{project_id}"
    assert (await client.get(private_evaluations)).status_code == 401
    assert (await client.get(private_evaluations, headers=auth_headers)).status_code == 403
    judge_view = await client.get(private_evaluations, headers=judge_headers)
    assert judge_view.status_code == 200
    assert [item["comment"] for item in judge_view.json()] == ["Strong execution"]
    second_judge_view = await client.get(private_evaluations, headers=second_judge_headers)
    assert [item["comment"] for item in second_judge_view.json()] == ["A different judge's private feedback"]

    ranking = await client.get(f"/api/v1/events/{event_id}/ranking/")
    assert ranking.status_code == 200
    assert ranking.json()[0]["project_id"] == project_id
    assert ranking.json()[0]["total_score"] == 14
    assert ranking.json()[0]["evaluation_count"] == 2

    generated = await client.post(
        f"/api/v1/certificates/events/{event_id}/generate",
        headers=admin_headers,
    )
    assert generated.status_code == 200

    certificates = await client.get("/api/v1/certificates/my", headers=auth_headers)
    assert certificates.status_code == 200
    assert {item["type"] for item in certificates.json()} == {
        "participation",
        "finalist",
        "winner",
    }

    certificate = certificates.json()[0]
    verification = await client.get(f"/api/v1/certificates/verify/{certificate['verification_code']}")
    assert verification.status_code == 200
    public_certificate = verification.json()
    assert public_certificate["recipient_name"] == "Participant User"
    assert public_certificate["event_title"] == "Workflow Hackathon"
    assert set(public_certificate) == {
        "verification_code",
        "type",
        "recipient_name",
        "event_title",
        "issued_at",
    }

    certificate_record = await db_session.get(Certificate, UUID(certificate["id"]))
    assert certificate_record is not None
    certificate_record.extra_data = {
        **certificate_record.extra_data,
        "event_title": "Tampered event",
    }
    await db_session.flush()
    tampered_verification = await client.get(f"/api/v1/certificates/verify/{certificate['verification_code']}")
    assert tampered_verification.status_code == 404

    legacy_signature_data = (
        f"{certificate_record.user_id}-{certificate_record.event_id}-"
        f"{certificate_record.type.value}-{certificate_record.verification_code}"
    )
    certificate_record.digital_signature = hashlib.sha256(legacy_signature_data.encode()).hexdigest()
    await db_session.flush()
    legacy_verification = await client.get(f"/api/v1/certificates/verify/{certificate['verification_code']}")
    assert legacy_verification.status_code == 200

    download = await client.get(f"/api/v1/certificates/download/{certificate['id']}", headers=auth_headers)
    assert download.status_code == 200
    assert download.headers["content-type"] == "application/pdf"
    assert download.content.startswith(b"%PDF")


@pytest.mark.asyncio
async def test_team_invitation_can_be_accepted_from_notification(
    client,
    admin_headers,
    auth_headers,
    second_user_headers,
    second_user,
):
    now = datetime.now(timezone.utc)
    event = await client.post(
        "/api/v1/events/",
        headers=admin_headers,
        json={
            "title": "Invitation Flow",
            "start_date": (now + timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
            "max_team_size": 3,
        },
    )
    event_id = event.json()["id"]
    published = await client.patch(
        f"/api/v1/events/{event_id}/status?new_status=published",
        headers=admin_headers,
    )
    assert published.status_code == 200
    team = await client.post(
        f"/api/v1/events/{event_id}/teams/",
        headers=auth_headers,
        json={"name": "Inviters"},
    )
    team_id = team.json()["id"]

    invitation = await client.post(
        f"/api/v1/events/{event_id}/teams/{team_id}/invite",
        headers=auth_headers,
        json={"user_id": str(second_user.id)},
    )
    assert invitation.status_code == 200
    member_id = invitation.json()["id"]

    public_team = await client.get(f"/api/v1/events/{event_id}/teams/{team_id}")
    public_members = public_team.json()["members"]
    assert all(member["user_id"] != str(second_user.id) for member in public_members)

    notifications = await client.get("/api/v1/notifications/", headers=second_user_headers)
    invite_notification = notifications.json()["items"][0]
    assert invite_notification["data"]["member_id"] == member_id

    accepted = await client.post(
        f"/api/v1/events/{event_id}/teams/{team_id}/accept/{member_id}",
        headers=second_user_headers,
    )
    assert accepted.status_code == 200
    assert accepted.json()["status"] == "accepted"

    my_teams = await client.get("/api/v1/teams/", headers=second_user_headers)
    assert my_teams.status_code == 200
    assert [item["id"] for item in my_teams.json()] == [team_id]
