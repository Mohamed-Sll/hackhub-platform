from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import AliasPath, BaseModel, Field, field_validator


class TeamCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class TeamInvite(BaseModel):
    user_id: UUID


class TeamJoin(BaseModel):
    invitation_code: str = Field(..., min_length=8, max_length=8, pattern=r"^[A-Z0-9]{8}$")


class TeamLeadershipTransfer(BaseModel):
    new_leader_id: UUID


class TeamMemberResponse(BaseModel):
    id: UUID
    team_id: UUID
    user_id: UUID
    role: str
    status: str
    invited_by: Optional[UUID] = None
    created_at: datetime
    username: Optional[str] = Field(None, validation_alias=AliasPath("user", "username"))
    full_name: Optional[str] = Field(None, validation_alias=AliasPath("user", "full_name"))
    avatar_url: Optional[str] = Field(None, validation_alias=AliasPath("user", "avatar_url"))

    model_config = {"from_attributes": True}


class TeamResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    event_id: UUID
    leader_id: UUID
    created_at: datetime
    updated_at: datetime
    members: List[TeamMemberResponse] = []

    model_config = {"from_attributes": True}


class PublicTeamResponse(TeamResponse):
    @field_validator("members", mode="before")
    @classmethod
    def hide_pending_invites(cls, members):
        return [
            member
            for member in members
            if getattr(getattr(member, "status", None), "value", getattr(member, "status", None)) == "accepted"
        ]


class TeamPrivateResponse(TeamResponse):
    invitation_code: str
