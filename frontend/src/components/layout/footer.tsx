'use client'
import Link from 'next/link'
import { Code2, MoveUpRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const repository = 'https://github.com/Mohamed-Sll/hackhub-platform'

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="app-footer">
      <span>{t('HackHub · Open source · MIT')}</span>
      <div className="footer-links">
        <Link href="/events">{t('Discover events')}</Link>
        <a href={`${repository}/issues`} target="_blank" rel="noreferrer">{t('Report an issue')}</a>
        <a href={repository} target="_blank" rel="noreferrer" aria-label={t('HackHub source on GitHub')}>
          <Code2 className="h-3.5 w-3.5" aria-hidden="true" /> {t('Source')} <MoveUpRight className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </footer>
  )
}
