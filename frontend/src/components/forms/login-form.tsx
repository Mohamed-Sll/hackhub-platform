'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { LocalizedText, translateCurrent, useI18n } from '@/lib/i18n'
import { HostedPreviewNotice } from '@/components/layout/hosted-preview'
import { useHostedPreview } from '@/components/layout/providers'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const { t } = useI18n()
  const { login, isLoggingIn } = useAuth()
  const isHostedPreview = useHostedPreview()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data)
      toast.success(translateCurrent('Welcome back!'))
      // Depois do login, encaminho a pessoa pela função da conta.
      router.replace(user.role === 'admin' || user.role === 'organizer' ? '/dashboard' : '/events')
    } catch (error: any) {
      toast.error(translateCurrent(error?.response?.data?.detail || 'Login failed. Please try again.'))
    }
  }

  if (isHostedPreview) {
    return <HostedPreviewNotice title="Sign-in is unavailable in this frontend preview" />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter your password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.password?.message}
        {...register('password')}
        rightElement={
          <button
            type="button"
            aria-label={t(showPassword ? 'Hide password' : 'Show password')}
            aria-pressed={showPassword}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />
      <div className="flex items-center justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          <LocalizedText text="Forgot password?" />{' '}</Link>
      </div>
      <Button type="submit" className="w-full" loading={isLoggingIn}>
        <LocalizedText text="Sign In" />{' '}</Button>
      <p className="text-center text-sm text-muted-foreground">
        <LocalizedText text="Don't have an account?" />{' '}
        <Link href="/auth/register" className="text-primary hover:underline font-medium">
          <LocalizedText text="Register" />{' '}</Link>
      </p>
    </form>
  )
}
