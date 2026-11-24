'use client'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import { Button } from './button'
import { LocalizedText, useI18n } from '@/lib/i18n'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  const { t } = useI18n()
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2"><LocalizedText text="Error" /></h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{t(message)}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <LocalizedText text="Try Again" />{' '}</Button>
      )}
    </div>
  )
}
