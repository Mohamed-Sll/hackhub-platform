'use client'
import { useRef, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TeamCard } from '@/components/shared/team-card'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useJoinTeamByCode, useMyTeams } from '@/hooks/useTeams'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { LocalizedText, translateCurrent, useI18n } from '@/lib/i18n'

export default function TeamsPage() {
  const { t } = useI18n()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { data: teams, isLoading, error, refetch } = useMyTeams()
  const joinByCode = useJoinTeamByCode()
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [invitationCode, setInvitationCode] = useState('')
  const joinButtonRef = useRef<HTMLButtonElement>(null)
  const invitationCodeInputRef = useRef<HTMLInputElement>(null)

  if (authLoading) return <LoadingState className="min-h-[calc(100vh-4rem)]" />
  if (!isAuthenticated) {
    router.push('/auth/login')
    return null
  }

  const handleJoinByCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await joinByCode.mutateAsync(invitationCode.trim().toUpperCase())
      toast.success(translateCurrent('Team joined successfully'))
      setInvitationCode('')
      setShowJoinDialog(false)
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Unable to join team'))
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold"><LocalizedText text="My Teams" /></h1>
              <p className="text-muted-foreground mt-1"><LocalizedText text="Manage your teams and invitations" /></p>
            </div>
            <Button ref={joinButtonRef} onClick={() => setShowJoinDialog(true)}>
              <Users className="mr-2 h-4 w-4" aria-hidden="true" />
              <LocalizedText text="Join with code" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
                  <div className="h-5 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                  <div className="flex -space-x-2">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorState message="Failed to load teams" onRetry={() => refetch()} />
          ) : !teams || teams.length === 0 ? (
            <EmptyState
              icon={<Users className="h-16 w-16" />}
              title="No teams yet"
              description="Join an event to create or join a team"
              action={{ label: 'Browse Events', onClick: () => router.push('/events') }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <TeamCard key={team.id} team={team} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            invitationCodeInputRef.current?.focus()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            joinButtonRef.current?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle><LocalizedText text="Join with code" /></DialogTitle>
          </DialogHeader>
          <form id="join-team-form" onSubmit={handleJoinByCode}>
            <Input
              ref={invitationCodeInputRef}
              id="team-invitation-code"
              label="Invitation code"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={invitationCode}
              onChange={(event) => setInvitationCode(event.target.value.toUpperCase())}
              placeholder={t('Enter invitation code')}
              required
            />
          </form>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowJoinDialog(false)}>
              <LocalizedText text="Cancel" />
            </Button>
            <Button type="submit" form="join-team-form" disabled={!invitationCode.trim() || joinByCode.isPending}>
              <LocalizedText text="Join team" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
