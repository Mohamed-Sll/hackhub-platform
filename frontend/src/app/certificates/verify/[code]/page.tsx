'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { LocalizedText, LocalizedDate } from '@/lib/i18n'

export default function VerifyCertificatePage() {
  const params = useParams()
  const code = params.code as string
  const { data: certificate, isLoading, error } = useQuery({
    queryKey: ['certificate-verification', code],
    queryFn: () => apiClient.certificates.verify(code),
    enabled: !!code,
    retry: false,
  })

  if (isLoading) return <LoadingState className="min-h-[calc(100vh-4rem)]" />

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {error || !certificate ? (
          <div className="border-y py-12 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-2xl font-semibold"><LocalizedText text="Certificate not valid" /></h1>
            <p className="mt-2 text-muted-foreground"><LocalizedText text="This verification code was not found or failed validation." /></p>
            <Link href="/" className="mt-6 inline-block"><Button variant="outline"><LocalizedText text="Return to HackHub" /></Button></Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 border-b pb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400"><LocalizedText text="Verified by HackHub" /></p>
                <h1 className="text-2xl font-semibold"><LocalizedText text="Valid certificate" /></h1>
              </div>
            </div>
            <dl className="divide-y">
              <div className="grid gap-1 py-5 sm:grid-cols-3"><dt className="text-sm text-muted-foreground"><LocalizedText text="Type" /></dt><dd className="sm:col-span-2 font-medium capitalize">{certificate.type}</dd></div>
              <div className="grid gap-1 py-5 sm:grid-cols-3"><dt className="text-sm text-muted-foreground"><LocalizedText text="Recipient" /></dt><dd className="sm:col-span-2 font-medium">{certificate.recipient_name}</dd></div>
              <div className="grid gap-1 py-5 sm:grid-cols-3"><dt className="text-sm text-muted-foreground"><LocalizedText text="Event" /></dt><dd className="sm:col-span-2 font-medium">{certificate.event_title}</dd></div>
              <div className="grid gap-1 py-5 sm:grid-cols-3"><dt className="text-sm text-muted-foreground"><LocalizedText text="Issued" /></dt><dd className="sm:col-span-2 font-medium">{<LocalizedDate value={certificate.issued_at} pattern="short" />}</dd></div>
              <div className="grid gap-1 py-5 sm:grid-cols-3"><dt className="text-sm text-muted-foreground"><LocalizedText text="Verification code" /></dt><dd className="sm:col-span-2 break-all font-mono text-sm">{certificate.verification_code}</dd></div>
            </dl>
            <div className="mt-8 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground"><LocalizedText text="Signature and issuer record confirmed." /></p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
