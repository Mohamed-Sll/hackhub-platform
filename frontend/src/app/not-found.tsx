import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LocalizedText } from '@/lib/i18n'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4"><LocalizedText text="404" /></h1>
        <h2 className="text-2xl font-semibold mb-2"><LocalizedText text="Page not found" /></h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          <LocalizedText text="The page you are looking for does not exist or has been moved." />{' '}</p>
        <Link href="/">
          <Button size="lg"><LocalizedText text="Go Home" /></Button>
        </Link>
      </div>
    </div>
  )
}
