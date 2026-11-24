'use client'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, FolderKanban, Trophy, Eye, Save, UserRoundX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { RankingTable } from '@/components/shared/ranking-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EventForm } from '@/components/forms/event-form'
import {
  useEvent,
  useUpdateEvent,
  useChangeEventStatus,
  useEventRegistrations,
  useDeleteEventRegistration,
} from '@/hooks/useEvents'
import { useRanking } from '@/hooks/useRanking'
import { useAuth } from '@/hooks/useAuth'
import { useEventStats } from '@/hooks/useDashboard'
import { useProjects } from '@/hooks/useProjects'
import { ProjectCard } from '@/components/shared/project-card'
import { TeamCard } from '@/components/shared/team-card'
import { ChallengeManager } from '@/components/shared/challenge-manager'
import { EmptyState } from '@/components/ui/empty-state'
import { useTeams } from '@/hooks/useTeams'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { CreateEventRequest } from '@/types'
import { eventStatusText, LocalizedText, LocalizedDate, translateCurrent, useI18n } from '@/lib/i18n'

export default function ManageEventDetailPage() {
  const { t } = useI18n()
  const editEventLinkRef = useRef<HTMLAnchorElement>(null)
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params.id as string
  const [registrationsPage, setRegistrationsPage] = useState(1)
  const isEditing = searchParams.get('edit') === 'true'
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: event, isLoading, error, refetch } = useEvent(id)
  const { data: ranking } = useRanking(id)
  const { data: stats } = useEventStats(id)
  const { data: projectsData } = useProjects(id)
  const { data: teams = [] } = useTeams(id)
  const { data: registrationsData } = useEventRegistrations(id, registrationsPage)
  const deleteRegistration = useDeleteEventRegistration(id)
  const updateEvent = useUpdateEvent()
  const changeStatus = useChangeEventStatus()

  if (authLoading) return <LoadingState />
  if (!isAuthenticated) {
    router.push('/auth/login')
    return null
  }
  if (isLoading) return <LoadingState className="min-h-[calc(100vh-4rem)]" />
  if (error) return <ErrorState message="Failed to load event" onRetry={() => refetch()} className="min-h-[calc(100vh-4rem)]" />
  if (!event) return null

  const handleUpdateEvent = async (data: CreateEventRequest) => {
    try {
      await updateEvent.mutateAsync({ id, data })
      toast.success(translateCurrent('Event updated!'))
      router.push(`/dashboard/events/${id}`)
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Failed to update event'))
    }
  }

  const handleChangeStatus = async (status: string) => {
    try {
      await changeStatus.mutateAsync({ id, status })
      toast.success(`Event status changed to ${status}`)
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Failed to change status'))
    }
  }

  const projects = projectsData || []

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!window.confirm(translateCurrent('Remove this registration and delete its contact details?'))) return
    try {
      await deleteRegistration.mutateAsync(registrationId)
      if (registrationsData?.items.length === 1 && registrationsPage > 1) {
        setRegistrationsPage((page) => page - 1)
      }
      toast.success(translateCurrent('Registration removed'))
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Could not remove registration'))
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            <LocalizedText text="Back to Events" />{' '}</Link>

          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge><LocalizedText text={eventStatusText(event.status)} /></Badge>
              </div>
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="text-muted-foreground mt-1"><LocalizedText text="Event Management Dashboard" /></p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/events/${event.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  <LocalizedText text="View Public" />{' '}</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Teams', value: stats?.total_teams || 0, icon: Users },
              { label: 'Projects', value: stats?.total_projects || 0, icon: FolderKanban },
              { label: 'Submitted', value: stats?.submitted_projects || 0, icon: Trophy },
              { label: 'Evaluated', value: stats?.total_evaluations || 0, icon: Eye },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {event.status === 'draft' && (
              <Button onClick={() => handleChangeStatus('published')} size="sm">
                <LocalizedText text="Publish Event" />{' '}</Button>
            )}
            {event.status === 'published' && (
              <Button onClick={() => handleChangeStatus('in_progress')} size="sm">
                <LocalizedText text="Start Event" />{' '}</Button>
            )}
            {event.status === 'in_progress' && (
              <Button onClick={() => handleChangeStatus('closed')} size="sm" variant="secondary">
                <LocalizedText text="Close Event" />{' '}</Button>
            )}
            <Link ref={editEventLinkRef} href={`/dashboard/events/${id}?edit=true`}>
              <Button variant="outline" size="sm">
                <Save className="mr-2 h-4 w-4" />
                <LocalizedText text="Edit Event" />{' '}</Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/v1/dashboard/events/${id}/export/participants?fmt=xlsx`)}>
              <LocalizedText text="Export Participants" />{' '}</Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/v1/dashboard/events/${id}/export/ranking?fmt=xlsx`)}>
              <LocalizedText text="Export Ranking" />{' '}</Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/v1/dashboard/events/${id}/export/evaluations?fmt=xlsx`)}>
              <LocalizedText text="Export Evaluations" />{' '}</Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/v1/dashboard/events/${id}/export/projects?fmt=xlsx`)}>
              <LocalizedText text="Export Projects" />{' '}</Button>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="event-management-tabs">
              <TabsTrigger value="overview"><LocalizedText text="Overview" /></TabsTrigger>
              <TabsTrigger value="challenges"><LocalizedText text="Challenges" /></TabsTrigger>
              <TabsTrigger value="teams"><LocalizedText text="Teams" /></TabsTrigger>
              <TabsTrigger value="registrations"><LocalizedText text="Registrations (" />{registrationsData?.total || 0}<LocalizedText text=")" /></TabsTrigger>
              <TabsTrigger value="evaluations"><LocalizedText text="Evaluations" /></TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle><LocalizedText text="Event Details" /></CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground"><LocalizedText text="Start Date" /></dt>
                      <dd className="font-medium"><LocalizedDate value={event.start_date} pattern="short" /></dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground"><LocalizedText text="End Date" /></dt>
                      <dd className="font-medium"><LocalizedDate value={event.end_date} pattern="short" /></dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground"><LocalizedText text="Is Online" /></dt>
                      <dd className="font-medium">{event.is_online ? 'Yes' : 'No'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground"><LocalizedText text="Max Team Size" /></dt>
                      <dd className="font-medium">{event.max_team_size}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle><LocalizedText text="Ranking" /></CardTitle>
                </CardHeader>
                <CardContent>
                  <RankingTable entries={ranking || []} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="challenges" className="mt-6">
              <ChallengeManager eventId={id} />
            </TabsContent>

            <TabsContent value="teams" className="mt-6">
              {teams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team, index) => <TeamCard key={team.id} team={team} index={index} linked={false} />)}
                </div>
              ) : (
                <EmptyState title="No teams yet" description="Teams will appear here once participants register" />
              )}
            </TabsContent>

            <TabsContent value="registrations" className="mt-6">
              {registrationsData?.items.length ? (
                <div className="overflow-x-auto border-y border-border">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                        <th scope="col" className="py-3 pr-4 font-medium"><LocalizedText text="Attendee" /></th>
                        <th scope="col" className="py-3 pr-4 font-medium"><LocalizedText text="Email" /></th>
                        <th scope="col" className="py-3 pr-4 font-medium"><LocalizedText text="Registered" /></th>
                        <th scope="col" className="py-3 text-right font-medium"><LocalizedText text="Action" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrationsData.items.map((registration) => (
                        <tr key={registration.id} className="border-b border-border last:border-0">
                          <td className="py-4 pr-4 font-medium">{registration.full_name}</td>
                          <td className="py-4 pr-4 text-muted-foreground">{registration.email}</td>
                          <td className="py-4 pr-4 text-muted-foreground">
                            {<LocalizedDate value={registration.created_at} pattern="short" />}
                          </td>
                          <td className="py-4 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`${t('Remove')} ${registration.full_name}`}
                              disabled={deleteRegistration.isPending}
                              onClick={() => handleDeleteRegistration(registration.id)}
                            >
                              <UserRoundX className="mr-2 h-4 w-4" /> <LocalizedText text="Remove" />{' '}</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between py-3 text-sm text-muted-foreground">
                    <span>
                      <LocalizedText text="Page" />{' '}{registrationsPage} <LocalizedText text="of" />{' '}{Math.max(1, Math.ceil((registrationsData.total || 0) / registrationsData.size))}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={registrationsPage <= 1}
                        onClick={() => setRegistrationsPage((page) => page - 1)}
                      >
                        <LocalizedText text="Previous" />{' '}</Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={registrationsPage * registrationsData.size >= registrationsData.total}
                        onClick={() => setRegistrationsPage((page) => page + 1)}
                      >
                        <LocalizedText text="Next" />{' '}</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState title="No registrations yet" description="Attendees who register for this event will appear here." />
              )}
            </TabsContent>

            <TabsContent value="evaluations" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.length > 0 ? (
                  projects.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                  ))
                ) : (
                  <EmptyState
                    title="No projects submitted yet"
                    description="Submitted projects will appear here"
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Dialog open={isEditing} onOpenChange={(open) => {
        if (!open) router.push(`/dashboard/events/${id}`)
      }}>
        <DialogContent
          className="max-w-2xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            editEventLinkRef.current?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle><LocalizedText text="Edit Event" /></DialogTitle>
          </DialogHeader>
          <EventForm
            initialData={{
              title: event.title,
              description: event.description,
              cover_image: event.cover_image,
              start_date: event.start_date,
              end_date: event.end_date,
              location: event.location,
              is_online: event.is_online,
              max_team_size: event.max_team_size,
              min_team_size: event.min_team_size,
              prizes: event.prizes,
              sponsors: event.sponsors,
              regulations: event.regulations,
            }}
            onSubmit={handleUpdateEvent}
            isLoading={updateEvent.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
