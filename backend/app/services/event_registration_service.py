from typing import List, Tuple
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event, EventStatus
from app.models.event_registration import EventRegistration
from app.schemas.event_registration import EventRegistrationCreate


class EventRegistrationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, event_id: UUID, payload: EventRegistrationCreate) -> None:
        event = await self.db.get(Event, event_id)
        if event is None or event.status == EventStatus.DRAFT:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        if event.status not in (EventStatus.PUBLISHED, EventStatus.IN_PROGRESS):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration is closed")

        registration = EventRegistration(
            event_id=event_id,
            full_name=payload.full_name,
            email=str(payload.email).strip().lower(),
        )
        self.db.add(registration)
        try:
            await self.db.flush()
        except IntegrityError as exc:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This email is already registered for the event",
            ) from exc

    async def list_for_event(self, event_id: UUID, skip: int, limit: int) -> Tuple[List[EventRegistration], int]:
        count = await self.db.scalar(
            select(func.count(EventRegistration.id)).where(EventRegistration.event_id == event_id)
        )
        result = await self.db.execute(
            select(EventRegistration)
            .where(EventRegistration.event_id == event_id)
            .order_by(EventRegistration.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), count or 0

    async def delete(self, event_id: UUID, registration_id: UUID) -> None:
        registration = await self.db.scalar(
            select(EventRegistration).where(
                EventRegistration.id == registration_id,
                EventRegistration.event_id == event_id,
            )
        )
        if registration is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")
        await self.db.delete(registration)
