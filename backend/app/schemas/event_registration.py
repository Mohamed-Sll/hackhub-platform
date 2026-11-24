from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class EventRegistrationCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr

    @field_validator("full_name", mode="before")
    @classmethod
    def normalize_name(cls, value):
        return value.strip() if isinstance(value, str) else value


class EventRegistrationResponse(BaseModel):
    id: UUID
    event_id: UUID
    full_name: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class EventRegistrationReceipt(BaseModel):
    message: str


class EventRegistrationListResponse(BaseModel):
    items: List[EventRegistrationResponse]
    total: int
    page: int
    size: int
