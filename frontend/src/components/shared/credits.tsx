'use client'
import { Heart } from 'lucide-react'
import { LocalizedText } from '@/lib/i18n'

export function Credits() {
  return (
    <div className="py-4 text-center text-xs text-muted-foreground border-t">
      <p className="flex items-center justify-center gap-1">
        <LocalizedText text="Developed with" />{' '}<Heart className="h-3 w-3 text-red-500 fill-red-500" /> <LocalizedText text="by" />{' '}<a
          href="https://github.com/mohamedsillahhh-cloud"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:text-primary transition-colors"
        >
          <LocalizedText text="Mohamed Sillah" />{' '}</a>
      </p>
    </div>
  )
}
