'use client'
import type { ReactNode } from 'react'
import { LocalizedText, useI18n } from '@/lib/i18n'

type AuthLayoutProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  storyTitle?: ReactNode
  storyDescription?: string
}

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  storyTitle = <><LocalizedText text="Make the event happen" /><span><LocalizedText text="." /></span></>,
  storyDescription = 'Plan in one place. Publish to everyone. Keep the event moving.',
}: AuthLayoutProps) {
  const { t } = useI18n()
  return (
    <section className="auth-shell" aria-labelledby="auth-title">
      <aside className="auth-story">
        <div>
          <p className="eyebrow"><LocalizedText text="HackHub / Account access" /></p>
          <h2>{storyTitle}</h2>
          <p className="auth-story-copy">{t(storyDescription)}</p>
        </div>
        <div className="auth-orbit" aria-hidden="true"><span><LocalizedText text="H." /></span></div>
        <p className="auth-story-note"><LocalizedText text="BUILT FOR PEOPLE WHO BRING BUILDERS TOGETHER" /></p>
      </aside>
      <div className="auth-form-panel">
        <div className="auth-form-content">
          <p className="eyebrow">{t(eyebrow)}</p>
          <h1 id="auth-title">{t(title)}</h1>
          <p className="auth-description">{t(description)}</p>
          {children}
        </div>
      </div>
    </section>
  )
}
