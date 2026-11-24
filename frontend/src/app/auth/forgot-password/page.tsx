'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthLayout } from '@/components/layout/auth-layout'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { LocalizedText, translateCurrent } from '@/lib/i18n'
import { HostedPreviewNotice } from '@/components/layout/hosted-preview'
import { useHostedPreview } from '@/components/layout/providers'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const isHostedPreview = useHostedPreview()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await apiClient.auth.resetPassword(data.email)
      setIsSubmitted(true)
      toast.success(translateCurrent('Password reset request received'))
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Failed to send reset link'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow={isSubmitted ? 'Reset request received' : 'Account security'}
      title={isSubmitted ? 'Check your inbox' : 'Reset your password'}
      description={isSubmitted
        ? 'If the account exists and email delivery is configured, a reset link will arrive. For a local install without email, ask its owner to reset the account from the backend shell.'
        : 'Enter your email. If email delivery is configured, a reset link will be sent. For a local install without email, its owner can reset the account from the backend shell.'}
      storyTitle={isSubmitted ? <><LocalizedText text="A fresh start" /><span><LocalizedText text="." /></span></> : undefined}
      storyDescription={isSubmitted
        ? 'Password links expire so someone else cannot use an old email.'
        : 'Keep your account secure and get back to the work that matters.'}
    >
      {isHostedPreview ? (
        <HostedPreviewNotice title="Password recovery is unavailable in this frontend preview" />
      ) : isSubmitted ? (
        <div className="auth-success" role="status">
          <CheckCircle className="h-9 w-9 text-green-600" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            <LocalizedText text="If an account exists with that email, you will receive a password reset link shortly." />{' '}</p>
          <Link href="/auth/login" className="auth-inline-link">
            <ArrowLeft className="h-4 w-4" /> <LocalizedText text="Back to sign in" />{' '}</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" loading={isLoading}><LocalizedText text="Send reset link" /></Button>
          <p className="auth-links">
            <span><LocalizedText text="Remembered it?" /></span>
            <Link href="/auth/login"><LocalizedText text="Sign in" /></Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
