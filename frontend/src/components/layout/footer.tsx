import Link from 'next/link'
import { Code2, MoveUpRight } from 'lucide-react'

const repository = 'https://github.com/Mohamed-Sll/hackhub-platform'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1380px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="HackHub home">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground">H</span>
              <span className="font-semibold tracking-tight">HackHub</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Open-source tools for the people who build hackathons.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <Link href="/events" className="text-muted-foreground transition-colors hover:text-foreground">Explore events</Link>
            <a href={`${repository}/issues`} target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">Report an issue</a>
            <a href={repository} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary">
              <Code2 className="h-4 w-4" /> Source <MoveUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} HackHub · MIT License</p>
          <p>Built by <a href="https://github.com/mohamedsillahhh-cloud" target="_blank" rel="noreferrer" className="underline-offset-4 hover:text-foreground hover:underline">Mohamed Sillah</a></p>
        </div>
      </div>
    </footer>
  )
}
