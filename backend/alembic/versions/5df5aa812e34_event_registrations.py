"""Add accountless event registrations.

Revision ID: 5df5aa812e34
Revises: d24f93a91230
Create Date: 2026-11-23
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "5df5aa812e34"
down_revision: Union[str, None] = "d24f93a91230"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "event_registrations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("event_id", sa.Uuid(), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False
        ),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("event_id", "email", name="uq_event_registrations_event_email"),
    )
    op.create_index("ix_event_registrations_event_id", "event_registrations", ["event_id"])


def downgrade() -> None:
    op.drop_index("ix_event_registrations_event_id", table_name="event_registrations")
    op.drop_table("event_registrations")
