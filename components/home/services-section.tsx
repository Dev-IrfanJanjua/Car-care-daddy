'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  Droplets,
  Lightbulb,
  RectangleHorizontal,
  Eye,
  Sun,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Reveal } from './reveal'

export type HomeService = {
  id: string
  name: string
  description: string | null
  category: string | null
  fromPrice: number | null
}

// Keyed off the `category` column in the services table. Anything unmapped
// falls through to a neutral wrench, so adding a category never breaks the page.
const CATEGORY_STYLES: Record<string, { icon: LucideIcon; gradient: string; imageId: number }> = {
  windshield: { icon: Droplets, gradient: 'from-sky-500 to-brand', imageId: 1071 },
  headlights: { icon: Lightbulb, gradient: 'from-amber-400 to-orange-500', imageId: 1076 },
  windows: { icon: RectangleHorizontal, gradient: 'from-cyan-500 to-brand', imageId: 1060 },
  mirrors: { icon: Eye, gradient: 'from-violet-500 to-brand', imageId: 1051 },
  sunroof: { icon: Sun, gradient: 'from-rose-400 to-orange-500', imageId: 1040 },
}

const FALLBACK = { icon: Wrench, gradient: 'from-zinc-500 to-brand', imageId: 1043 }

export function ServicesSection({ services }: { services: HomeService[] }) {
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Auto glass, repaired properly
        </h2>
        <p className="mt-3 text-muted-foreground">
          Chips, cracks, hazing, and foggy headlights — every job priced upfront and done at your
          driveway.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const style = CATEGORY_STYLES[service.category ?? ''] ?? FALLBACK
          const Icon = style.icon
          return (
            <Reveal key={service.id} delay={(i % 3) * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card className="h-full gap-0 ring-1 ring-foreground/10 transition-shadow hover:shadow-xl hover:shadow-brand/10">
                  <Image
                    src={`https://picsum.photos/id/${style.imageId}/600/400`}
                    alt=""
                    width={600}
                    height={400}
                    unoptimized
                    className="aspect-video w-full object-cover"
                  />
                  <CardContent className="relative flex flex-col items-start gap-3 pt-4">
                    <span
                      className={`-mt-10 flex size-12 items-center justify-center rounded-xl bg-linear-to-br ${style.gradient} text-white shadow-md ring-4 ring-card`}
                    >
                      <Icon className="size-6" />
                    </span>
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                    {service.fromPrice !== null && (
                      <p className="mt-auto text-sm font-semibold text-brand">
                        From ${service.fromPrice.toFixed(0)}
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
