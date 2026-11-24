import asyncio
import json
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.core.database import async_session_factory, get_db
from app.core.deps import (
    get_optional_current_user,
    require_event_read_access,
    require_public_event,
)
from app.models.user import User
from app.schemas.evaluation import RankResponse
from app.services.ranking_service import RankingService

router = APIRouter(prefix="/events/{event_id}/ranking", tags=["Ranking"])


@router.get("/", response_model=List[RankResponse])
async def get_ranking(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    await require_event_read_access(db, event_id, current_user)
    service = RankingService(db)
    return await service.calculate_ranking(event_id)


@router.get("/stream")
async def stream_ranking(event_id: UUID):
    async with async_session_factory() as db:
        await require_public_event(db, event_id)

    async def event_generator():
        while True:
            try:
                async with async_session_factory() as session:
                    service = RankingService(session)
                    rankings = await service.calculate_ranking(event_id)
                yield {
                    "event": "ranking_update",
                    "data": json.dumps([r.model_dump() for r in rankings], default=str),
                }
                await asyncio.sleep(30)
            except asyncio.CancelledError:
                break
            except Exception:
                yield {"event": "error", "data": "Error fetching ranking"}
                await asyncio.sleep(60)

    return EventSourceResponse(event_generator())
