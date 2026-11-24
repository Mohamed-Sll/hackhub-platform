# Security review

This review follows the implemented API paths for authentication, event
registration, organizer access, user profiles, teams, projects, evaluations,
certificates, exports, and integrations. It records repository-level findings;
it is not a penetration test of a deployed environment.

## Findings fixed

### User profile endpoint exposed other users' personal details

`GET /api/v1/users/{user_id}` now permits the active account to read its own
profile; only an administrator may read another profile. The endpoint returns
403 for another authenticated non-admin account. Regression coverage is in
`backend/tests/test_access_control.py`.

### Public certificate verification returned internal metadata

Anonymous verification now uses a separate response schema containing only the
verification code, certificate type, recipient name, event title, and issue
date. It no longer serializes certificate UUIDs, the signature, QR payload, or
arbitrary `extra_data`. Regression coverage checks the exact public field set
in `backend/tests/test_event_workflow.py`.

## Controls confirmed in the code

- Access tokens must have the access-token type and a live, non-revoked session.
  Active-user, admin, organizer, and event-owner checks are performed by API
  dependencies, not only by hidden frontend controls (`backend/app/core/deps.py`).
- Public signup always creates a participant. Organizer access is assigned from
  the trusted installation shell with `python -m app.set_organizer <email>`;
  there is no public role-escalation endpoint.
- Anonymous app bootstrap uses `/api/v1/auth/session`, which returns `null` when
  no session cookie is present; private profile routes, including `/auth/me`,
  remain protected and return 401 without authentication.
- Public event registration needs no account. The API rate-limits the endpoint,
  validates the event and registration payload, and prevents duplicate
  registrations for an email. The registration list and deletion endpoints
  require the event manager (`backend/app/api/v1/endpoints/events.py` and
  `backend/app/services/event_registration_service.py`).
- Team invitation-code joins require an active authenticated session, validate
  the eight-character uppercase alphanumeric code format, and are rate-limited
  at the API boundary. Event publication state, team capacity, and existing
  membership are checked again in the service (`backend/app/api/v1/endpoints/teams.py`,
  `backend/app/schemas/team.py`, and `backend/app/services/team_service.py`).
- Public event lookup excludes drafts; event management checks ownership or
  administrator role. Team serializers omit invitation codes and private
  pending-member data from public views.
- Certificate downloads are restricted to the recipient or an administrator;
  event certificate generation requires the event manager.
- Production settings reject weak secrets, non-HTTPS application URLs, HTTP
  CORS origins, and automatic schema creation. CORS origins and trusted hosts
  are configured explicitly. Session cookies are HTTP-only and secure outside
  development/test; mutating cookie-authenticated requests reject untrusted
  origins.
- Request logs include method, path, status, duration, and request ID, not
  request bodies or registration contact fields.

## Validation

- The backend suite passed with 52 tests on this Windows machine. The test
  runner used `WindowsSelectorEventLoopPolicy` because the host blocks the
  default Proactor loop's local socket-pair setup; the application code was not
  changed to work around this machine restriction.
- Backend `flake8`, `black --check`, `isort --check-only`, and
  `pip-audit -r requirements-dev.txt` passed; pip-audit reported no known
  vulnerabilities.
- Frontend typecheck, ESLint, and production build passed. `npm audit` could not
  reach the npm advisory endpoint on its first attempt; retrying the CI command
  (`npm audit --omit=dev --audit-level=high`) succeeded and reported zero
  vulnerabilities.
- The authenticated team-code flow was exercised in a browser against an
  isolated SQLite database with synthetic users. Invalid and malformed codes
  returned visible errors, a valid code joined the team, and the member card
  appeared. Profile modal bounds, keyboard focus restoration, theme switching,
  PT/EN persistence, icon/manifest responses, and horizontal overflow were
  checked at representative viewport widths.

## Remaining deployment limits

- Rate limits use the configured limiter's process-local default storage. They
  are suitable only for the documented single-instance deployment unless a
  shared storage backend is configured and validated.
- The application uses SQLite for a controlled single instance. Backups,
  restore drills, file permissions, TLS termination, production environment
  values, monitoring, and deployment-specific trusted-host/CORS settings still
  need to be verified in the actual hosting environment.
- SMTP, Telegram, and OpenAI integrations were not exercised against live
  providers because they require external credentials. No production traffic
  or load test was performed.
- A single full pytest invocation encounters Windows `WinError 10013` while
  creating asyncio socket pairs. Running the test files separately avoids that
  environment issue; the restriction is not reported as an application test
  failure.
