import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, ShieldCheck, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { formatPrice } from '@/lib/format'
import { VEHICLE_CLASSES, vehicleClassLabel } from '@/lib/vehicles/classes'
import { WARRANTY_YEARS } from '@/lib/contact'
import { categoryStyle } from '@/features/home'
import { PageHero } from './page-hero'

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

const PROMISES = [
  { icon: Clock, title: 'Done in 60–90 minutes', text: 'Most jobs finish within an hour and a half, at your door.' },
  { icon: ShieldCheck, title: `${WARRANTY_YEARS}-year results warranty`, text: 'If the haze comes back from normal use, we put it right.' },
  { icon: Wallet, title: 'Pay after the job', text: 'No deposit. You pay once you have seen the result.' },
]

export function ServicesPage({ services }: { services: ServiceRow[] }) {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Every service, one clear price"
        description="Pricing depends on your car's size, so you always see an exact figure for your vehicle before you book. Every job is done at your home or office in Lahore."
      />

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 sm:pb-14">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((s, i) => {
            const style = categoryStyle(s.category)
            const Icon = style.icon
            return (
              <Reveal key={s.id} delay={i * 0.05}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm dk:rounded-md">
                  <div className="relative h-44 w-full">
                    <Image
                      src={style.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 560px, 100vw"
                      className="object-cover"
                      style={{ objectPosition: style.position }}
                    />
                    <div className="hero-scrim absolute inset-0" aria-hidden />
                    <span className="absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow dk:rounded-xs">
                      <Icon className="size-5" />
                    </span>
                    {s.isPackage && (
                      <span className="absolute top-3 right-3 rounded-full bg-ink-950/80 px-3 py-1 text-[11px] font-semibold tracking-wider text-chrome-100 uppercase">
                        Package
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-display text-xl font-semibold text-foreground">{s.name}</h2>
                    {s.description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>}

                    {s.comingSoon ? (
                      <p className="mt-5 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">Coming soon</p>
                    ) : (
                      <>
                        <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
                          {VEHICLE_CLASSES.map((c) => (
                            <div key={c} className="rounded-lg border border-border bg-background px-2 py-2.5 dk:rounded-xs">
                              <dt className="text-[11px] font-medium text-muted-foreground">{vehicleClassLabel(c)}</dt>
                              <dd className="mt-0.5 font-display text-sm font-semibold whitespace-nowrap text-gold-ink">
                                {s.prices[c] != null ? formatPrice(s.prices[c]!) : '—'}
                              </dd>
                            </div>
                          ))}
                        </dl>
                        <Button className="mt-5 w-full sm:w-auto sm:self-start" render={<Link href="/quote" />}>
                          Get my exact price
                          <ArrowRight className="size-4" data-icon="inline-end" />
                        </Button>
                      </>
                    )}
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-16">
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-3 dk:rounded-md">
          {PROMISES.map((p) => (
            <div key={p.title} className="flex gap-3">
              <p.icon className="mt-0.5 size-5 shrink-0 text-gold-ink" />
              <div>
                <h3 className="font-medium text-foreground">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Prices shown are per vehicle size. Your exact total is confirmed on the next screen, before you book.
        </p>
      </section>
    </>
  )
}
