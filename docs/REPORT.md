# HackHub technical overview

This report is a short entry point to the maintained project documentation.
It replaces an early planning report that described technologies and flows
that are not part of the current implementation.

## What the project does

HackHub is an open-source web platform for managing hackathons. It brings
event setup, team formation, project submissions, judging, rankings, and
verifiable certificates into one application.

## Current implementation

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS, TanStack Query,
  and Zustand.
- **Backend:** FastAPI, Python 3.12, Pydantic, SQLAlchemy async, and Alembic.
- **Database:** SQLite for a controlled single-instance deployment.
- **Optional services:** Redis, SMTP, Telegram, and OpenAI.
- **Deployment:** Docker Compose and Nginx; GitHub Actions provides CI.

The API uses HTTP-only cookies for revocable, rotating JWT sessions and applies
role- and event-scoped authorization. The team owns a single project, judges
evaluate submitted work against configured criteria, and rankings are
available through HTTP and Server-Sent Events. Certificates are downloadable
PDFs with QR-based public integrity checks.

## Documentation map

- [README](../README.md) — features, requirements, local setup, and project
  status.
- [Architecture and operating model](ARCHITECTURE.md) — module boundaries,
  authentication, persistence, deployment, and implementation limits.
- [Contributing](../CONTRIBUTING.md) — development commands and pull request
  guidance.
- [Maintainer memory index](../MEMORIA/INDEX.md) — detailed domain flows,
  invariants, and technical decisions.

## Deployment boundaries

The current repository does not implement PostgreSQL support, distributed
workers, horizontal scaling, billing, custom domains, or digitally signed PDF
certificates. Redis is optional and is not the primary datastore. Email,
Telegram, and OpenAI require provider credentials and staging validation.
Production deployments must provide HTTPS, strong secrets, migrations,
backups, monitoring, and environment-specific load validation.
