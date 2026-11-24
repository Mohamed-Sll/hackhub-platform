from datetime import datetime, timezone

import pytest
from sqlalchemy import select

from app.core.security import verify_password
from app.models.auth_session import AuthSession


@pytest.mark.asyncio
async def test_local_password_reset_changes_password_and_revokes_sessions(
    db_session,
    test_user,
    auth_headers,
):
    from app.reset_password import reset_password_with_session

    session = await db_session.scalar(select(AuthSession).where(AuthSession.user_id == test_user.id))
    assert session is not None
    old_reset_version = test_user.password_reset_version

    await reset_password_with_session(
        db_session,
        test_user.email.upper(),
        "local-new-password-456",
        "local-new-password-456",
    )

    assert verify_password("local-new-password-456", test_user.hashed_password)
    assert test_user.password_reset_version == old_reset_version + 1
    assert session.revoked_at is not None
    assert session.revoked_at <= datetime.now(timezone.utc)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("email", "password", "confirmation", "message"),
    [
        ("person@example.com", "different-password-123", "another-password-123", "do not match"),
        ("person@example.com", "short", "short", "between 8 and 256"),
        ("missing@example.com", "valid-password-123", "valid-password-123", "No account"),
    ],
)
async def test_local_password_reset_rejects_invalid_requests(
    db_session,
    email,
    password,
    confirmation,
    message,
):
    from app.reset_password import reset_password_with_session

    with pytest.raises(ValueError, match=message):
        await reset_password_with_session(db_session, email, password, confirmation)
