'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Search } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EventCard } from '@/components/shared/event-card'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { useEvents } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LocalizedText, useI18n } from '@/lib/i18n'

export default function EventsPage() {
  const { t } = useI18n()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearch(searchInput.trim()), 250)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  const params: Record<string, unknown> = { page, size: 12 }
  if (search) params.search = search
  if (status !== 'all') params.status = status

  const { data, isLoading, error, refetch } = useEvents(params)
  const events = data?.items || []
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1
  const canCreateEvent = user?.role === 'organizer' || user?.role === 'admin'

  return (
    <div className="events-page">
      <div className="title-row">
        <div>
          <p className="eyebrow"><LocalizedText text="Find your next build" /></p>
          <h1><LocalizedText text="Events" /><span className="title-signal"><LocalizedText text="." /></span></h1>
          <p><LocalizedText text="Explore public hackathons. Open an event to see its plan and sign-up details." /></p>
        </div>
        {canCreateEvent ? (
          <Link href="/dashboard/events"><Button><CalendarDays className="mr-2 h-4 w-4" /><LocalizedText text="Create event" /></Button></Link>
        ) : null}
      </div>

      <div className="events-toolbar">
        <label className="events-search">
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only"><LocalizedText text="Search events" /></span>
          <input
            type="search"
            aria-label={t('Search events')}
            placeholder={t('Search events, locations, themes…')}
            value={searchInput}
            onChange={(event) => { setSearchInput(event.target.value); setPage(1) }}
          />
        </label>
        <Tabs value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
          <TabsList aria-label={t('Filter events by status')}>
            <TabsTrigger value="all"><LocalizedText text="All events" /></TabsTrigger>
            <TabsTrigger value="published"><LocalizedText text="Registration open" /></TabsTrigger>
            <TabsTrigger value="in_progress"><LocalizedText text="In progress" /></TabsTrigger>
            <TabsTrigger value="closed"><LocalizedText text="Completed" /></TabsTrigger>
          </TabsList>
        </Tabs>
        {data && <span className="events-total">{data.total} {t(data.total === 1 ? 'event' : 'events')}</span>}
      </div>

      {isLoading ? (
        <div className="event-list" aria-label={t('Loading events')} aria-busy="true">
          {Array.from({ length: 5 }).map((_, index) => <div className="event-list-skeleton" key={index} />)}
        </div>
      ) : error ? (
        <ErrorState message="Could not load events. Check your connection and try again." onRetry={() => refetch()} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-8 w-8" />}
          title={search ? 'No events match your search' : 'No events published yet'}
          description={search ? 'Try another search or clear the search field.' : 'Check back later for upcoming hackathons.'}
          action={canCreateEvent ? { label: 'Create event', onClick: () => router.push('/dashboard/events') } : undefined}
        />
      ) : (
        <>
          <div className="event-list">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>
          {totalPages > 1 && (
            <div className="events-pagination">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><LocalizedText text="Previous" /></Button>
              <span><LocalizedText text="Page" />{' '}{page} <LocalizedText text="of" />{' '}{totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}><LocalizedText text="Next" /></Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
