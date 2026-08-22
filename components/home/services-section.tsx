'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Droplets, Lightbulb, Sparkles, Car, Wrench, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Reveal } from './reveal'
import { formatPrice } from '@/lib/format'

export type HomeService = {
  id: string
  name: string
  description: string | null
  category: string | null
  fromPrice: number | null
}

// Keyed off the `category` column in the services table. Anything unmapped
// falls through to a neutral wrench, so adding a category never breaks the page.
//
// Every tile shares one navy-and-gold treatment on purpose: the icon alone
// distinguishes the service. Colour-coding each category (sky / cyan / amber /
// violet) put five competing hues on one screen and read as a template, not a
// brand.
const CATEGORY_STYLES: Record<string, { icon: LucideIcon; image: string; position: string }> = {
  windshield: {
    icon: Droplets,
    image: '/images/service-windshield.jpg',
    // The subject (hazed glass) sits high in the frame.
    position: 'center 35%',
  },
  glass: {
    icon: Sparkles,
    image: '/images/service-glass-polish.jpg',
    position: 'center',
  },
  headlights: {
    icon: Lightbulb,
    image: '/images/service-headlight.jpg',
    // Portrait source; the lit headlight is low in the frame, so bias the crop
    // down or a 3:2 card would cut it off entirely.
    position: 'center 70%',
  },
  detailing: {
    icon: Car,
    image: '/images/service-detailing.jpg',
    position: 'center',
  },
}

const FALLBACK = {
  icon: Wrench,
  image: '/images/service-glass-polish.jpg',
  position: 'center',
}

export function ServicesSection({ services }: { services: HomeService[] }) {
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">
          What we do
        </span>
        <span className="rule-gold mt-3" />
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Our services
        </h2>
        <p className="mt-3 text-muted-foreground">
          Every job priced upfront, carried out at your doorstep in Lahore, and backed by a
          3-year results warranty.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const style = CATEGORY_STYLES[service.category ?? ''] ?? FALLBACK
          const Icon = style.icon
          return (
            <Reveal key={service.id} delay={(i % 3) * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card className="h-full gap-0 ring-1 ring-foreground/10 transition-shadow hover:shadow-xl hover:shadow-navy-900/15">
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
                    <span className="-mt-10 flex size-12 items-center justify-center rounded-xl border border-gold-700/60 bg-linear-to-br from-navy-700 to-navy-950 text-gold shadow-md ring-4 ring-card">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                    {service.fromPrice !== null && (
                      <p className="mt-auto text-sm text-muted-foreground">
                        From{' '}
                        <span className="font-bold text-gold-ink">
                          {formatPrice(service.fromPrice)}
                        </span>
                      </p>
                    )}
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
