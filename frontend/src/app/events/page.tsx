'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, CalendarDays } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EventCard } from '@/components/shared/event-card'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { useEvents } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function EventsPage() {
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

  const params: Record<string, unknown> = {
    page,
    size: 12,
  }
  if (search) params.search = search
  if (status !== 'all') params.status = status

  const { data, isLoading, error, refetch } = useEvents(params)

  const events = data?.items || []
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1
  const canCreateEvent = user?.role === 'organizer' || user?.role === 'admin'

  return (
    <div className="min-h-screen py-10 sm:py-14">
      <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-9 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Find your next build</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Events</h1>
              <p className="mt-2 text-muted-foreground">Browse public hackathons and follow their progress.</p>
            </div>
            {canCreateEvent ? (
              <Link href="/dashboard/events">
                <Button>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            ) : null}
          </div>

          <div className="mb-6 flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                aria-label="Search events"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Search events..."
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
              />
            </div>
          </div>

          <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1) }} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All events</TabsTrigger>
              <TabsTrigger value="published">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In progress</TabsTrigger>
              <TabsTrigger value="closed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorState
              message="Failed to load events"
              onRetry={() => refetch()}
            />
          ) : events.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-16 w-16" />}
              title="No events found"
              description={search ? "Try a different search term" : "No events are available right now"}
              action={canCreateEvent ? { label: 'Create Event', onClick: () => router.push('/dashboard/events') } : undefined}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
