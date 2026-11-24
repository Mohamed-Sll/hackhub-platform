'use client'
import Link from 'next/link'
import { RegisterForm } from '@/components/forms/register-form'
import { AuthLayout } from '@/components/layout/auth-layout'
import { LocalizedText } from '@/lib/i18n'

export default function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Participant account"
      title="Create account"
      description="Create a participant account for teams and projects, or register for a public event with your name and email. Organizer access is granted by the installation administrator."
      storyTitle={<><LocalizedText text="Make the event happen" /><span><LocalizedText text="." /></span></>}
      storyDescription="Build a team, keep project work together and help your event move forward."
    >
      <RegisterForm />
      <p className="auth-links mt-3">
        <span><LocalizedText text="Joining an event?" /></span>
        <Link href="/events"><LocalizedText text="Explore events" /></Link>
      </p>
    </AuthLayout>
  )
}
