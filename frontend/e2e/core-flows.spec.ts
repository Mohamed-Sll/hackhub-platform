import { expect, test, type Page, type Route } from '@playwright/test'

const eventId = '10000000-0000-4000-8000-000000000001'
const organizerId = '20000000-0000-4000-8000-000000000001'
const participantId = '30000000-0000-4000-8000-000000000001'

const eventFixture = {
  id: eventId,
  title: 'Community Build Hackathon',
  description: 'Build practical tools for the local community.',
  start_date: '2030-06-01T09:00:00Z',
  end_date: '2030-06-02T18:00:00Z',
  location: 'Praia',
  is_online: false,
  status: 'published',
  max_team_size: 4,
  min_team_size: 1,
  organizer_id: organizerId,
  prizes: [],
  sponsors: [],
  schedule: {},
  faq: [],
}

function userFixture(role: 'organizer' | 'participant') {
  const isOrganizer = role === 'organizer'
  return {
    id: isOrganizer ? organizerId : participantId,
    email: `${role}@example.test`,
    username: role,
    full_name: isOrganizer ? 'Test Organizer' : 'Test Participant',
    role,
    is_active: true,
    is_verified: true,
    skills: [],
    preferred_languages: [],
    preferred_frameworks: [],
    interest_areas: [],
    created_at: '2030-01-01T00:00:00Z',
    updated_at: '2030-01-01T00:00:00Z',
  }
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
}

async function mockApi(page: Page, session: ReturnType<typeof userFixture> | null) {
  let createdEvent: Record<string, unknown> | null = null

  await page.addInitScript(() => window.localStorage.setItem('hackhub-locale', 'en'))
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace(/\/+$/, '')
    const method = request.method()

    if (path === '/api/v1/auth/session') return json(route, session)
    if (path === '/api/v1/auth/refresh' || path === '/api/v1/auth/logout') {
      return json(route, { message: 'ok' })
    }
    if (path === '/api/v1/notifications') {
      return json(route, { items: [], total: 0, page: 1, size: 20 })
    }
    if (path === '/api/v1/dashboard/public-stats') {
      return json(route, { total_events: 1, total_projects: 0, total_teams: 0, active_participants: 0 })
    }
    if (path === '/api/v1/dashboard/stats') {
      return json(route, {
        total_events: 0,
        total_projects: 0,
        total_teams: 0,
        active_participants: 0,
        events_by_status: {},
        top_technologies: [],
        recent_events: [],
      })
    }
    if (path === '/api/v1/events/managed' && method === 'GET') {
      const items = createdEvent ? [createdEvent] : []
      return json(route, { items, total: items.length, page: 1, size: 12 })
    }
    if (path === '/api/v1/events' && method === 'GET') {
      return json(route, { items: [eventFixture], total: 1, page: 1, size: 12 })
    }
    if (path === '/api/v1/events' && method === 'POST') {
      const body = request.postDataJSON() as Record<string, unknown>
      createdEvent = {
        ...body,
        id: '40000000-0000-4000-8000-000000000001',
        status: 'draft',
        organizer_id: organizerId,
        created_at: '2030-01-01T00:00:00Z',
        updated_at: '2030-01-01T00:00:00Z',
      }
      return json(route, createdEvent, 201)
    }
    if (path === `/api/v1/events/${eventId}` && method === 'GET') return json(route, eventFixture)
    if (path === `/api/v1/events/${eventId}/registrations` && method === 'POST') {
      return json(route, { message: 'Your registration has been received.' }, 201)
    }
    if (path === `/api/v1/events/${eventId}/challenges` || path === `/api/v1/events/${eventId}/teams`) {
      return json(route, [])
    }
    if (path === `/api/v1/events/${eventId}/ranking`) return json(route, [])
    if (path === '/api/v1/teams' && method === 'GET') return json(route, [])
    if (path === '/api/v1/teams/join' && method === 'POST') {
      return json(route, {
        id: '50000000-0000-4000-8000-000000000001',
        team_id: '60000000-0000-4000-8000-000000000001',
        user_id: participantId,
        role: 'member',
        status: 'accepted',
      })
    }
    if (path === '/api/v1/auth/password-reset' && method === 'POST') {
      return json(route, { message: 'If the email exists, a reset link has been sent' })
    }

    return json(route, { detail: `No E2E mock configured for ${method} ${path}` }, 404)
  })
}

test('visitor can browse an event and register without an account', async ({ page }) => {
  await mockApi(page, null)
  await page.goto('/events')
  await page.getByRole('link', { name: /Community Build Hackathon/ }).click()
  await expect(page.getByRole('heading', { name: 'Community Build Hackathon' })).toBeVisible()
  await page.getByRole('link', { name: 'Register now' }).click()

  await page.getByLabel('Full name').fill('Ada Lovelace')
  await page.getByLabel('Email address').fill('ada@example.test')
  await page.getByRole('button', { name: 'Register for event' }).click()

  await expect(page.getByRole('status')).toContainText('Your registration for Community Build Hackathon has been recorded.')
})

test('participant can sign out to switch to an organizer account', async ({ page }) => {
  await mockApi(page, userFixture('participant'))
  await page.goto('/auth/login')

  await expect(page.getByText('A session is already active in this browser.')).toBeVisible()
  await page.getByRole('button', { name: 'Sign out and continue' }).click()
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible()
})

test('organizer can create an event from the management page', async ({ page }) => {
  await mockApi(page, userFixture('organizer'))
  await page.goto('/dashboard/events')
  await page.getByRole('button', { name: 'Create Event' }).first().click()

  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Event Title').fill('Local Innovation Weekend')
  await dialog.getByLabel('Description').fill('A weekend event for building useful local projects.')
  await dialog.getByLabel('Start Date').fill('2030-07-10T09:00')
  await dialog.getByLabel('End Date').fill('2030-07-11T18:00')
  await dialog.getByLabel('Location').fill('Praia')
  await dialog.getByRole('button', { name: 'Create Event' }).click()

  await expect(page.getByRole('heading', { name: 'Local Innovation Weekend' })).toBeVisible()
})

test('participant can join a team with an invitation code', async ({ page }) => {
  await mockApi(page, userFixture('participant'))
  await page.goto('/teams')
  await page.getByRole('button', { name: 'Join with code' }).click()

  await page.getByLabel('Invitation code').fill('abcd1234')
  await page.getByRole('button', { name: 'Join team' }).click()
  await expect(page.getByText('Team joined successfully')).toBeVisible()
})

test('local password recovery explains the no-SMTP reset path', async ({ page }) => {
  await mockApi(page, null)
  await page.goto('/auth/forgot-password')
  await page.getByLabel('Email address').fill('participant@example.test')
  await page.getByRole('button', { name: 'Send reset link' }).click()

  await expect(page.getByText(/email delivery is configured/i)).toBeVisible()
  await expect(page.getByText(/backend shell/i)).toBeVisible()
})
