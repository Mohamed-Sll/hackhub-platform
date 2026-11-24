'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Calendar, ExternalLink, Globe, MapPin, Target, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { TeamCard } from '@/components/shared/team-card'
import { RankingTable } from '@/components/shared/ranking-table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useEvent } from '@/hooks/useEvents'
import { useRanking } from '@/hooks/useRanking'
import { useChallenges } from '@/hooks/useChallenges'
import { useTeams } from '@/hooks/useTeams'
import { cn } from '@/lib/utils'
import { eventStatusText, LocalizedText, LocalizedDate, useI18n } from '@/lib/i18n'

function structuredItems(value: unknown): Array<{ label: string; detail?: string }> {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      if (typeof item === 'string') return { label: item }
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>
        const label = String(record.name || record.title || record.question || `Item ${index + 1}`)
        const detail = record.description || record.value || record.answer
        return { label, detail: detail ? String(detail) : undefined }
      }
      return { label: String(item) }
    })
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).map(([label, detail]) => ({
      label,
      detail: typeof detail === 'string' ? detail : JSON.stringify(detail),
    }))
  }
  return []
}

export default function EventDetailPage() {
  const { t } = useI18n()
  const params = useParams()
  const id = params.id as string
  const { data: event, isLoading, error, refetch } = useEvent(id)
  const { data: ranking } = useRanking(id)
  const { data: challenges = [], isLoading: challengesLoading } = useChallenges(id)
  const { data: teams = [], isLoading: teamsLoading } = useTeams(id)

  if (isLoading) return <LoadingState className="min-h-[calc(100vh-4rem)]" />
  if (error) return <ErrorState message="Failed to load event" onRetry={() => refetch()} className="min-h-[calc(100vh-4rem)]" />
  if (!event) return null

  const isActive = event.status === 'in_progress' || event.status === 'published'
  const prizes = structuredItems(event.prizes)
  const sponsors = structuredItems(event.sponsors)
  const faq = structuredItems(event.faq)

  return (
    <div className="event-detail-page">
      <p className="eyebrow event-breadcrumb"><Link href="/events"><LocalizedText text="Events" /></Link><span><LocalizedText text="/" /></span>{event.location || (event.is_online ? 'Online' : 'Event details')}</p>
      <section className={cn('event-poster', event.cover_image && 'has-cover')} style={event.cover_image ? { backgroundImage: `url("${event.cover_image}")` } : undefined}>
        <div className="event-poster-shade" />
        <div className="event-poster-top">
          <Badge variant={event.status === 'in_progress' ? 'success' : event.status === 'published' ? 'default' : 'secondary'}>
            <LocalizedText text={eventStatusText(event.status)} />
          </Badge>
          <span>{<LocalizedDate value={event.start_date} pattern="short" />} – {<LocalizedDate value={event.end_date} pattern="short" />}</span>
        </div>
        <div className="event-poster-copy">
          <p className="eyebrow">{event.is_online ? 'Online event' : event.location || 'Hackathon event'}</p>
          <h1>{event.title}</h1>
          {event.description && <p>{event.description}</p>}
        </div>
        <div className="event-poster-footer">
          <div className="event-poster-meta">
            <div><span><LocalizedText text="Location" /></span><strong>{event.is_online ? 'Online' : event.location || 'To be announced'}</strong></div>
            <div><span><LocalizedText text="Format" /></span><strong>{event.is_online ? 'Online' : 'In person'}</strong></div>
            <div><span><LocalizedText text="Team size" /></span><strong>{event.min_team_size}–{event.max_team_size}</strong></div>
          </div>
          {isActive && (
            <Link href={`/events/${event.id}/register`}>
              <Button size="lg" className="shrink-0"><LocalizedText text="Register now" />{' '}<ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            </Link>
          )}
        </div>
      </section>

      <div className="event-detail-content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="event-detail-tabs">
                <TabsTrigger value="overview"><LocalizedText text="Overview" /></TabsTrigger>
                <TabsTrigger value="challenges"><LocalizedText text="Challenges" /></TabsTrigger>
                <TabsTrigger value="teams"><LocalizedText text="Teams" /></TabsTrigger>
                <TabsTrigger value="ranking"><LocalizedText text="Ranking" /></TabsTrigger>
                <TabsTrigger value="faq"><LocalizedText text="FAQ" /></TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3"><LocalizedText text="About this Event" /></h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                  </div>
                </div>

                {prizes.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-semibold mb-3"><LocalizedText text="Prizes" /></h2>
                      <div className="divide-y border-y">
                        {prizes.map((prize) => (
                          <div key={prize.label} className="py-3">
                            <p className="font-medium">{prize.label}</p>
                            {prize.detail && <p className="text-sm text-muted-foreground">{prize.detail}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {sponsors.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-semibold mb-3"><LocalizedText text="Sponsors" /></h2>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {sponsors.map((sponsor) => (
                          <span key={sponsor.label} className="font-medium">{sponsor.label}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="challenges">
                {challengesLoading ? <LoadingState /> : challenges.length === 0 ? (
                  <EmptyState icon={<Target className="h-12 w-12" />} title="No challenges published" description="The organizer has not added challenges yet." />
                ) : (
                  <div className="divide-y border-y">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="py-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground">{challenge.category?.name || 'Challenge'}</p>
                            <h3 className="mt-1 text-lg font-semibold">{challenge.title}</h3>
                          </div>
                          {challenge.documentation_url && (
                            <a href={challenge.documentation_url} target="_blank" rel="noreferrer" aria-label={`${t('Open documentation for')} ${challenge.title}`}>
                              <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                            </a>
                          )}
                        </div>
                        {challenge.description && <p className="mt-2 text-sm text-muted-foreground">{challenge.description}</p>}
                        {challenge.requirements && <p className="mt-3 text-sm"><span className="font-medium"><LocalizedText text="Requirements:" /></span> {challenge.requirements}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="teams">
                {teamsLoading ? <LoadingState /> : teams.length === 0 ? (
                  <EmptyState icon={<Users className="h-12 w-12" />} title="No teams registered" description="Registered teams will appear here." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teams.map((team, index) => <TeamCard key={team.id} team={team} index={index} linked={false} />)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ranking">
                <RankingTable entries={ranking || []} />
              </TabsContent>

              <TabsContent value="faq">
                {faq.length === 0 ? (
                  <EmptyState title="No questions published" description="Event FAQs will appear here." />
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {faq.map((item, index) => (
                      <AccordionItem key={`${item.label}-${index}`} value={`item-${index}`}>
                        <AccordionTrigger>{item.label}</AccordionTrigger>
                        <AccordionContent>{item.detail}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold"><LocalizedText text="Event Details" /></h3>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium"><LocalizedText text="Date" /></p>
                    <p className="text-sm text-muted-foreground">
                      {<LocalizedDate value={event.start_date} pattern="short" />} <LocalizedText text="-" />{' '}{<LocalizedDate value={event.end_date} pattern="short" />}
                    </p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium"><LocalizedText text="Location" /></p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium"><LocalizedText text="Format" /></p>
                    <p className="text-sm text-muted-foreground">{event.is_online ? 'Online' : 'In-Person'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium"><LocalizedText text="Max Team Size" /></p>
                    <p className="text-sm text-muted-foreground">{event.max_team_size} <LocalizedText text="members" /></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {event.regulations && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3"><LocalizedText text="Regulations" /></h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{event.regulations}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
