"""Grant organizer access to an existing account from a trusted local shell."""

import argparse
import asyncio

from sqlalchemy import select

from app.core.database import async_session_factory
from app.models.user import User, UserRole


async def set_organizer(email: str) -> None:
    normalized_email = email.strip().lower()
    if not normalized_email:
        raise ValueError("An account email is required.")

    async with async_session_factory() as db:
        user = await db.scalar(select(User).where(User.email == normalized_email))
        if user is None:
            raise ValueError("No account exists for that email. Register the account first.")
        if not user.is_active:
            raise ValueError("The account is inactive; reactivate it before granting organizer access.")
        if user.role == UserRole.ADMIN:
            print("The account is already an administrator and can manage events.")
            return
        if user.role not in (UserRole.PARTICIPANT, UserRole.ORGANIZER):
            raise ValueError("Only participant accounts can be promoted to organizer.")

        user.role = UserRole.ORGANIZER
        await db.commit()
        print("Organizer access granted. Sign out and sign back in to refresh the account session.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Grant organizer access to an existing HackHub account.")
    parser.add_argument("email", help="Email address of the account to promote")
    args = parser.parse_args()
    asyncio.run(set_organizer(args.email))


if __name__ == "__main__":
    main()
