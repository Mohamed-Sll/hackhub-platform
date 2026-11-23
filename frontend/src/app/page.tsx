'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarDays,
  Code2,
  MoveUpRight,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { usePublicDashboardStats } from '@/hooks/useDashboard'

const workflow = [
  {
    number: '01',
    title: 'Set the brief',
    description: 'Publish an event, define its challenges, and set the criteria that matter.',
  },
  {
    number: '02',
    title: 'Build together',
    description: 'Participants find a team, shape an idea, and submit one shared project.',
  },
  {
    number: '03',
    title: 'Make it count',
    description: 'Judges score the work, results update live, and certificates are ready to verify.',
  },
]

const capabilities = [
  { icon: CalendarDays, title: 'Events with structure', detail: 'One lifecycle for dates, challenges, team limits, and event updates.' },
  { icon: UsersRound, title: 'Teams that can move', detail: 'Invitations, join codes, clear leadership, and a shared project space.' },
  { icon: Trophy, title: 'Judging with context', detail: 'Weighted criteria, judge evaluations, and a live ranking in one flow.' },
  { icon: Award, title: 'Results that travel', detail: 'PDF certificates with QR verification for participants and winners.' },
]

function Metric({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="border-l border-white/15 pl-4 first:border-0 first:pl-0">
      <p className="font-mono text-2xl font-semibold tabular-nums text-white">
        {value === undefined ? '—' : value.toLocaleString()}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/55">{label}</p>
    </div>
  )
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const { data: stats } = usePublicDashboardStats()
  const reduceMotion = useReducedMotion()

  const enter = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: 'easeOut' as const },
  })

  return (
    <div className="overflow-hidden">
      <section className="hackhub-hero relative isolate -mt-16 flex min-h-[min(820px,100svh)] items-center overflow-hidden bg-[#11101a] px-5 pb-16 pt-28 text-white sm:px-8 lg:px-12">
        <div aria-hidden="true" className="hackhub-hero-grid absolute inset-0 opacity-50" />
        <div aria-hidden="true" className="absolute -right-32 top-12 h-[34rem] w-[34rem] rounded-full border border-violet-300/10 sm:right-0 lg:right-[7%]">
          <div className="absolute inset-8 rounded-full border border-violet-300/10" />
          <div className="absolute inset-20 rounded-full border border-violet-300/10" />
          <div className="absolute left-1/2 top-[-5px] h-2.5 w-2.5 rounded-full bg-lime-300 shadow-[0_0_28px_rgba(190,242,100,0.7)]" />
        </div>

        <div className="relative mx-auto grid w-full max-w-[1380px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="max-w-3xl">
            <motion.p {...enter(0)} className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-violet-200">
              <span className="h-px w-8 bg-lime-300" />
              The open-source hackathon workspace
            </motion.p>
            <motion.h1 {...enter(0.08)} className="text-[clamp(3.4rem,8vw,7.8rem)] font-semibold leading-[0.91] tracking-[-0.075em]">
              Make room
              <br />
              for <span className="text-violet-300">big ideas.</span>
            </motion.h1>
            <motion.p {...enter(0.16)} className="mt-8 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              From the first event brief to the final award, HackHub gives organizers, teams, and judges one clear place to move the work forward.
            </motion.p>
            <motion.div {...enter(0.24)} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="group h-12 bg-violet-300 px-6 text-[#171321] hover:bg-violet-200">
                <Link href="/events">
                  Explore events <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button asChild size="lg" variant="outline" className="h-12 border-white/20 bg-white/[0.04] px-6 text-white hover:bg-white/10 hover:text-white">
                  <Link href="/auth/register">
                    Create an account <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </motion.div>
            <motion.div {...enter(0.32)} className="mt-14 grid max-w-lg grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-5 sm:grid-cols-4">
              <Metric label="Events" value={stats?.total_events} />
              <Metric label="People" value={stats?.active_participants} />
              <Metric label="Projects" value={stats?.total_projects} />
              <Metric label="Teams" value={stats?.total_teams} />
            </motion.div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, x: 18 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            className="relative mx-auto hidden aspect-square w-full max-w-[520px] lg:block"
          >
            <svg viewBox="0 0 520 520" role="img" aria-label="Three connected stages of a hackathon: event, team, and award" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="orbit" x1="78" y1="70" x2="444" y2="445" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C4B5FD" stopOpacity=".7" />
                  <stop offset="1" stopColor="#A3E635" stopOpacity=".7" />
                </linearGradient>
              </defs>
              <circle cx="260" cy="260" r="184" stroke="url(#orbit)" strokeOpacity=".38" strokeDasharray="2 10" />
              <circle cx="260" cy="260" r="143" stroke="#C4B5FD" strokeOpacity=".14" />
              <path d="M148 151 327 139 356 331 183 383 148 151Z" stroke="#C4B5FD" strokeOpacity=".35" strokeWidth="1.5" />
              <path d="m148 151 146 84 33-96m-33 96 62 96m-62-96-111 148" stroke="#C4B5FD" strokeOpacity=".38" strokeWidth="1.5" />
              <circle cx="148" cy="151" r="7" fill="#D9F99D" />
              <circle cx="327" cy="139" r="7" fill="#C4B5FD" />
              <circle cx="356" cy="331" r="7" fill="#D9F99D" />
              <circle cx="183" cy="383" r="5" fill="#C4B5FD" />
              <circle cx="261" cy="235" r="70" fill="#1C1928" stroke="#C4B5FD" strokeOpacity=".38" />
              <path d="M239 273v-76h13l33 48v-48h13v76h-12l-34-49v49h-13Z" fill="#F5F3FF" />
              <text x="96" y="126" fill="#E9D5FF" fontFamily="ui-monospace,monospace" fontSize="11" letterSpacing="2">BRIEF</text>
              <text x="326" y="116" fill="#E9D5FF" fontFamily="ui-monospace,monospace" fontSize="11" letterSpacing="2">BUILD</text>
              <text x="367" y="337" fill="#D9F99D" fontFamily="ui-monospace,monospace" fontSize="11" letterSpacing="2">AWARD</text>
            </svg>
            <div className="absolute bottom-[14%] left-[8%] flex items-center gap-3 border-l border-lime-300/70 bg-[#11101a]/75 py-2 pl-4 pr-3 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-lime-300" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/70">One connected workflow</span>
            </div>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute bottom-7 right-8 hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 lg:flex">
          Scroll to explore <ArrowDownRight className="h-4 w-4" />
        </div>
      </section>

      <section className="mx-auto grid max-w-[1380px] gap-8 px-5 py-20 sm:px-8 md:grid-cols-[0.75fr_1.25fr] md:py-28 lg:px-12">
        <div>
          <p className="eyebrow">A single system, start to finish</p>
          <h2 className="mt-5 max-w-sm text-3xl font-semibold tracking-tight sm:text-4xl">Less coordination overhead. More time for the work.</h2>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {capabilities.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="grid gap-3 py-6 sm:grid-cols-[44px_1fr_1.2fr] sm:items-center sm:gap-5"
              >
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.7} />
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="bg-[#f3f1f8] py-20 text-[#211d2c] dark:bg-[#191722] dark:text-foreground sm:py-24">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">The event lifecycle</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">From kickoff to recognition.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">A practical sequence that keeps every role oriented as the event moves forward.</p>
          </div>
          <div className="grid border-t border-[#211d2c]/15 dark:border-white/15 md:grid-cols-3">
            {workflow.map((item, index) => (
              <motion.article
                key={item.number}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="border-b border-[#211d2c]/15 py-7 dark:border-white/15 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-0 md:last:pr-0"
              >
                <span className="font-mono text-xs tracking-[0.18em] text-primary">/{item.number}</span>
                <h3 className="mt-8 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1380px] flex-col gap-8 px-5 py-20 sm:px-8 md:flex-row md:items-center md:justify-between md:py-24 lg:px-12">
        <div>
          <p className="eyebrow">Built in the open</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Bring the next idea to the starting line.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Explore an event, or help improve the platform with the community.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="group h-12 px-6">
            <Link href={isAuthenticated ? '/events' : '/auth/register'}>
              {isAuthenticated ? 'Explore events' : 'Get started'}
              <MoveUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Button>
          <a href="https://github.com/Mohamed-Sll/hackhub-platform" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="h-12 px-6">
              <Code2 className="mr-2 h-4 w-4" /> View source
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
