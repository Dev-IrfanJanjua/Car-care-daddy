import Image from 'next/image'
import Link from 'next/link'
import { WhatsAppIcon } from '@/components/icons/brand-icons'
import { Reveal } from '@/components/motion/reveal'
import { siteButton } from '@/components/ui/site-button'
import { formatPrice } from '@/lib/format'
import { VEHICLE_CLASSES, vehicleClassLabel } from '@/lib/vehicles/classes'
import { categoryFeatures, categoryLabel, categoryMeta, categoryStyle, SectionHead, SectionShell } from '@/features/home'
import { cn } from '@/lib/utils'

export type ServiceRow = {
  id: string
  name: string
  description: string | null
  category: string | null
  comingSoon: boolean
  isPackage: boolean
  /** price per vehicle class; missing class = not offered for it */
  prices: Partial<Record<string, number>>
}

/**
 * One alternating row per service: photo, name, what's included, the price for
 * each car size, and the two ways to book. Everything but the bullet points and
 * duration/warranty wording (copy per category) comes from the services table.
 */
export function ServicesList({ services, whatsappBase }: { services: ServiceRow[]; whatsappBase: string }) {
  return (
    <SectionShell className="pt-5 sm:pt-5">
      {services.map((s, i) => {
        const style = categoryStyle(s.category)
        const meta = categoryMeta(s.category)
        const features = categoryFeatures(s.category)
        return (
          <Reveal key={s.id}>
            <article
              id={s.id}
              className="grid scroll-mt-28 items-center gap-8 border-b border-line py-10 last:border-0 lg:grid-cols-2 lg:gap-16 lg:py-14"
            >
              <div
                className={cn(
                  'zone-dark relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-ink-800 dk:rounded-sm',
                  i % 2 === 1 && 'lg:order-2'
                )}
              >
                <Image
                  src={style.image}
                  alt={s.name}
                  fill
                  sizes="(min-width:1024px) 560px, 100vw"
                  style={{ objectPosition: style.position }}
                  className="object-cover brightness-110 saturate-110"
                />
              </div>

              <div>
                <span className="font-display text-[0.9rem] tracking-[0.2em] text-gold-ink uppercase">
                  {String(i + 1).padStart(2, '0')} — {categoryLabel(s.category)}
                </span>
                <h2 className="mt-2.5 mb-3.5 font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-chrome-100">
                  {s.name}
                </h2>
                {s.description && <p className="max-w-[60ch] text-[1.05rem] text-chrome-400">{s.description}</p>}

                {features.length > 0 && (
                  <ul className="my-6 grid gap-x-5 gap-y-2.5 sm:grid-cols-2">
                    {features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-[0.92rem] text-chrome-100">
                        <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-500/20 text-gold-ink">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m2 6.5 3 3 5-6" />
                          </svg>
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {!s.comingSoon && (
                  <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {VEHICLE_CLASSES.map((c) => (
                      <span key={c} className="rounded-lg border border-line bg-card px-3 py-2.5">
                        <small className="block text-[0.7rem] tracking-[0.08em] text-chrome-400 uppercase">{vehicleClassLabel(c)}</small>
                        <b className="font-display text-[0.98rem] font-semibold whitespace-nowrap text-gold-ink">
                          {s.prices[c] != null ? formatPrice(s.prices[c]!) : '—'}
                        </b>
                      </span>
                    ))}
                  </div>
                )}

                {meta && (
                  <div className="mb-6 flex flex-wrap gap-6 text-[0.9rem] text-chrome-400">
                    <div>
                      <b className="block font-display text-chrome-100">{meta.duration}</b>Typical time
                    </div>
                    <div>
                      <b className="block font-display text-chrome-100">Doorstep</b>We come to you
                    </div>
                    <div>
                      <b className="block font-display text-chrome-100">{meta.warranty.replace(/ ·.*$/, '')}</b>Warranty
                    </div>
                  </div>
                )}

                {s.comingSoon ? (
                  <p className="inline-block rounded-lg bg-tint px-4 py-2 text-sm font-medium text-chrome-400">Coming soon</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <Link href="/quote" className={siteButton()}>
                      Book this service
                    </Link>
                    <a
                      href={`${whatsappBase}?text=${encodeURIComponent(`Hi, I would like a price for ${s.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={siteButton({ variant: 'ghost' })}
                    >
                      <WhatsAppIcon /> Get price
                    </a>
                  </div>
                )}
              </div>
            </article>
          </Reveal>
        )
      })}
    </SectionShell>
  )
}

/** Every service against every car size, as a table. */
export function PricingTable({ services }: { services: ServiceRow[] }) {
  const priced = services.filter((s) => !s.comingSoon)
  return (
    <SectionShell id="pricing" className="pt-5 sm:pt-5">
      <Reveal>
        <SectionHead
          center
          eyebrow="Pricing"
          title="Simple prices,"
          accent="by car type"
          lead="The price depends on the size of your car. Not sure which size yours is? Look it up below."
        />
      </Reveal>
      <Reveal>
        <div className="overflow-x-auto rounded-[14px] border border-line-2 bg-card shadow-[0_22px_50px_-34px_rgba(18,32,46,0.3)] dk:rounded-sm dk:border-gold-500/45 dk:shadow-none">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr>
                <th className="border-b border-line px-6 pt-5 pb-4 text-left align-bottom text-[0.74rem] font-semibold tracking-[0.12em] text-chrome-400 uppercase">
                  Service
                </th>
                {VEHICLE_CLASSES.map((c) => (
                  <th key={c} className="border-b border-line px-4 pt-5 pb-4 text-center font-display text-[0.95rem] font-semibold text-chrome-100">
                    {vehicleClassLabel(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {priced.map((s) => (
                <tr key={s.id} className="group">
                  <td className="border-b border-line px-6 py-[18px] font-medium text-chrome-100 group-last:border-0 group-hover:bg-gold-500/5">
                    {s.name}
                  </td>
                  {VEHICLE_CLASSES.map((c) => (
                    <td key={c} className="border-b border-line px-4 py-[18px] text-center font-medium text-chrome-100 group-last:border-0 group-hover:bg-gold-500/5">
                      {s.prices[c] != null ? formatPrice(s.prices[c]!) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3.5 text-center text-[0.84rem] text-chrome-500">
          Prices shown are per vehicle size. Your exact total is confirmed on the next screen, before you book.
        </p>
      </Reveal>
    </SectionShell>
  )
}
