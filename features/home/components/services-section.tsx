import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, ShieldCheck } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { siteButton } from '@/components/ui/site-button'
import { formatPrice } from '@/lib/format'
import { categoryMeta, categoryStyle } from '../lib/category-style'
import { SectionHead, SectionShell } from './section-head'

export type HomeService = {
  id: string
  name: string
  description: string | null
  category: string | null
  /** cheapest price across vehicle classes; null when nothing is priced yet */
  fromPrice: number | null
  /** on hold: shown, but not bookable and without a price */
  comingSoon?: boolean
}

// The first four cards form the 7/5 + 5/7 bento; any further ones sit three to a row.
const SPAN = ['lg:col-span-7 lg:min-h-[460px]', 'lg:col-span-5 lg:min-h-[460px]', 'lg:col-span-5', 'lg:col-span-7']

/**
 * "What we do": image cards from the services table. Name, blurb and the From
 * price are live data; duration and warranty wording come from the category.
 */
const WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']

export function ServicesSection({ services }: { services: HomeService[] }) {
  const live = services.filter((s) => !s.comingSoon).length
  const count = WORDS[live] || 'Many'
  return (
    <SectionShell id="services">
      <Reveal>
        <SectionHead
          eyebrow="What we do"
          title={`${count} ${live === 1 ? 'way' : 'ways'} we make your car`}
          accent="look & see like new"
          lead="Every job is priced upfront, done at your doorstep in Lahore and backed by a 3-year results warranty."
        />
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
        {services.map((s, i) => {
          const style = categoryStyle(s.category)
          const meta = categoryMeta(s.category)
          return (
            <Reveal key={s.id} delay={(i % 2) * 0.08} className={`flex ${SPAN[i] ?? 'lg:col-span-4'}`}>
              <article className="zone-dark group relative isolate flex min-h-[340px] w-full items-end overflow-hidden rounded-[26px] border border-line-2 bg-ink-800 transition duration-300 hover:-translate-y-1.5 hover:border-gold-500/60 hover:shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--gold-500)_35%,transparent)] sm:min-h-[380px] dk:rounded-sm dk:border-gold-500/45">
                <Image
                  src={style.image}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 600px, (min-width:640px) 50vw, 100vw"
                  style={{ objectPosition: style.position }}
                  className={`-z-20 object-cover brightness-110 saturate-110 transition-transform duration-1000 group-hover:scale-[1.06] ${s.comingSoon ? 'grayscale-[0.6]' : ''}`}
                />
                <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,color-mix(in_oklab,var(--ink-900)_97%,transparent)_0%,color-mix(in_oklab,var(--ink-900)_82%,transparent)_28%,color-mix(in_oklab,var(--ink-900)_34%,transparent)_60%,transparent_100%)]" />

                {s.comingSoon ? (
                  <span className="absolute top-5 left-5 rounded-[9px] border border-line-2 bg-ink-900/70 px-3.5 py-1.5 text-[0.72rem] font-bold tracking-[0.08em] text-chrome-100 uppercase backdrop-blur-md">
                    Coming soon
                  </span>
                ) : i === 0 && (
                  <span className="absolute top-5 left-5 rounded-[9px] bg-gold-500 px-3.5 py-1.5 text-[0.72rem] font-bold tracking-[0.08em] text-gold-foreground uppercase">
                    Most popular
                  </span>
                )}
                {meta && !s.comingSoon && (
                  <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-[9px] border border-line-2 bg-ink-900/60 px-3 py-1.5 text-[0.74rem] text-chrome-100 backdrop-blur-md">
                    <Clock aria-hidden className="size-[13px] text-gold-ink" />
                    {meta.duration}
                  </span>
                )}
                {s.fromPrice != null && !s.comingSoon && (
                  <span className="absolute top-[58px] right-5 rounded-[9px] bg-gold-500 px-3 py-1 text-[0.74rem] font-bold text-gold-foreground">
                    From {formatPrice(s.fromPrice)}
                  </span>
                )}

                <div className="w-full p-7">
                  <h3 className="mb-2 font-display text-2xl font-semibold text-chrome-100">{s.name}</h3>
                  {meta && !s.comingSoon && (
                    <span className="mb-2.5 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-gold-400">
                      <ShieldCheck aria-hidden className="size-[15px]" />
                      {meta.warranty}
                    </span>
                  )}
                  {s.description && (
                    <p className="mb-3.5 max-h-36 overflow-hidden text-[0.94rem] text-chrome-300 opacity-100 transition-all duration-500 [@media(hover:hover)]:mb-0 [@media(hover:hover)]:max-h-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:mb-3.5 [@media(hover:hover)]:group-focus-within:max-h-36 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:mb-3.5 [@media(hover:hover)]:group-hover:max-h-36 [@media(hover:hover)]:group-hover:opacity-100">
                      {s.description}
                    </p>
                  )}
                  <Link
                    href={`/services#${s.id}`}
                    className="inline-flex items-center gap-2 text-[0.92rem] font-semibold text-gold-ink after:absolute after:inset-0 after:content-[''] focus-visible:outline-none [&_svg]:transition-transform group-hover:[&_svg]:translate-x-1"
                  >
                    Details <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>

      <div className="mt-5 text-center">
        <Link href="/services" className={siteButton({ variant: 'ghost' })}>
          Explore all services <ArrowRight />
        </Link>
      </div>
    </SectionShell>
  )
}
