import { Check } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { SectionHead, SectionShell } from './section-head'

type Testimonial = {
  /** null for reviews that carry no name (the database stores rating + comment only) */
  name: string | null
  comment: string
  rating: number
}

const placeholders: Testimonial[] = [
  { name: 'Ayesha K.', comment: "Water spots on my Corolla's windshield were awful. Completely gone — night driving is so much easier now.", rating: 5 },
  { name: 'Bilal A.', comment: 'Wiper marks I thought were permanent came right off. Worth every rupee.', rating: 5 },
  { name: 'Hamza S.', comment: 'Booked in the morning, done at my office in DHA the same afternoon. Very convenient.', rating: 5 },
  { name: 'Fatima R.', comment: 'Showed up on time and the price was exactly what the website quoted. No surprises.', rating: 5 },
  { name: 'Usman T.', comment: 'Got the full glass polish on my Fortuner. The whole car looks newer.', rating: 4 },
]

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="flex w-[min(380px,86vw)] shrink-0 flex-col gap-[18px] rounded-[26px] border border-line bg-card p-[30px] shadow-[0_1px_0_#fff_inset,0_22px_50px_-34px_rgba(18,32,46,0.3)] dk:rounded-sm dk:border-gold-500/45 dk:shadow-none">
      <div aria-label={`${t.rating} out of 5 stars`} className="tracking-[2px] text-gold-ink">
        {'★'.repeat(t.rating)}
        <span className="text-line-2">{'★'.repeat(5 - t.rating)}</span>
      </div>
      <blockquote className="text-[1.02rem] text-chrome-100">&ldquo;{t.comment}&rdquo;</blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <span className="grid size-[42px] place-items-center rounded-full bg-gold-500 font-display font-bold text-gold-foreground">
          {t.name ? t.name.charAt(0) : <Check aria-hidden className="size-4" strokeWidth={3} />}
        </span>
        <div>
          <b className="block text-[0.95rem] font-semibold text-chrome-100">{t.name ?? 'Verified customer'}</b>
          <small className="block text-[0.78rem] text-chrome-400">
            {t.name ? 'Verified customer · Lahore' : 'Lahore'}
          </small>
        </div>
      </figcaption>
    </figure>
  )
}

/**
 * Review cards in an endless, auto-playing ribbon (pauses on hover). Real
 * public reviews from the database when there are any, the sample ones until
 * the first review comes in.
 */
export function TestimonialsSection({ reviews }: { reviews?: { rating: number; comment: string | null }[] }) {
  const fromDb: Testimonial[] = (reviews ?? [])
    .filter((r) => r.comment)
    .map((r) => ({ name: null, comment: r.comment!, rating: r.rating }))

  const items = fromDb.length > 0 ? fromDb : placeholders
  // Two copies side by side, translated by half: a seamless loop. Enough
  // copies to overflow even a very wide screen.
  const half = items.length >= 4 ? items : [...items, ...items]
  const looped = [...half, ...half]

  return (
    <SectionShell id="reviews" flush className="overflow-hidden">
      <Reveal>
        <SectionHead eyebrow="Kind words" title="Loved by drivers across Lahore" />
      </Reveal>
      <div className="group relative -mx-[18px] overflow-hidden px-[18px] pb-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] sm:-mx-6 sm:px-6">
        <div className="flex w-max animate-marquee gap-5 group-hover:[animation-play-state:paused] motion-reduce:animate-none" style={{ animationDuration: `${Math.max(40, half.length * 9)}s` }}>
          {looped.map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
