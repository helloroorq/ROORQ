import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const DIMENSIONS = [
  {
    number: '01',
    name: 'Origin',
    emoji: '📍',
    description: 'Where did this piece come from? A Bombay thrift pile, a Delhi surplus export, a foreign market haul — origin tells you how rare and how far this piece has travelled.',
    low: 'Unknown origin, mass-market stock',
    high: 'Rare source, documented provenance',
    color: 'bg-amber-50 border-amber-200',
    accent: 'text-amber-600',
  },
  {
    number: '02',
    name: 'Era',
    emoji: '🕰️',
    description: "The decade matters. A 90s Levi's denim jacket and a 2015 Levi's jacket are not the same thing. We verify the manufacturing era using labels, stitching patterns, and hardware.",
    low: 'Recent production, no era value',
    high: 'Verified decade, era-defining piece',
    color: 'bg-blue-50 border-blue-200',
    accent: 'text-blue-600',
  },
  {
    number: '03',
    name: 'Brand',
    emoji: '🏷️',
    description: 'Not all brands age equally. We rate the brand based on its cultural weight in the vintage world — heritage labels, discontinued lines, and collabs score higher.',
    low: 'Generic or unrecognised label',
    high: 'Heritage brand, collector-grade label',
    color: 'bg-rose-50 border-rose-200',
    accent: 'text-rose-600',
  },
  {
    number: '04',
    name: 'Cultural Value',
    emoji: '🎭',
    description: "Does this piece carry cultural weight? A jacket from a music movement, a tee worn during a protest era, a silhouette that defined a generation — culture is what makes vintage matter.",
    low: 'No cultural significance',
    high: 'Culturally iconic, era-defining piece',
    color: 'bg-purple-50 border-purple-200',
    accent: 'text-purple-600',
  },
  {
    number: '05',
    name: 'Condition',
    emoji: '✅',
    description: 'Every item is inspected by our team — stitching, fabric integrity, fading, odour, hardware. We clean and verify before listing. What you see is exactly what arrives.',
    low: 'Heavy wear, visible damage',
    high: 'Excellent vintage, near-mint condition',
    color: 'bg-green-50 border-green-200',
    accent: 'text-green-600',
  },
]

const EXAMPLE_PRODUCT = {
  name: 'American Eagle Vintage Denim',
  scores: [7, 8, 6, 7, 9],
  total: '7.4',
  badge: 'Rare Find',
}

export default function StoryScorePage() {
  const totalScore = EXAMPLE_PRODUCT.scores.reduce((a, b) => a + b, 0) / EXAMPLE_PRODUCT.scores.length

  return (
    <>
      <Navbar />
      <main className="bg-white">

        {/* HERO */}
        <section className="border-b border-stone-100 bg-[radial-gradient(ellipse_at_top,_rgba(241,236,227,0.6)_0%,_rgba(255,255,255,1)_70%)] px-4 py-20 text-center sm:px-6 lg:py-28">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            Only on Roorq
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-black leading-[1.06] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
            The Story Score
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-500">
            Every piece on Roorq is rated across 5 dimensions by our team — giving you a verified, honest score before you buy. Not random thrift. <span className="font-semibold text-slate-700">Curated vintage with a passport.</span>
          </p>

          {/* Big score display */}
          <div className="mx-auto mt-12 flex max-w-sm flex-col items-center gap-3 rounded-[28px] border border-stone-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">Example Score</p>
            <p className="text-sm font-semibold text-slate-600">{EXAMPLE_PRODUCT.name}</p>
            <div className="flex items-end gap-2">
              <span className="text-7xl font-black tracking-tighter text-slate-950">{EXAMPLE_PRODUCT.total}</span>
              <span className="mb-3 text-2xl font-bold text-stone-300">/10</span>
            </div>
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-5 rounded-full transition-all ${
                    i < Math.round(totalScore) ? 'bg-slate-950' : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>
            <span className="mt-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              ✦ {EXAMPLE_PRODUCT.badge}
            </span>
            <div className="mt-2 grid w-full grid-cols-5 gap-1 text-center">
              {DIMENSIONS.map((d, i) => (
                <div key={d.name} className="flex flex-col items-center gap-1">
                  <span className="text-lg font-black text-slate-950">{EXAMPLE_PRODUCT.scores[i]}</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-stone-400">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS — 5 dimensions */}
        <section className="px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">The 5 Dimensions</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
              What goes into a score
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-500">
              Each dimension is rated 1–10 by our team. The final Story Score is the average — an honest, verified number you can trust.
            </p>

            <div className="mt-12 space-y-6">
              {DIMENSIONS.map((d) => (
                <div
                  key={d.name}
                  className={`rounded-[20px] border p-6 sm:p-8 ${d.color}`}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 text-4xl">{d.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black uppercase tracking-widest ${d.accent}`}>{d.number}</span>
                        <h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">{d.name}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{d.description}</p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-400">1–3</span>
                          <span className="text-xs text-slate-500">{d.low}</span>
                        </div>
                        <div className="hidden text-stone-200 sm:block">→</div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${d.accent}`}>8–10</span>
                          <span className="text-xs text-slate-500">{d.high}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RARITY BADGES */}
        <section className="border-t border-stone-100 bg-stone-50 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">Rarity Tiers</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950">
              Your score = your badge
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-slate-500">
              Every item on Roorq gets a rarity badge based on its Story Score.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Common', range: '1–4', bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' },
                { label: 'Good Find', range: '5–6', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                { label: 'Rare Find', range: '7–8', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                { label: 'Ultra Rare', range: '9–10', bg: 'bg-slate-950', text: 'text-white', border: 'border-slate-950' },
              ].map((tier) => (
                <div key={tier.label} className={`rounded-[16px] border p-5 ${tier.bg} ${tier.border}`}>
                  <p className={`text-2xl font-black tracking-tight ${tier.text}`}>{tier.range}</p>
                  <p className={`mt-1 text-sm font-bold ${tier.text}`}>{tier.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHO SCORES IT */}
        <section className="border-t border-stone-100 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">Our Process</p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
                  Scored by humans.<br />Not an algorithm.
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-500">
                  Every item is physically inspected by the Roorq team before it gets listed. We source from vendors, verify the piece in person, and assign the score ourselves.
                </p>
                <p className="mt-4 text-base leading-8 text-slate-500">
                  No seller can fake their own score. No AI guess-work. Just honest, hands-on verification — so you know exactly what you&apos;re buying.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {['Physical inspection', 'Label verification', 'Condition testing', 'Era authentication'].map((step) => (
                    <span key={step} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {step}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-8">
                <p className="text-sm font-bold text-slate-950">From the founders</p>
                <blockquote className="mt-4 text-lg leading-8 text-slate-600 italic">
                  &ldquo;We were tired of buying &apos;vintage&apos; pieces that turned out to be H&M from 2019. The Story Score is our promise — if it&apos;s on Roorq, it&apos;s been verified by us, in person, before it reaches you.&rdquo;
                </blockquote>
                <p className="mt-4 text-sm font-semibold text-slate-500">— Harish, Abusaad & Ajaz · IIT Roorkee</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-stone-100 bg-slate-950 px-4 py-20 text-center text-white sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">Drop 001 — 28 March, 6 PM</p>
          <h2 className="mx-auto mt-4 max-w-xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Ready to find something with a real story?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-white/60">
            Every piece in Drop 001 has been Story-Scored by our team. Limited stock. Once sold, gone forever.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-stone-100"
            >
              Shop Drop 001
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sell on Roorq
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
