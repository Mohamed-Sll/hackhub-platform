'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AuthLayout } from '@/components/layout/auth-layout'
import { apiClient } from '@/lib/api'
import { LocalizedText } from '@/lib/i18n'

export default function VerifyEmailPage() {
  const token = useSearchParams().get('token')
  const verification = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => apiClient.auth.verifyEmail(token as string),
    enabled: Boolean(token),
    retry: false,
  })

  const isInvalid = !token || verification.isError

  return (
    <AuthLayout
      eyebrow="One last step"
      title={isInvalid ? 'This link is unavailable' : verification.isSuccess ? 'Email verified' : 'Verify your email'}
      description={isInvalid
        ? 'This verification link is invalid or expired. You can return to sign in and request help from your organizer.'
        : verification.isSuccess
          ? 'Your email has been verified.'
          : 'Verification keeps your account and event ownership secure.'}
      storyTitle={<><LocalizedText text="Check your" /><br /><LocalizedText text="inbox" /><span><LocalizedText text="." /></span></>}
      storyDescription="Follow the link sent to your email to finish setting up your HackHub account."
    >
      <div className="auth-success" role="status" aria-live="polite">
        {verification.isPending && token && <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden="true" />}
        {verification.isSuccess && <CheckCircle2 className="h-9 w-9 text-green-600" aria-hidden="true" />}
        {isInvalid && <XCircle className="h-9 w-9 text-destructive" aria-hidden="true" />}
        <p className="text-sm text-muted-foreground">
          {verification.isPending && token
            ? <LocalizedText text="Verifying your email?" />
            : verification.isSuccess
              ? <LocalizedText text="Your email has been verified." />
              : <LocalizedText text="This verification link is invalid or expired." />}
        </p>
        {!verification.isPending && (
          <Button asChild><Link href="/auth/login"><LocalizedText text="Go to sign in" /></Link></Button>
        )}
      </div>
    </AuthLayout>
  )
}
