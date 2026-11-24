import pytest

from app.models.notification import Notification, NotificationCategory, NotificationType


@pytest.mark.asyncio
async def test_notifications_are_private_paginated_and_marked_read(
    client,
    db_session,
    auth_headers,
    second_user_headers,
    test_user,
    second_user,
):
    notifications = [
        Notification(
            user_id=test_user.id,
            type=NotificationType.PUSH,
            category=NotificationCategory.NEW_CHALLENGE,
            title=f"Challenge {index}",
            message="A new challenge is available",
            data={"challenge": index},
        )
        for index in range(3)
    ]
    other_user_notification = Notification(
        user_id=second_user.id,
        type=NotificationType.PUSH,
        category=NotificationCategory.RESULT_PUBLISHED,
        title="Private result",
        message="Your result is ready",
    )
    db_session.add_all([*notifications, other_user_notification])
    await db_session.flush()

    page = await client.get("/api/v1/notifications/?page=1&size=2", headers=auth_headers)
    assert page.status_code == 200
    assert page.json()["total"] == 3
    assert len(page.json()["items"]) == 2
    assert all(item["title"] != "Private result" for item in page.json()["items"])

    marked = await client.put(
        f"/api/v1/notifications/{notifications[0].id}/read",
        headers=auth_headers,
    )
    assert marked.status_code == 200
    assert marked.json()["read"] is True

    foreign_read = await client.put(
        f"/api/v1/notifications/{other_user_notification.id}/read",
        headers=auth_headers,
    )
    assert foreign_read.status_code == 404

    read_all = await client.put("/api/v1/notifications/read-all", headers=auth_headers)
    assert read_all.status_code == 200
    assert read_all.json()["message"] == "2 notifications marked as read"

    other_user_page = await client.get("/api/v1/notifications/", headers=second_user_headers)
    assert [item["title"] for item in other_user_page.json()["items"]] == ["Private result"]


@pytest.mark.asyncio
async def test_notifications_require_authentication(client):
    response = await client.get("/api/v1/notifications/")
    assert response.status_code == 401
