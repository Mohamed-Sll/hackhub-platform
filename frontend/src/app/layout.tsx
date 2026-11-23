import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from '@/components/layout/providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ToastProvider } from '@/components/ui/toast'

export const metadata: Metadata = {
  title: {
    default: 'HackHub — Hackathons, built together',
    template: '%s | HackHub',
  },
  description: 'An open-source workspace for hackathon events, teams, project submissions, judging, rankings, and certificates.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <ToastProvider />
        </Providers>
      </body>
    </html>
  )
}
