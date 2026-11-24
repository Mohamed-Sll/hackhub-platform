from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import (
    get_current_active_user,
    get_current_organizer,
    get_optional_current_user,
    require_event_manager,
)
from app.core.rate_limit import limiter
from app.models.event import EventStatus
from app.models.user import User, UserRole
from app.schemas.event import EventCreate, EventListResponse, EventResponse, EventUpdate
from app.schemas.event_registration import (
    EventRegistrationCreate,
    EventRegistrationListResponse,
    EventRegistrationReceipt,
)
from app.services.event_registration_service import EventRegistrationService
from app.services.event_service import EventService

router = APIRouter(prefix="/events", tags=["Events"])


@router.post(
    "/{event_id}/registrations",
    response_model=EventRegistrationReceipt,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit(settings.EVENT_REGISTRATION_RATE_LIMIT)
async def register_for_event(
    request: Request,
    event_id: UUID,
    payload: EventRegistrationCreate,
    db: AsyncSession = Depends(get_db),
):
    await EventRegistrationService(db).register(event_id, payload)
    return EventRegistrationReceipt(message="Your registration has been received.")


@router.get("/{event_id}/registrations", response_model=EventRegistrationListResponse)
async def list_event_registrations(
    event_id: UUID,
    page: int = Query(1, ge=1),
    size: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    await require_event_manager(db, event_id, current_user)
    items, total = await EventRegistrationService(db).list_for_event(event_id, (page - 1) * size, size)
    return EventRegistrationListResponse(items=items, total=total, page=page, size=size)


@router.delete("/{event_id}/registrations/{registration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event_registration(
    event_id: UUID,
    registration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    await require_event_manager(db, event_id, current_user)
    await EventRegistrationService(db).delete(event_id, registration_id)


@router.get("/", response_model=EventListResponse)
async def list_events(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[EventStatus] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    service = EventService(db)
    items, total = await service.list_events(
        page=page,
        size=size,
        status=status,
        search=search,
        public_only=True,
    )
    return EventListResponse(items=items, total=total, page=page, size=size)


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    service = EventService(db)
    event = await service.create_event(event_data, current_user.id)
    return event


@router.get("/managed", response_model=EventListResponse)
async def list_managed_events(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status_filter: Optional[EventStatus] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    service = EventService(db)
    organizer_id = None if current_user.role == UserRole.ADMIN else current_user.id
    items, total = await service.list_events(
        page=page,
        size=size,
        status=status_filter,
        search=search,
        organizer_id=organizer_id,
    )
    return EventListResponse(items=items, total=total, page=page, size=size)


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    service = EventService(db)
    event = await service.get_event(event_id)
    if event.status == EventStatus.DRAFT and (
        current_user is None or (current_user.role != UserRole.ADMIN and current_user.id != event.organizer_id)
    ):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: UUID,
    event_data: EventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = EventService(db)
    return await service.update_event(event_id, event_data, current_user)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = EventService(db)
    await service.delete_event(event_id, current_user)


@router.patch("/{event_id}/status", response_model=EventResponse)
async def change_event_status(
    event_id: UUID,
    new_status: EventStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = EventService(db)
    return await service.change_status(event_id, new_status, current_user)
