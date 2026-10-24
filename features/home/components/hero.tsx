'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/icons/brand-icons'
import { formatPrice } from '@/lib/format'
import { WARRANTY_YEARS } from '@/lib/contact'

const POINTS = [
  'Free doorstep service',
  'Done in 60–90 minutes',
  `${WARRANTY_YEARS}-year results warranty`,
  'Pay after the job',
]

export type HeroMedia = {
  type: 'video' | 'image'
  videoUrl: string
  imageUrl: string
  posterUrl: string
}

const DEFAULT_MEDIA: HeroMedia = { type: 'video', videoUrl: '', imageUrl: '', posterUrl: '' }

type HeroProps = {
  /** admin-controlled photo/video; omitted fields fall back to the bundled ones */
  media?: HeroMedia
  whatsappUrl: string
  /** cheapest price of the first service, for the floating "starting from" chip */
  startingPrice: number | null
  /** the price finder, rendered by the page so it can stay a server-fed component */
  children: ReactNode
}

/**
 * Home hero: copy on the left, framed photo on the right, price finder
 * underneath. The photo is an arch in the light theme and a double brass frame
 * in the dark one -- same markup, the `dk:` variant swaps the shape.
 */
export function Hero({ whatsappUrl, startingPrice, children, media = DEFAULT_MEDIA }: HeroProps) {
  const showImage = media.type === 'image' && !!media.imageUrl
  const poster = media.posterUrl || '/images/hero-poster.jpg'
  const video = media.videoUrl || '/videos/Video1.mp4'
  return (
    <section className="relative isolate bg-background pt-6 pb-14 sm:pt-12 lg:pb-20">
      {/* soft pools of colour; clipped here so the price finder's halo isn't */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute top-32 -right-24 size-[28rem] rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_26.5rem] lg:gap-14">
          {/* ---- visual (first on mobile, so the headline never sits on the photo) ---- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative order-first mx-auto w-full max-w-sm lg:order-last lg:max-w-none"
          >
            <div className="relative h-64 overflow-hidden rounded-t-[8rem] rounded-b-3xl shadow-2xl shadow-gold-700/25 sm:h-80 lg:h-[29rem] lg:rounded-t-[13.5rem] dk:rounded-xs dk:shadow-[0_0_0_8px_var(--background),0_0_0_9px_var(--gold-500),0_0_0_17px_var(--background),0_0_0_18px_color-mix(in_oklch,var(--gold-500)_45%,transparent)]">
              <Image
                src={showImage ? media.imageUrl : poster}
                alt=""
                fill
                priority
                sizes="(min-width:1024px) 424px, 90vw"
                className="object-cover object-[55%_center]"
              />
              {!showImage && (
                <video
                  key={video}
                  className="absolute inset-0 size-full object-cover object-[55%_center] brightness-110 saturate-105 motion-reduce:hidden"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden
                >
                  <source src={video} type={video.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
                </video>
              )}
            </div>

            <div className="absolute top-8 -left-2 rounded-xl border border-border bg-card px-4 py-3 shadow-xl sm:-left-6 dk:rounded-xs dk:border-gold-500">
              <p className="text-xs font-medium text-chrome-500">{WARRANTY_YEARS}-year warranty</p>
              <p className="font-display text-lg font-semibold text-gold-ink">Guaranteed</p>
            </div>
            {startingPrice != null && (
              <div className="absolute -right-2 bottom-6 rounded-xl border border-border bg-card px-4 py-3 shadow-xl sm:-right-4 dk:rounded-xs dk:border-gold-500">
                <p className="text-xs font-medium text-chrome-500">Starting from</p>
                <p className="font-display text-lg font-semibold text-gold-ink">{formatPrice(startingPrice)}</p>
              </div>
            )}
          </motion.div>

          {/* ---- copy ---- */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-gold-ink dk:rounded-xs dk:border-gold-500 dk:bg-transparent"
            >
              <span aria-hidden className="size-2 rounded-full bg-emerald-500" />
              Free doorstep service · Lahore
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06 }}
              className="mt-5 font-display text-4xl leading-[1.08] font-bold tracking-tight text-balance text-chrome-100 sm:text-5xl lg:text-6xl"
            >
              Crystal-clear glass,{' '}
              <span className="text-gold-ink">right at your doorstep.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-chrome-300 sm:text-lg"
            >
              Professional CeO₂ windshield restoration, full glass polishing and headlight
              restoration. We remove water spots, wiper marks and night glare — at your home or
              office.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2"
            >
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm font-medium text-chrome-100">
                  <Check aria-hidden className="size-4 shrink-0 text-gold" />
                  {p}
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button
                size="lg"
                className="h-12 rounded-full px-7 text-base shadow-lg shadow-gold-500/30 dk:rounded-md dk:tracking-wider dk:uppercase"
                render={<Link href="/quote" />}
              >
                Book now
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-7 text-base dk:rounded-md dk:border-gold-500 dk:bg-transparent dk:tracking-wider dk:text-gold-ink dk:uppercase"
                render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
              >
                <WhatsAppIcon className="size-4" data-icon="inline-start" />
                WhatsApp us
              </Button>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="mt-14 lg:mt-16"
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}
