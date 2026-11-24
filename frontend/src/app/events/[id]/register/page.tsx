'use client'

import { FormEvent, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { useEvent, useRegisterForEvent } from '@/hooks/useEvents'
import { isAxiosError } from 'axios'
import { LocalizedText, LocalizedDate } from '@/lib/i18n'

export default function RegisterForEventPage() {
  const params = useParams()
  const eventId = params.id as string
  const { data: event, isLoading, error, refetch } = useEvent(eventId)
  const registration = useRegisterForEvent(eventId)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (isLoading) return <LoadingState className="min-h-[calc(100vh-4rem)]" />
  if (error) return <ErrorState message="We could not load this event." onRetry={() => refetch()} />
  if (!event) return null

  const canRegister = event.status === 'published' || event.status === 'in_progress'

  const handleSubmit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault()
    setErrorMessage('')
    try {
      await registration.mutateAsync({ full_name: fullName.trim(), email: email.trim() })
      setSubmitted(true)
    } catch (error) {
      const detail = isAxiosError(error) ? error.response?.data?.detail : undefined
      setErrorMessage(typeof detail === 'string' ? detail : 'We could not submit your registration. Please try again.')
    }
  }

  return (
    <section aria-label="Event registration" className="min-h-[calc(100vh-4rem)] px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Link href={`/events/${event.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> <LocalizedText text="Back to event" />{' '}</Link>

        <div className="mt-10 grid gap-12 md:grid-cols-[1fr_0.9fr] md:gap-16">
          <section>
            <p className="eyebrow"><LocalizedText text="Event registration" /></p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl"><LocalizedText text="Save your place." /></h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              <LocalizedText text="Register for" />{' '}<span className="font-medium text-foreground">{event.title}</span> <LocalizedText text="with your name and email. You do not need to create an account." />{' '}</p>

            <dl className="mt-10 divide-y divide-border border-y border-border">
              <div className="flex gap-4 py-4">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground"><LocalizedText text="Dates" /></dt>
                  <dd className="mt-1 text-sm font-medium">
                    {<LocalizedDate value={event.start_date} pattern="short" />} – {<LocalizedDate value={event.end_date} pattern="short" />}
                  </dd>
                </div>
              </div>
              {event.location && (
                <div className="flex gap-4 py-4">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground"><LocalizedText text="Location" /></dt>
                    <dd className="mt-1 text-sm font-medium">{event.is_online ? 'Online' : event.location}</dd>
                  </div>
                </div>
              )}
            </dl>
          </section>

          <section className="border-t border-border pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            {submitted ? (
              <div role="status" className="py-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-5 w-5" />
                </span>
                <h2 className="mt-6 text-2xl font-semibold"><LocalizedText text="You’re on the list." /></h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  <LocalizedText text="Your registration for" />{' '}{event.title} <LocalizedText text="has been recorded. The event organizer can use your email to manage this registration." />{' '}</p>
                <Link href={`/events/${event.id}`} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  <LocalizedText text="Return to event" />{' '}<ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : canRegister ? (
              <>
                <h2 className="text-xl font-semibold"><LocalizedText text="Your details" /></h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  <LocalizedText text="The organizer receives these details to manage the attendee list. Your email is not shown on the public event page." />{' '}</p>
                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="registration-name" className="text-sm font-medium"><LocalizedText text="Full name" /></label>
                    <input
                      id="registration-name"
                      name="full_name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={255}
                      value={fullName}
                      onChange={(eventChange) => setFullName(eventChange.target.value)}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="registration-email" className="text-sm font-medium"><LocalizedText text="Email address" /></label>
                    <input
                      id="registration-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={255}
                      value={email}
                      onChange={(eventChange) => setEmail(eventChange.target.value)}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
                  <Button type="submit" className="w-full" loading={registration.isPending}>
                    <LocalizedText text="Register for event" />{' '}</Button>
                </form>
              </>
            ) : (
              <div role="status" className="py-5">
                <h2 className="text-xl font-semibold"><LocalizedText text="Registration is closed" /></h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  <LocalizedText text="This event is no longer accepting registrations. You can still review its details and schedule." />{' '}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}
