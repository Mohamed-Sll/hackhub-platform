'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ArrowRight, CalendarDays, MoveUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { usePublicDashboardStats } from '@/hooks/useDashboard'
import { useEvents } from '@/hooks/useEvents'
import type { Event as HackathonEvent } from '@/types'
import { eventStatusText, LocalizedText, LocalizedDate, useI18n } from '@/lib/i18n'

// Distribuo as estrelas pelos três braços da galáxia.
const GALAXY_STARS = Array.from({ length: 30 }, (_, index) => {
  const arm = index % 3
  const step = Math.floor(index / 3) / 9
  const angle = step * Math.PI * 4.4 + arm * (Math.PI * 2 / 3)
  const radius = 5 + step * 44

  return {
    x: Number((50 + Math.cos(angle) * radius).toFixed(2)),
    y: Number((50 + Math.sin(angle) * radius).toFixed(2)),
    size: index % 17 === 0 ? 4.2 : 1.6 + ((index * 7) % 4) * 0.65,
    delay: (index % 13) * -0.31,
    depth: ((index * 13) % 25) - 12,
    tone: index % 7 === 0 ? 'coral' : index % 4 === 0 ? 'cyan' : 'white',
  }
})

// Uso os mesmos ângulos das estrelas para manter os braços alinhados.
const GALAXY_ARMS = Array.from({ length: 3 }, (_, arm) => {
  const points = Array.from({ length: 48 }, (_, index) => {
    const step = (index + 1) / 48
    const angle = step * Math.PI * 4.4 + arm * (Math.PI * 2 / 3)
    const radius = 5 + step * 44
    const x = (50 + Math.cos(angle) * radius).toFixed(2)
    const y = (50 + Math.sin(angle) * radius).toFixed(2)
    return `${x} ${y}`
  })

  return `M 50 50 L ${points.join(' L ')}`
})

function GalaxyModel() {
  return (
    <div className="galaxy-disc" aria-hidden="true">
      <span className="galaxy-cloud galaxy-cloud-one" />
      <span className="galaxy-cloud galaxy-cloud-two" />
      <span className="galaxy-cloud galaxy-cloud-three" />
      <svg className="galaxy-spirals" viewBox="0 0 100 100" focusable="false">
        {GALAXY_ARMS.map((path, index) => (
          <path
            className={`galaxy-arm ${index === 1 ? 'galaxy-arm-coral' : 'galaxy-arm-cyan'}`}
            d={path}
            key={index}
          />
        ))}
      </svg>
      {GALAXY_STARS.map((star, index) => (
        <span
          className={`galaxy-star ${star.tone === 'coral' ? 'galaxy-star-coral' : star.tone === 'cyan' ? 'galaxy-star-cyan' : 'galaxy-star-white'}`}
          key={index}
          style={{
            '--star-x': `${star.x}%`,
            '--star-y': `${star.y}%`,
            '--star-size': `${star.size}px`,
            '--star-delay': `${star.delay}s`,
            '--star-depth': `${star.depth}px`,
          } as CSSProperties}
        />
      ))}
      <span className="galaxy-nucleus" />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | undefined }) {
  const { t } = useI18n()
  return (
    <div className="home-metric">
      <span className="home-metric-label">{t(label)}</span>
      <strong>{value === undefined ? '—' : value.toLocaleString()}</strong>
    </div>
  )
}

function EventRow({ event }: { event: HackathonEvent }) {
  return (
    <Link className="home-event-row" href={`/events/${event.id}`}>
      <span className="home-event-date">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        {<LocalizedDate value={event.start_date} pattern="short" />}
      </span>
      <span className="home-event-details">
        <strong>{event.title}</strong>
        <span>{event.is_online ? 'Online' : event.location || 'Location to be announced'}</span>
      </span>
      <span className="home-event-status"><LocalizedText text={eventStatusText(event.status)} /></span>
      <ArrowRight className="home-event-arrow h-4 w-4" aria-hidden="true" />
    </Link>
  )
}

