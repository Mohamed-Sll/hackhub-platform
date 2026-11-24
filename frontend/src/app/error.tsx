'use client'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { LocalizedText } from '@/lib/i18n'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2"><LocalizedText text="Something went wrong!" /></h1>
        <p className="text-muted-foreground mb-8">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <Button onClick={reset} size="lg">
          <LocalizedText text="Try Again" />{' '}</Button>
      </div>
    </div>
  )
}
