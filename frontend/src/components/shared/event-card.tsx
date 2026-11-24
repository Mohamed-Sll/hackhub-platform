import { eventStatusText, LocalizedDate, LocalizedText } from '@/lib/i18n'
import Link from 'next/link'
import { ArrowRight, CalendarDays, MapPin, Monitor } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Event, EventStatus } from '@/types'

const statusConfig: Record<EventStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'secondary' | 'destructive' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Registration open', variant: 'default' },
  in_progress: { label: 'In progress', variant: 'success' },
  closed: { label: 'Completed', variant: 'warning' },
}

export function EventCard({ event }: { event: Event; index?: number }) {
  const status = statusConfig[event.status]

  return (
    <Link href={`/events/${event.id}`} className="event-list-row">
      <div className="event-list-icon" aria-hidden="true">
        <CalendarDays className="h-4 w-4" />
      </div>
      <div className="event-list-main">
        <div className="event-list-title">
          <h2>{event.title}</h2>
          <Badge variant={status.variant}><LocalizedText text={status.label} /></Badge>
        </div>
        <div className="event-list-meta">
          <span><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{<LocalizedDate value={event.start_date} pattern="short" />} – {<LocalizedDate value={event.end_date} pattern="short" />}</span>
          <span>{event.is_online ? <Monitor className="h-3.5 w-3.5" aria-hidden="true" /> : <MapPin className="h-3.5 w-3.5" aria-hidden="true" />}{event.is_online ? <LocalizedText text="Online" /> : event.location || <LocalizedText text="Location to be announced" />}</span>
          <span><LocalizedText text="Teams up to" />{' '}{event.max_team_size}</span>
        </div>
      </div>
      <ArrowRight className="event-list-arrow h-4 w-4" aria-hidden="true" />
    </Link>
  )
}
