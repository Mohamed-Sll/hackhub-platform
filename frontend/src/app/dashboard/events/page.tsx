'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useManagedEvents, useCreateEvent, useDeleteEvent } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EventForm } from '@/components/forms/event-form'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { CreateEventRequest } from '@/types'
import { eventStatusText, LocalizedText, LocalizedDate, translateCurrent, useI18n } from '@/lib/i18n'

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  published: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'border border-border bg-muted text-foreground',
  closed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export default function ManageEventsPage() {
  const { t } = useI18n()
  const createEventButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const canManage = user?.role === 'admin' || user?.role === 'organizer'
  const { data, isLoading, error, refetch } = useManagedEvents(
    !authLoading && isAuthenticated && canManage
  )
  const createEvent = useCreateEvent()
  const deleteEvent = useDeleteEvent()

  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login')
    } else if (!authLoading && isAuthenticated && user && !canManage) {
      router.replace('/events')
    }
  }, [authLoading, canManage, isAuthenticated, router, user])

  if (authLoading) return <LoadingState className="min-h-[calc(100vh-4rem)]" />
  if (!isAuthenticated) return null
  if (!canManage) return <LoadingState className="min-h-[calc(100vh-4rem)]" />

  const events = data?.items || []

  const handleCreateEvent = async (data: CreateEventRequest) => {
    try {
      await createEvent.mutateAsync(data)
      toast.success(translateCurrent('Event created!'))
      setShowCreateDialog(false)
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Failed to create event'))
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm(translateCurrent('Are you sure you want to delete this event?'))) return
    try {
      await deleteEvent.mutateAsync(id)
      toast.success(translateCurrent('Event deleted'))
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Failed to delete event'))
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold"><LocalizedText text="Manage Events" /></h1>
              <p className="text-muted-foreground mt-1"><LocalizedText text="Create and manage your hackathons" /></p>
            </div>
            <Button ref={createEventButtonRef} onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              <LocalizedText text="Create Event" />{' '}</Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message="Failed to load events" onRetry={() => refetch()} />
          ) : events.length === 0 ? (
            <EmptyState
              title="No events yet"
              description="Create your first hackathon event"
              action={{ label: 'Create Event', onClick: () => setShowCreateDialog(true) }}
            />
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                            <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyles[event.status])}>
                              <LocalizedText text={eventStatusText(event.status)} />
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{<LocalizedDate value={event.start_date} pattern="short" />} <LocalizedText text="-" />{' '}{<LocalizedDate value={event.end_date} pattern="short" />}</span>
                            <span>{event.is_online ? 'Online' : event.location || 'In-Person'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <Link href={`/dashboard/events/${event.id}`}>
                            <Button variant="outline" size="sm" aria-label={t('View event')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/events/${event.id}?edit=true`}>
                            <Button variant="outline" size="sm" aria-label={t('Edit event')}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={t('Delete event')}
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent
          className="max-w-2xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            createEventButtonRef.current?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle><LocalizedText text="Create New Event" /></DialogTitle>
          </DialogHeader>
          <EventForm onSubmit={handleCreateEvent} isLoading={createEvent.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
