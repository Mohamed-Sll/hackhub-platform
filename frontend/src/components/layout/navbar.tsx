'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LayoutDashboard, LogOut, Menu, User, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from './theme-toggle'
import { useAuth } from '@/hooks/useAuth'
import { NotificationBell } from '@/components/shared/notification-bell'
import { useI18n, LocalizedText } from '@/lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const pageLabels: Record<string, string> = {
  '/': 'Home',
  '/events': 'Discover events',
  '/dashboard': 'Organizer overview',
  '/dashboard/events': 'Manage events',
  '/dashboard/certificates': 'Certificates',
  '/teams': 'My teams',
  '/profile': 'Profile',
  '/auth/login': 'Sign in',
  '/auth/register': 'Create account',
  '/auth/forgot-password': 'Forgot password',
  '/auth/reset-password': 'Reset password',
  '/auth/verify-email': 'Verify email',
}

function getPageLabel(pathname: string) {
  if (pageLabels[pathname]) return pageLabels[pathname]
  if (pathname.startsWith('/dashboard/events/')) return 'Event workspace'
  if (pathname.startsWith('/events/')) return pathname.endsWith('/register') ? 'Event registration' : 'Event details'
  if (pathname.startsWith('/teams/')) return 'Team workspace'
  if (pathname.startsWith('/certificates/verify/')) return 'Verify certificate'
  return 'HackHub'
}

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { user, isAuthenticated, logout } = useAuth()
  const { locale, setLocale, t } = useI18n()
  const canManage = user?.role === 'organizer' || user?.role === 'admin'
  const label = t(getPageLabel(pathname))

  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          ref={menuButtonRef}
          aria-label={mobileMenuOpen ? t('Close navigation menu') : t('Open navigation menu')}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <p className="breadcrumb"><Link className="breadcrumb-brand" href="/" aria-label={t('HackHub home')}><Image src="/icon.svg" alt="" width={18} height={18} aria-hidden="true" /><span>HackHub</span></Link><b aria-hidden="true"><LocalizedText text="/" /></b><strong>{label}</strong></p>
      </div>

      <div className="topbar-actions">
        <div className="language-switch" role="group" aria-label={t('Language')}>
          <button type="button" lang="pt" aria-pressed={locale === 'pt'} className={locale === 'pt' ? 'is-selected' : ''} onClick={() => setLocale('pt')}><LocalizedText text="PT" /></button>
          <button type="button" lang="en" aria-pressed={locale === 'en'} className={locale === 'en' ? 'is-selected' : ''} onClick={() => setLocale('en')}><LocalizedText text="EN" /></button>
        </div>
        <ThemeToggle />
        {isAuthenticated ? (
          <div className="topbar-account">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="account-trigger" aria-label={t('Open account menu')}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback>{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="account-name">{user?.full_name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block">{user?.full_name}</span>
                  <span className="block text-xs font-normal text-muted-foreground">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile"><User className="mr-2 h-4 w-4" />{t('Profile')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/teams"><Users className="mr-2 h-4 w-4" />{t('My teams')}</Link>
                </DropdownMenuItem>
                {canManage && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />{t('Organizer workspace')}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />{t('Sign out')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link href="/auth/login" className="desktop-sign-in">
            <Button variant="secondary" size="sm">{t('Organizer sign in')}</Button>
          </Link>
        )}
      </div>

      {mobileMenuOpen && (
        <nav id="mobile-navigation" className="mobile-navigation" aria-label={t('Main navigation')}>
          <Link href="/" onClick={closeMobileMenu} aria-current={pathname === '/' ? 'page' : undefined}>{t('Home')}</Link>
          <Link href="/events" onClick={closeMobileMenu} aria-current={pathname.startsWith('/events') ? 'page' : undefined}>{t('Discover events')}</Link>
          {canManage && <Link href="/dashboard" onClick={closeMobileMenu}>{t('Organizer overview')}</Link>}
          {canManage && <Link href="/dashboard/events" onClick={closeMobileMenu}>{t('Manage events')}</Link>}
          {isAuthenticated ? (
            <>
              <Link href="/teams" onClick={closeMobileMenu}>{t('My teams')}</Link>
              <Link href="/profile" onClick={closeMobileMenu}>{t('Profile')}</Link>
              <button type="button" onClick={() => { closeMobileMenu(); logout() }}>{t('Sign out')}</button>
            </>
          ) : <Link href="/auth/login" onClick={closeMobileMenu}>{t('Organizer sign in')}</Link>}
        </nav>
      )}
    </header>
  )
}
