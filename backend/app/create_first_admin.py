"""Create the first administrator for a fresh self-hosted installation."""

import asyncio
import getpass
import sys

from pydantic import ValidationError
from sqlalchemy import select

from app.core.database import async_session_factory
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.schemas.user import UserCreate


async def create_first_admin() -> None:
    email = input("Admin email: ").strip()
    username = input("Admin username: ").strip()
    full_name = input("Full name: ").strip()
    password = getpass.getpass("Password (minimum 8 characters): ")
    confirmation = getpass.getpass("Confirm password: ")

    if password != confirmation:
        raise ValueError("Passwords do not match.")

    try:
        data = UserCreate(
            email=email,
            username=username,
            full_name=full_name or None,
            password=password,
        )
    except ValidationError as exc:
        raise ValueError(str(exc)) from exc

    async with async_session_factory() as db:
        existing_admin = await db.scalar(select(User.id).where(User.role == UserRole.ADMIN).limit(1))
        if existing_admin is not None:
            raise ValueError("An administrator already exists; this command is only for initial setup.")

        duplicate = await db.scalar(
            select(User.id).where((User.email == data.email) | (User.username == data.username)).limit(1)
        )
        if duplicate is not None:
            raise ValueError("That email or username is already in use.")

        admin = User(
            email=data.email,
            username=data.username,
            full_name=data.full_name,
            hashed_password=get_password_hash(data.password),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        await db.commit()
        print(f"Initial administrator created: {admin.email}")


def main() -> None:
    try:
        asyncio.run(create_first_admin())
    except (ValueError, ValidationError) as exc:
        print(f"Setup failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
