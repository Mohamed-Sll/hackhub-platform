'use client'

import { Info } from 'lucide-react'
import { LocalizedText } from '@/lib/i18n'
import { useHostedPreview } from '@/components/layout/providers'

const repositoryUrl = 'https://github.com/Mohamed-Sll/hackhub-platform'

export function HostedPreviewBanner() {
  const isHostedPreview = useHostedPreview()

  if (!isHostedPreview) return null

  return (
    <aside className="hosted-preview-banner" role="status">
      <Info aria-hidden="true" />
      <p>
        <strong><LocalizedText text="Frontend preview only" /></strong>{' '}
        <LocalizedText text="The API and SQLite database are not hosted here. Clone the repository and run it locally to use accounts, events, and teams." />{' '}
        <a href={`${repositoryUrl}#run-locally`}>
          <LocalizedText text="View source and local setup" />
        </a>
      </p>
    </aside>
  )
}

export function HostedPreviewNotice({
  title = 'This feature needs the local backend',
}: {
  title?: string
}) {
  const isHostedPreview = useHostedPreview()

  if (!isHostedPreview) return null

  return (
    <section className="hosted-preview-notice" role="status">
      <Info aria-hidden="true" />
      <div>
        <h2><LocalizedText text={title} /></h2>
        <p><LocalizedText text="This Vercel preview has no API or database, so it cannot save or load account and event data." /></p>
        <a href={`${repositoryUrl}#run-locally`}>
          <LocalizedText text="View source and local setup" />
        </a>
      </div>
    </section>
  )
}
