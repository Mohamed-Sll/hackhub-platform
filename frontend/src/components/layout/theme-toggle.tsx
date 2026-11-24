'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

const subscribe = () => () => undefined
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function ThemeToggle({ className }: { className?: string }) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useI18n()

  if (!mounted) {
    return <span className={cn('theme-toggle-placeholder', className)} aria-hidden="true" />
  }

  const isDark = resolvedTheme === 'dark'
  const nextTheme = isDark ? 'light' : 'dark'
  const label = t(isDark ? 'Light theme' : 'Dark theme')

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={cn('theme-toggle', className)}
      aria-label={t(isDark ? 'Switch to light theme' : 'Switch to dark theme')}
      title={t(isDark ? 'Switch to light theme' : 'Switch to dark theme')}
    >
      {isDark ? <Sun className="h-3.5 w-3.5" aria-hidden="true" /> : <Moon className="h-3.5 w-3.5" aria-hidden="true" />}
      <span>{label}</span>
    </button>
  )
}
