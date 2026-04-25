'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Users, Copy, Check } from 'lucide-react'
import { useState } from 'react'

type HomeHeroProps = {
  heroProducts?: any[]
  referralCode?: string
}

function ReferralButton({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-full border border-[#020617]/15 bg-white/80 px-7 py-3.5 text-sm font-semibold text-[#020617] shadow-sm backdrop-blur-sm transition hover:bg-white hover:shadow-md"
    >
      <Users className="h-4 w-4 text-[#020617]/60" />
      Referral a Friend!
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-[#020617]/40" />
      )}
    </button>
  )
}

export default function HomeHero({ referralCode = 'ROORQ10' }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-black/5" style={{ height: 'calc(100svh - 112px)' }}>

      {/* ── Background gradient blobs ── */}
      <div className="absolute inset-0 bg-[#FDFFFE]" />
      <div className="absolute -left-32 -top-20 h-[520px] w-[520px] rounded-full bg-[#9EFF69] opacity-[0.22] blur-[100px]" />
      <div className="absolute left-10 top-32 h-[300px] w-[360px] rounded-full bg-[#FFEB51] opacity-[0.15] blur-[90px]" />
      <div className="absolute -right-20 -top-10 h-[400px] w-[400px] rounded-full bg-[#88E9FF] opacity-[0.18] blur-[100px]" />
      <div className="absolute -bottom-20 -right-10 h-[480px] w-[480px] rounded-full bg-[#FF9CE1] opacity-[0.18] blur-[110px]" />
      <div className="absolute -bottom-10 left-20 h-[320px] w-[380px] rounded-full bg-[#00FFB7] opacity-[0.12] blur-[90px]" />
      <div className="absolute bottom-0 left-1/2 h-[280px] w-[500px] -translate-x-1/2 rounded-full bg-[#FFA7A7] opacity-[0.14] blur-[100px]" />

      {/* ── Left panel — absolute, full left side ── */}
      <div className="absolute left-0 top-0 bottom-0 hidden md:flex md:items-center w-[38%] lg:w-[36%] z-10">
        <Image
          src="/hero-left.png"
          alt="Drop products left"
          fill
          priority
          sizes="38vw"
          className="object-contain object-left-top"
        />
      </div>

      {/* ── Right panel — absolute, full right side ── */}
      <div className="absolute right-0 top-0 bottom-0 hidden md:flex md:items-center w-[38%] lg:w-[36%] z-10">
        <Image
          src="/hero-right.png"
          alt="Drop products right"
          fill
          priority
          sizes="38vw"
          className="object-contain object-right-top"
        />
      </div>

      {/* ── Bottom panel — absolute, bottom center ── */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-[180px] md:w-[220px] lg:w-[260px]">
        <Image
          src="/hero-bottom.png"
          alt="Drop product bottom"
          width={260}
          height={190}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* ── Center copy ── */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 pb-20 text-center">

        {/* Handwriting tagline — matches Figma exactly */}
        <p
          className="mb-3 text-[#020617]/65"
          style={{ fontFamily: "'Caveat', cursive", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 500, letterSpacing: '0.01em' }}
        >
          Roorq, Fashion Discovery Platform!
        </p>

        {/* Main headline */}
        <h1
          className="mx-auto font-black leading-[1.05] tracking-[-0.03em] text-[#020617]"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', maxWidth: '14ch' }}
        >
          Where Style Becomes a Story.
        </h1>

        {/* Subtext — one clean line */}
        <p className="mx-auto mt-5 max-w-[340px] text-[15px] leading-7 text-[#020617]/55 sm:max-w-[420px] sm:text-base">
          India's first Story-Scored vintage marketplace.<br className="hidden sm:block" />
          Campus-first. Drop model. IIT Roorkee.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#020617] px-9 py-4 text-sm font-bold text-white shadow-[0_8px_30px_rgba(2,6,23,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0f172a] hover:shadow-[0_12px_36px_rgba(2,6,23,0.3)]"
          >
            Shop Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <ReferralButton referralCode={referralCode} />
        </div>

      </div>
    </section>
  )
}
