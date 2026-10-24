'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { categoryStyle } from '../lib/category-style'

export type HomeService = {
  id: string
  name: string
  description: string | null
  category: string | null
}


export function ServicesSection({ services }: { services: HomeService[] }) {
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">
          What we do
        </span>
        <span className="rule-gold mt-3" />
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Our services
        </h2>
        <p className="mt-3 text-muted-foreground">
          Every job priced upfront, carried out at your doorstep in Lahore, and backed by a
          3-year results warranty.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const style = categoryStyle(service.category)
          const Icon = style.icon
          return (
            <Reveal key={service.id} delay={(i % 3) * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card className="h-full gap-0 rounded-3xl ring-1 ring-foreground/10 transition-shadow hover:shadow-xl hover:shadow-gold-700/15 dk:rounded-md dk:ring-gold-500/45">
                  <Image
                    src={style.image}
                    alt={service.name}
                    width={900}
                    height={600}
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                    style={{ objectPosition: style.position }}
                    className="aspect-video w-full object-cover"
                  />
                  <CardContent className="relative flex flex-col items-start gap-3 pt-4">
                    <span className="-mt-10 flex size-12 items-center justify-center rounded-xl border border-gold-hairline bg-muted text-gold shadow-md ring-4 ring-card">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                    {/* No figure here. Every service is priced per vehicle
                        class, so a single "from" number is the cheapest tier
                        and reads as the price to anyone driving anything
                        bigger. The quote flow asks for the car first and can
                        then show a figure that is actually theirs. */}
                    <p className="mt-auto text-sm text-muted-foreground">
                      Priced by your car —{' '}
                      <Link
                        href="/quote"
                        className="font-semibold text-gold-ink underline-offset-4 hover:underline"
                      >
                        get your price
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Reveal>
          )
        })}
      </div>

      <Reveal delay={0.1} className="mt-10 text-center">
        <Button size="lg" variant="outline" className="h-11" render={<Link href="/quote" />}>
          See your exact price
        </Button>
      </Reveal>
    </section>
  )
}
