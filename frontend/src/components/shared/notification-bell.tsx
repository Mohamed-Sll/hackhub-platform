'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead, useRespondToTeamInvite } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Notification } from '@/types'
import { LocalizedText, LocalizedRelativeTime, translateCurrent } from '@/lib/i18n'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const unreadCount = useUnreadCount()
  const { data: notificationsData } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const respondToInvite = useRespondToTeamInvite()

  const notifications = notificationsData?.items || []

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  const respond = async (notification: Notification, action: 'accept' | 'reject') => {
    const eventId = notification.data?.event_id
    const teamId = notification.data?.team_id
    const memberId = notification.data?.member_id
    if (typeof eventId !== 'string' || typeof teamId !== 'string' || typeof memberId !== 'string') return
    try {
      await respondToInvite.mutateAsync({ action, eventId, teamId, memberId })
      if (!notification.read) await markRead.mutateAsync(notification.id)
      toast.success(translateCurrent(action === 'accept' ? 'Team invitation accepted' : 'Team invitation declined'))
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Unable to process invitation'))
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        ref={triggerRef}
        aria-label={`${translateCurrent('Notifications')}${unreadCount && unreadCount > 0 ? `, ${unreadCount} ${translateCurrent('unread')}` : ''}`}
        aria-expanded={isOpen}
        aria-controls="notification-panel"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 transition-colors hover:bg-accent focus-visible:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount && unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              id="notification-panel"
              role="region"
              aria-label={translateCurrent('Notifications')}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 z-50 mt-2 flex max-h-[calc(100dvh-6rem)] w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border bg-popover shadow-lg"
            >
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-semibold text-sm"><LocalizedText text="Notifications" /></h3>
                {unreadCount && unreadCount > 0 ? (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="h-3 w-3" />
                    <LocalizedText text="Mark all read" />{' '}</button>
                ) : null}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <LocalizedText text="No notifications" />{' '}</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'p-3 border-b last:border-0 cursor-pointer',
                        !notif.read && 'bg-primary/5'
                      )}
                      onClick={() => {
                        if (!notif.read) markRead.mutate(notif.id)
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm',
                            !notif.read && 'font-medium'
                          )}>
                            {translateCurrent(notif.title)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {translateCurrent(notif.message)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {<LocalizedRelativeTime value={notif.sent_at} />}
                          </p>
                          {notif.category === 'team_invite' && !notif.read && (
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" onClick={(event) => { event.stopPropagation(); respond(notif, 'accept') }}><LocalizedText text="Accept" /></Button>
                              <Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); respond(notif, 'reject') }}><LocalizedText text="Decline" /></Button>
                            </div>
                          )}
                        </div>
                        {!notif.read && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
