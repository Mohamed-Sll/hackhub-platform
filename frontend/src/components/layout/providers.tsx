'use client'
import { createContext, useContext, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { MotionConfig } from 'framer-motion'
import { useAuthStore } from '@/store/auth.store'
import { I18nProvider } from '@/lib/i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const HostedPreviewContext = createContext(false)

export function useHostedPreview() {
  return useContext(HostedPreviewContext)
}

export function Providers({
  children,
  isHostedPreview = false,
}: {
  children: React.ReactNode
  isHostedPreview?: boolean
}) {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage)

  useEffect(() => {
    if (isHostedPreview) {
      useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false })
      return
    }

    loadFromStorage()
  }, [isHostedPreview, loadFromStorage])

  return (
    <HostedPreviewContext.Provider value={isHostedPreview}>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </I18nProvider>
    </HostedPreviewContext.Provider>
  )
}
