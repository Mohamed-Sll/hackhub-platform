'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Award,
  CalendarDays,
  Home,
  LayoutDashboard,
  LogIn,
  UsersRound,
  UserRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n'

const publicLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/events', label: 'Discover events', icon: CalendarDays },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()
  const canManage = user?.role === 'admin' || user?.role === 'organizer'

  const groups = [
    { label: 'Discover', links: publicLinks },
    ...(canManage
      ? [{
          label: 'Organizer',
          links: [
            { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
            { href: '/dashboard/events', label: 'Manage events', icon: CalendarDays },
            { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
          ],
        }]
      : []),
    ...(isAuthenticated
      ? [{
          label: 'Your space',
          links: [
            { href: '/teams', label: 'My teams', icon: UsersRound },
            { href: '/profile', label: 'Profile', icon: UserRound },
          ],
        }]
      : [{
          label: 'Account',
          links: [{ href: '/auth/login', label: 'Organizer sign in', icon: LogIn }],
        }]),
  ]

  return (
    <aside className="app-rail" aria-label="Main navigation">
      <Link href="/" className="rail-brand" aria-label={`HackHub — ${t('Home')}`}>
        <Image src="/icon.svg" alt="" width={31} height={31} className="rail-mark" aria-hidden="true" />
        <span>HackHub</span>
      </Link>

      <nav className="rail-navigation">
        {groups.map((group) => (
          <section key={group.label} className="rail-group" aria-label={t(group.label)}>
            <h2 className="rail-label">{t(group.label)}</h2>
            {group.links.map((link) => {
              const Icon = link.icon
              // No dashboard, ativo só a página geral ou a secção atual.
              const active = pathname === link.href || (
                link.href !== '/' && link.href !== '/dashboard' && pathname.startsWith(`${link.href}/`)
              )
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn('rail-link', active && 'is-active')}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="rail-icon" aria-hidden="true" />
                  <span>{t(link.label)}</span>
                </Link>
              )
            })}
          </section>
        ))}
      </nav>

      <div className="rail-bottom">
        <p className="rail-note">{t('Open-source tools for the people who build hackathons.')}</p>
      </div>
    </aside>
  )
}
