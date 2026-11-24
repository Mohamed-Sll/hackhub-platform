"""Reset an account password from the trusted shell of a self-hosted install."""

import asyncio
import getpass
import sys
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.core.security import get_password_hash
from app.models.auth_session import AuthSession
from app.models.user import User


async def reset_password_with_session(
    db: AsyncSession,
    email: str,
    password: str,
    confirmation: str,
) -> None:
    normalized_email = email.strip().lower()
    if not normalized_email:
        raise ValueError("An account email is required.")
    if password != confirmation:
        raise ValueError("Passwords do not match.")
    if not 8 <= len(password) <= 256:
        raise ValueError("Password must contain between 8 and 256 characters.")

    user = await db.scalar(select(User).where(User.email == normalized_email))
    if user is None:
        raise ValueError("No account exists for that email.")

    user.hashed_password = get_password_hash(password)
    user.password_reset_version += 1
    await db.execute(
        update(AuthSession)
        .where(AuthSession.user_id == user.id, AuthSession.revoked_at.is_(None))
        .values(revoked_at=datetime.now(timezone.utc))
    )
    await db.commit()


async def reset_password_for_email(email: str, password: str, confirmation: str) -> None:
    async with async_session_factory() as db:
        await reset_password_with_session(db, email, password, confirmation)


def main() -> None:
    email = input("Account email: ").strip()
    confirmation = input("Type RESET to confirm: ").strip()
    if confirmation != "RESET":
        print("Password reset cancelled.", file=sys.stderr)
        raise SystemExit(1)

    password = getpass.getpass("New password (8-256 characters): ")
    password_confirmation = getpass.getpass("Confirm new password: ")
    try:
        asyncio.run(reset_password_for_email(email, password, password_confirmation))
    except ValueError as exc:
        print(f"Password reset failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc

    print("Password reset. All active sessions for this account were revoked.")


if __name__ == "__main__":
    main()
