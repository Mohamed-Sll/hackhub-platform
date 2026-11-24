# HackHub product plan

## Product direction

HackHub is an organizer-first workspace for creating, publishing, and running
hackathons. Event information should be publicly readable without an account.
Accounts exist for people who manage an event or take an action that needs a
persistent identity. The first version should make one path reliable:

**Create an event → publish its page → collect registrations → manage the event.**

This direction is a working product decision for implementation, based on the
project owner's request to reduce friction and focus the product. Public event
registration now collects a name and email without an account. Accounts remain
for organizer access and existing advanced team, submission, judging, and
certificate workflows while those flows are reviewed. The unsafe global AI
team suggestion was removed because it exposed profile data from outside the
event.

## Product principles

- Reading public event information never requires login.
- Draft content, participant contact information, and individual judge feedback
  are private unless an explicit event policy says otherwise.
- A clean installation must have a documented, secure way to create its first
  organizer; privileged roles are never self-selected in public registration.
- SQLite remains the low-friction self-hosted default. A shared hosted service
  needs durable storage and an explicit backup/restore story.
- Optional integrations must fail clearly and must not block core event flows.
- Prefer the smallest workflow that helps an organizer operate an event.

## Delivery plan

### 1. Establish safe public and private boundaries

- Show only published, in-progress, or completed events in public discovery.
- Keep draft events, draft submissions, pending team invites, and individual
  evaluations behind the appropriate organizer, team, or judge permissions.
- Ensure public rankings expose only the result intended for participants.
- Add API regression coverage for both anonymous and authorized access.

**Acceptance:** an anonymous visitor can browse published event information and
submitted work, but cannot retrieve drafts, pending invitations, private
participant records, or judge comments.

### 2. Make first use and organizer setup reliable

- Add a safe one-time setup path for the first organizer/admin on self-hosted
  installations.
- Clarify account creation, sign-in, event ownership, and event registration.
- Remove user-ID-only actions from normal participant flows where a join code
  or event link is sufficient.

**Acceptance:** a new operator can follow the setup guide, create an organizer,
publish an event, and verify it in a private browser without editing SQLite by
hand.

### 3. Complete the organizer-first event workflow

- Define and implement event registration as a first-class flow, including the
  fields collected, capacity/close behavior, duplicate handling, and organizer
  roster actions.
- Make schedule, rules, challenges, location, and event updates clear on the
  public event page.
- Keep event management scoped to its owner, with understandable empty and
  error states.

**Acceptance:** an organizer can publish a complete event and manage incoming
registrations from creation to event close; visitors can complete the agreed
registration flow without unnecessary account creation.

**Current implementation:** registration collects full name and email, blocks
duplicates per event, accepts registrations only while the event is published
or in progress, and lets the event manager view or delete registrations. The
current flow does not enforce capacity or send confirmation email; see
`MEMORIA/fluxos/inscricao-evento.md` for data handling details.

### 4. Reduce or modularize secondary capabilities

- Reassess teams, project submissions, judge workflows, ranking, and
  certificates against real organizer needs.
- Reassess AI features, notifications, Telegram, organizations, and plan
  settings against setup burden, cost, privacy, and maintenance.
- Remove duplicate API contracts and document any retained advanced workflow.

**Acceptance:** every retained capability supports an identified user task and
has an owner, a documented dependency boundary, and tests for its core flow.

### 5. Establish visual identity and product-quality bar

- Visual thesis: an editorial field guide for hackathons—calm paper-like
  surfaces, dark ink, one vivid event signal color, and a strong typographic
  hierarchy.
- Content sequence: discover events, understand one event, register, then
  operate the organizer workspace.
- Interaction thesis: restrained page entrance, clear state transitions, and
  fast feedback on registration and organizer actions; honor reduced-motion
  preferences.
- Audit responsive behavior, keyboard access, contrast, loading/error states,
  and page performance after the workflows are stable.

**Acceptance:** the interface communicates the product's purpose immediately,
works on mobile and desktop, and supports the primary flows with keyboard and
screen-reader-friendly controls.

### 6. Release and maintainability

- Align README, contribution guide, environment examples, and canonical GitHub
  links with the code and actual deployment model.
- Document backup/restore, migrations, first-user setup, secrets, and the
  limitations of a single-instance SQLite deployment.
- Add end-to-end smoke coverage for the agreed user journeys and keep CI checks
  aligned with the supported setup.

**Acceptance:** a new contributor can run the project from a clean checkout,
understand its limitations, verify the main flows, and identify how to deploy
and back up a self-hosted instance.

## Immediate implementation order

1. Fix public/private API boundaries and cover them with regression tests.
2. Add first-organizer setup and verify the clean-install path.
3. Implement the chosen registration and organizer roster workflow.
4. Revisit secondary modules and their UI.
5. Redesign the interface around the validated flows.
6. Reconcile public documentation and deployment guidance.

## Known product and deployment decision

This repository supports SQLite for one application instance. It is a good
default for local or self-hosted use, but it is not a durable shared database
for serverless/ephemeral deployments. Before operating one public shared
HackHub service, select persistent storage and verify backup, restore, and
concurrency behavior for that host.
