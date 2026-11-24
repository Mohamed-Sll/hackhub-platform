import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from '@/components/layout/providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Sidebar } from '@/components/layout/sidebar'
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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <div className="app-shell">
            <Sidebar />
            <div className="app-main">
              <Navbar />
              <main className="app-content">{children}</main>
              <Footer />
            </div>
          </div>
          <ToastProvider />
        </Providers>
      </body>
    </html>
  )
}
