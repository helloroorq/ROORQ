'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Drop 001 — May 15 2026, 6:00 PM IST (UTC+5:30)
const DROP_001_UTC = new Date('2026-05-15T12:30:00.000Z')

function getTimeLeft() {
  const now = Date.now()
  const distance = DROP_001_UTC.getTime() - now
  if (distance <= 0) return null
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  }
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-slate-950">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</span>
    </div>
  )
}

export default function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!timeLeft) return null

  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 rounded-[28px] border border-stone-200 bg-white px-6 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-400">Coming soon</span>
            <p className="mt-0.5 text-sm font-bold text-slate-950 tracking-tight">
              Drop 001 — The IITR Edit&nbsp;&nbsp;·&nbsp;&nbsp;15 May, 6 PM IST
            </p>
          </div>

          <div className="hidden sm:block w-px h-8 bg-stone-200" />

          <div className="flex items-end gap-3">
            <Digit value={timeLeft.days} label="Days" />
            <span className="text-xl font-black text-stone-300 mb-4">:</span>
            <Digit value={timeLeft.hours} label="Hrs" />
            <span className="text-xl font-black text-stone-300 mb-4">:</span>
            <Digit value={timeLeft.minutes} label="Min" />
            <span className="text-xl font-black text-stone-300 mb-4">:</span>
            <Digit value={timeLeft.seconds} label="Sec" />
          </div>
        </div>

        <Link
          href="/drops"
          className="shrink-0 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Get notified
        </Link>
      </div>
    </section>
  )
}
