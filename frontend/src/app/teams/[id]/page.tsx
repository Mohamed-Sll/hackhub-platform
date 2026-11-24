'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, UserPlus, LogOut, Trash2, Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { ProjectForm } from '@/components/forms/project-form'
import { useTeamById, useLeaveTeam, useRemoveMember, useInviteMember, useTransferLeadership } from '@/hooks/useTeams'
import { useAuth } from '@/hooks/useAuth'
import { useCreateProject } from '@/hooks/useProjects'
import { generateInitials, getRoleBadgeColor } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { CreateProjectRequest, TeamMember } from '@/types'
import { LocalizedText, translateCurrent, useI18n } from '@/lib/i18n'

export default function TeamDetailPage() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string
  const { user } = useAuth()
  const { data: team, isLoading, error, refetch } = useTeamById(teamId)
  const [inviteUserId, setInviteUserId] = useState('')
  const [copied, setCopied] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const eventId = team?.event_id || ''
  const leaveTeam = useLeaveTeam(eventId, teamId)
  const removeMember = useRemoveMember(eventId, teamId)
  const inviteMember = useInviteMember(eventId, teamId)
  const transferLeadership = useTransferLeadership(eventId, teamId)
  const createProject = useCreateProject(eventId)

  if (isLoading) return <LoadingState className="min-h-[calc(100vh-4rem)]" />
  if (error) return <ErrorState message="Failed to load team" onRetry={() => refetch()} className="min-h-[calc(100vh-4rem)]" />
  if (!team) return null

  const isLeader = team.leader_id === user?.id

  const handleCopyInviteCode = () => {
    if (!team.invitation_code) return
    navigator.clipboard.writeText(team.invitation_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success(translateCurrent('Invite code copied!'))
  }

  const handleInviteMember = async () => {
    if (!inviteUserId.trim()) return
    try {
      await inviteMember.mutateAsync(inviteUserId.trim())
      toast.success(translateCurrent('Invitation sent!'))
      setInviteUserId('')
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Failed to invite member'))
    }
  }

  const handleLeaveTeam = async () => {
    try {
      await leaveTeam.mutateAsync()
      toast.success(translateCurrent('Left team successfully'))
      router.push('/teams')
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Failed to leave team'))
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember.mutateAsync(memberId)
      toast.success(translateCurrent('Member removed'))
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Failed to remove member'))
    }
  }

  const handleCreateProject = async (data: CreateProjectRequest) => {
    try {
      await createProject.mutateAsync(data)
      toast.success(translateCurrent('Project created!'))
      setShowProjectForm(false)
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Failed to create project'))
    }
  }

  const handleTransferLeadership = async (userId: string) => {
    try {
      await transferLeadership.mutateAsync(userId)
      toast.success(translateCurrent('Leadership transferred'))
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Failed to transfer leadership'))
    }
  }

  const roleLabels: Record<string, string> = {
    leader: 'Leader',
    member: 'Member',
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/teams" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            <LocalizedText text="Back to Teams" />{' '}</Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{team.name}</CardTitle>
                      {team.description && (
                        <p className="text-muted-foreground mt-1">{team.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg"><LocalizedText text="Members (" />{team.members?.length || 0}<LocalizedText text=")" /></CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {team.members?.map((member: TeamMember) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{generateInitials(member.full_name || member.username || 'U')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.full_name}
                            {member.user_id === team.leader_id && (
                              <Crown className="inline h-3 w-3 text-yellow-500 ml-1" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground"><LocalizedText text="@" />{member.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleBadgeColor(member.role)}>
                          <LocalizedText text={roleLabels[member.role] || member.role} />
                        </Badge>
                        {isLeader && member.user_id !== user?.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('Transfer leadership')}
                              onClick={() => handleTransferLeadership(member.user_id)}
                            >
                              <Crown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('Remove member')}
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {isLeader && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg"><LocalizedText text="Team Actions" /></CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium"><LocalizedText text="Invite Code" /></label>
                      <div className="flex gap-2">
                        <code className="flex-1 px-3 py-2 rounded-md bg-muted text-sm font-mono">
                          {team.invitation_code}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={t(copied ? 'Invite code copied!' : 'Copy invite code')}
                          onClick={handleCopyInviteCode}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="team-invite-user-id" className="text-sm font-medium"><LocalizedText text="Invite by User ID" /></label>
                      <div className="flex gap-2">
                        <Input
                          id="team-invite-user-id"
                          placeholder="user ID"
                          value={inviteUserId}
                          onChange={(e) => setInviteUserId(e.target.value)}
                        />
                        <Button type="button" variant="outline" aria-label={t('Invite member')} onClick={handleInviteMember}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />
                    <p className="text-xs text-muted-foreground"><LocalizedText text="Transfer leadership to another accepted member before leaving the team." /></p>
                  </CardContent>
                </Card>
              )}

              {!isLeader && (
                <Card>
                  <CardContent className="pt-6">
                    <Button variant="destructive" className="w-full" onClick={handleLeaveTeam}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <LocalizedText text="Leave Team" />{' '}</Button>
                  </CardContent>
                </Card>
              )}

              {isLeader && !showProjectForm && (
                <Card>
                  <CardContent className="pt-6">
                    <Button className="w-full" onClick={() => setShowProjectForm(true)}>
                      <LocalizedText text="Create Project" />{' '}</Button>
                  </CardContent>
                </Card>
              )}

              {isLeader && showProjectForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg"><LocalizedText text="New Project" /></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProjectForm
                      teamId={teamId}
                      eventId={eventId}
                      onSubmit={handleCreateProject}
                      isLoading={createProject.isPending}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
