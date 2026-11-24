# Contributing to HackHub

Thanks for considering a contribution. Issues, bug fixes, features, and
documentation improvements are welcome. Please keep changes focused and
describe the user or maintainer problem they solve.

## Development setup

Requirements: Python 3.12+, Node.js 20+, and Git. Docker Compose and Redis are
optional for local development.

Clone the repository, then copy the example environment files:

```bash
git clone https://github.com/mohamedsillahhh-cloud/hackhub-platform.git
cd hackhub-platform
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

In Windows PowerShell, use `Copy-Item backend/.env.example backend/.env` and
`Copy-Item frontend/.env.example frontend/.env.local` for the copy commands.

Create a Python environment and install backend development dependencies:

```bash
python -m venv .venv
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
# macOS/Linux:        source .venv/bin/activate
python -m pip install -r backend/requirements-dev.txt
```

Install frontend dependencies and prepare the database:

```bash
cd frontend
npm ci
cd ../backend
alembic upgrade head
python -m app.create_first_admin
```

This one-time command creates the initial administrator interactively. Do not
use it to provision additional users after the first administrator exists.

Start the API from `backend/`:

```bash
uvicorn app.main:app --reload --port 8000
```

In another terminal, start the web app from `frontend/`:

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:3000`; the API runs at
`http://localhost:8000`. Its interactive docs are at `/docs`. SQLite is the
supported local database; Redis is optional. Email, Telegram, and OpenAI
features need provider credentials.

## Repository map

```text
backend/app/       API routes, domain services, persistence, auth, settings
backend/alembic/   Versioned database migrations
backend/tests/     API, workflow, security, and service tests
frontend/src/      Pages, components, hooks, API client, and local state
docs/              Architecture and technical overview
MEMORIA/           Maintainer reference for domain flows and decisions
```

Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) before changing cross-cutting
flows such as authentication, migrations, event lifecycle, or ranking.

## Before opening a pull request

1. Keep the change focused and explain its purpose in the pull request.
2. Add or update backend tests for behavior changes and bug fixes.
3. Update `.env.example` and documentation when configuration or behavior
   changes.
4. Add an Alembic migration for persistent schema changes; do not edit an
   existing migration that may already have been applied.
5. Run the relevant checks below and include their results in the PR.
6. Never commit credentials, generated databases, local environment files, or
   dependency folders.

### Backend checks

Run these from `backend/`:

```bash
pytest -q
alembic upgrade head
alembic check
black --check app tests alembic --line-length=120
isort --check-only app tests alembic --profile black
flake8 app tests alembic --max-line-length=120 --extend-ignore=E203,W503
pip-audit -r requirements-dev.txt
```

### Frontend checks

Run these from `frontend/`:

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=high
npx playwright install chromium # once per machine
npm run test:e2e
```

The browser suite runs against the local Next.js server and intercepts API
requests with test fixtures. It covers public event registration, organizer
event creation, changing an active participant session, joining a team by code,
and the documented local password recovery path.

The one-time administrator setup command refuses to create a second admin.
Public registration does not create an account; accounts remain for the
existing team, judging, and profile workflows.

The GitHub Actions workflow also builds both Docker images. Run
`bash scripts/check-memoria.sh` from the repository root if you change
maintainer memory files.

## Pull request guidance

- Use a concise title that explains the change. Conventional Commit prefixes
  such as `feat:`, `fix:`, `docs:`, and `chore:` are welcome.
- Include context, the implementation summary, and verification performed.
- Link a related issue when one exists.
- Include screenshots for visible frontend changes.
- Call out configuration changes, migrations, and operational impact.

## Scope and review

Please avoid unrelated refactors in focused changes. For larger features,
open an issue first to discuss the intended behavior and constraints. Maintainers
review contributions for correctness, security, accessibility, and consistency
with the documented project boundaries.
