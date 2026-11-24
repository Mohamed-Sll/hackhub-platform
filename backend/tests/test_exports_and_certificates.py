from datetime import datetime, timedelta, timezone
from uuid import UUID

import pytest

from app.models.certificate import CertificateType
from app.services.certificate_service import CertificateService


async def create_event(client, admin_headers):
    now = datetime.now(timezone.utc)
    response = await client.post(
        "/api/v1/events/",
        headers=admin_headers,
        json={
            "title": "Exports and certificates",
            "start_date": (now + timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


@pytest.mark.asyncio
async def test_event_exports_check_ownership_and_return_downloads(
    client,
    admin_headers,
    organizer_headers,
    auth_headers,
):
    event_id = await create_event(client, admin_headers)

    forbidden = await client.get(
        f"/api/v1/dashboard/events/{event_id}/export/participants?fmt=csv",
        headers=organizer_headers,
    )
    assert forbidden.status_code == 403

    unauthenticated = await client.get(f"/api/v1/dashboard/events/{event_id}/export/projects?fmt=csv")
    assert unauthenticated.status_code == 401

    invalid_format = await client.get(
        f"/api/v1/dashboard/events/{event_id}/export/ranking?fmt=pdf",
        headers=admin_headers,
    )
    assert invalid_format.status_code == 422

    for resource in ("participants", "projects", "ranking", "evaluations"):
        csv_response = await client.get(
            f"/api/v1/dashboard/events/{event_id}/export/{resource}?fmt=csv",
            headers=admin_headers,
        )
        assert csv_response.status_code == 200
        assert csv_response.headers["content-type"].startswith("text/csv")
        assert "attachment" in csv_response.headers["content-disposition"]

        xlsx_response = await client.get(
            f"/api/v1/dashboard/events/{event_id}/export/{resource}?fmt=xlsx",
            headers=admin_headers,
        )
        assert xlsx_response.status_code == 200
        assert xlsx_response.headers["content-type"].startswith(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        assert xlsx_response.content.startswith(b"PK")

    participant_access = await client.get(
        f"/api/v1/dashboard/events/{event_id}/export/participants?fmt=csv",
        headers=auth_headers,
    )
    assert participant_access.status_code == 403


@pytest.mark.asyncio
async def test_certificate_pdf_is_downloadable_only_by_owner_or_admin(
    client,
    db_session,
    admin_headers,
    auth_headers,
    second_user_headers,
    test_user,
):
    event_id = await create_event(client, admin_headers)
    certificate = await CertificateService(db_session).generate_certificate(
        user_id=test_user.id,
        event_id=UUID(event_id),
        cert_type=CertificateType.PARTICIPATION,
    )

    owner_download = await client.get(
        f"/api/v1/certificates/download/{certificate.id}",
        headers=auth_headers,
    )
    assert owner_download.status_code == 200
    assert owner_download.headers["content-type"] == "application/pdf"
    assert owner_download.content.startswith(b"%PDF-")

    other_user_download = await client.get(
        f"/api/v1/certificates/download/{certificate.id}",
        headers=second_user_headers,
    )
    assert other_user_download.status_code == 403

    admin_download = await client.get(
        f"/api/v1/certificates/download/{certificate.id}",
        headers=admin_headers,
    )
    assert admin_download.status_code == 200

    missing_download = await client.get(
        "/api/v1/certificates/download/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )
    assert missing_download.status_code == 404
