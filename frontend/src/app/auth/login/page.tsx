'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoginForm } from '@/components/forms/login-form'
import { useAuth } from '@/hooks/useAuth'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { LocalizedText } from '@/lib/i18n'

export default function LoginPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const canManage = user?.role === 'admin' || user?.role === 'organizer'

  // Se a sessão já for de organizador, sigo direto para o painel.
  useEffect(() => {
    if (!isLoading && isAuthenticated && canManage) router.replace('/dashboard')
  }, [canManage, isAuthenticated, isLoading, router])

  if (isLoading) return null
  if (isAuthenticated && canManage) return null

  return (
    <AuthLayout
      eyebrow="HackHub account"
      title="Welcome back"
      description="Sign in to access your participant workspace. Organizer tools appear for accounts granted organizer access by an administrator."
    >
      {isAuthenticated && user && !canManage ? (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <LocalizedText text="A session is already active in this browser. To sign in with an organizer account, sign out first." />
          </p>
          <Button className="w-full" onClick={() => { void logout() }}>
            <LocalizedText text="Sign out and continue" />
          </Button>
          <Link href="/events" className="block text-center text-sm text-primary hover:underline">
            <LocalizedText text="Return to events" />
          </Link>
        </div>
      ) : <LoginForm />}
    </AuthLayout>
  )
}