export default function HomePage() {
  const { t } = useI18n()
  const { data: stats } = usePublicDashboardStats()
  const { data: eventData, isLoading, error, refetch } = useEvents({ page: 1, size: 3, status: 'published' })
  const events = eventData?.items ?? []

  return (
    <div className="home-page">
      <section className="hero-home" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow"><LocalizedText text="The open-source workspace for hackathons" /></p>
          <h1 id="home-title"><LocalizedText text="Make room" /><br /><LocalizedText text="for" />{' '}<span><LocalizedText text="big ideas." /></span></h1>
          <p className="hero-description">
            <LocalizedText text="Find an event and register in minutes, with no account required. Organizers get one clear workspace to publish details and run the day." />{' '}</p>
          <div className="hero-actions">
            <Button asChild size="lg">
              <Link href="/events"><LocalizedText text="Explore events" />{' '}<MoveUpRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" /></Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/auth/login"><LocalizedText text="Organizer sign in" /></Link>
            </Button>
          </div>
        </div>

        <div className="home-orbit" role="img" aria-label={t('Discover, build, and celebrate at a hackathon')}>
          <span className="orbit-label orbit-label-discover"><LocalizedText text="Discover" /></span>
          <span className="orbit-label orbit-label-build"><LocalizedText text="Build" /></span>
          <span className="orbit-label orbit-label-celebrate"><LocalizedText text="Celebrate" /></span>
          <GalaxyModel />
          <span className="orbit-ring orbit-ring-outer" />
          <span className="orbit-ring orbit-ring-inner" />
          <span className="orbit-core"><LocalizedText text="H." /></span>
        </div>
      </section>

      <section className="home-metrics" aria-label={t('HackHub activity')}>
        <Metric label="Public events" value={stats?.total_events} />
        <Metric label="Accounts" value={stats?.active_participants} />
        <Metric label="Projects" value={stats?.total_projects} />
        <Metric label="Teams formed" value={stats?.total_teams} />
      </section>

      <section className="home-workflow" aria-labelledby="workflow-title">
        <div className="section-head">
          <h2 id="workflow-title"><LocalizedText text="One event, one clear workflow" /></h2>
          <span><LocalizedText text="01 / 03" /></span>
        </div>
        <div className="workflow-grid">
          <article className="workflow-panel">
            <p className="eyebrow"><LocalizedText text="01 — Publish" /></p>
            <h3><LocalizedText text="Set the brief" /></h3>
            <p className="muted small"><LocalizedText text="Dates, challenges, rules and the details people need before they arrive." /></p>
          </article>
          <article className="workflow-panel">
            <p className="eyebrow"><LocalizedText text="02 — Build" /></p>
            <h3><LocalizedText text="Bring people together" /></h3>
            <p className="muted small"><LocalizedText text="Registrations, teams and projects stay connected to the event." /></p>
          </article>
          <article className="workflow-panel">
            <p className="eyebrow"><LocalizedText text="03 — Recognize" /></p>
            <h3><LocalizedText text="Close with clarity" /></h3>
            <p className="muted small"><LocalizedText text="Evaluate submissions, publish results and verify certificates." /></p>
          </article>
        </div>
      </section>

      <section className="home-coming-up" aria-labelledby="coming-up-title">
        <div className="section-head">
          <h2 id="coming-up-title"><LocalizedText text="Coming up" /></h2>
          <Link className="home-section-link" href="/events"><LocalizedText text="All events" />{' '}<MoveUpRight className="h-3 w-3" aria-hidden="true" /></Link>
        </div>
        {isLoading ? (
          <div className="home-event-list" aria-label={t('Loading events')} aria-busy="true">
            {[0, 1, 2].map((row) => <div className="home-event-skeleton" key={row} />)}
          </div>
        ) : error ? (
          <ErrorState message="Could not load upcoming events" onRetry={() => refetch()} />
        ) : events.length ? (
          <div className="home-event-list">{events.map((event) => <EventRow event={event} key={event.id} />)}</div>
        ) : (
          <div className="home-empty-events">
            <p className="muted small"><LocalizedText text="There are no published events yet." /></p>
            <Link href="/events"><LocalizedText text="Browse all events" />{' '}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
          </div>
        )}
      </section>
    </div>
  )
}
