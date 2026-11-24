'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthLayout } from '@/components/layout/auth-layout'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { LocalizedText, translateCurrent } from '@/lib/i18n'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').max(256),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error(translateCurrent('Invalid reset link'))
      return
    }
    setIsLoading(true)
    try {
      await apiClient.auth.confirmReset(token, data.password)
      toast.success(translateCurrent('Password reset successfully! Please sign in.'))
      router.push('/auth/login')
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail || 'This reset link may have expired. Request a new one and use the latest email.')
      toast.error(translateCurrent(error?.response?.data?.detail || 'Failed to reset password'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout
        eyebrow="Link unavailable"
        title="This reset link is missing"
        description="Request a new reset email, then use the latest link from your inbox."
        storyTitle={<><LocalizedText text="Start again," /><br /><LocalizedText text="safely" /><span><LocalizedText text="." /></span></>}
        storyDescription="Password links expire so someone else cannot use an old email."
      >
        <Button asChild><Link href="/auth/forgot-password"><LocalizedText text="Request a new link" /></Link></Button>
        <p className="auth-links mt-4"><span><LocalizedText text="Remembered your password?" /></span><Link href="/auth/login"><LocalizedText text="Sign in" /></Link></p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Password reset"
      title="Choose a new password"
      description="Use at least 8 characters for your new password."
      storyTitle={<><LocalizedText text="A fresh start" /><span><LocalizedText text="." /></span></>}
      storyDescription="Your password reset link gives you a safe way back into your HackHub workspace."
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {errorMessage && <p className="auth-error" role="alert">{errorMessage} <Link href="/auth/forgot-password"><LocalizedText text="Request a new link" /></Link></p>}
        <Input
          label="New password"
          type="password"
          placeholder="Enter new password"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Confirm new password"
          icon={<Lock className="h-4 w-4" />}
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />
        <Button type="submit" loading={isLoading}><LocalizedText text="Update password" /></Button>
      </form>
    </AuthLayout>
  )
}
