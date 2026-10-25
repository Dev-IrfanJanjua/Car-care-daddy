'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { siteButton } from '@/components/ui/site-button'
import { WhatsAppIcon } from '@/components/icons/brand-icons'
import { formatPrice } from '@/lib/format'
import { WARRANTY_YEARS } from '@/lib/contact'
import type { HomeContent } from '@/features/content/client'
import { DEFAULT_CONTENT } from '@/features/content/client'


export type HeroMedia = {
  type: 'video' | 'image'
  videoUrl: string
  imageUrl: string
  posterUrl: string
}

const DEFAULT_MEDIA: HeroMedia = { type: 'video', videoUrl: '', imageUrl: '', posterUrl: '' }

type HeroProps = {
  /** admin-editable copy; defaults to the built-in text */
  content?: Pick<HomeContent, 'heroBadge' | 'heroHeadline' | 'heroAccent' | 'heroSubtext' | 'heroPoints'>
  /** admin-controlled photo/video; omitted fields fall back to the bundled ones */
  media?: HeroMedia
  whatsappUrl: string
  /** cheapest price of the first service, for the floating "from" chip */
  startingPrice: number | null
  /** that service's name, for the chip's label ("Windshield from") */
  startingLabel?: string
  /** the price finder, rendered by the page so it can stay a server-fed component */
  children: ReactNode
}

/**
 * Home hero: copy on the left, framed photo on the right, price finder
 * underneath. The photo is an arch in the light theme and a double brass frame
 * in the dark one -- same markup, the `dk:` variant swaps the shape.
 */
export function Hero({ whatsappUrl, startingPrice, startingLabel, children, media = DEFAULT_MEDIA, content = DEFAULT_CONTENT }: HeroProps) {
  const showImage = media.type === 'image' && !!media.imageUrl
  const poster = media.posterUrl || '/images/hero-poster.jpg'
  const video = media.videoUrl || '/videos/Video1.mp4'
  // "Windshield Restoration" -> "Windshield from"
  const chipLabel = `${startingLabel?.split(' ')[0] ?? 'Starting'} from`
  return (
    <section className="relative isolate bg-background pt-8 pb-10 sm:pt-[34px] dk:pb-14">
      <div className="mx-auto max-w-[1200px] px-[18px] sm:px-6">
        <div className="grid items-start gap-x-[60px] gap-y-6 lg:grid-cols-[minmax(0,1fr)_430px]">
          {/* ---- visual (first on mobile, so the headline never sits on the photo) ---- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative order-first lg:order-last lg:mt-2.5 dk:lg:mb-5"
          >
            <div className="relative mx-5 h-[260px] overflow-hidden rounded-t-[130px] rounded-b-3xl shadow-[0_40px_70px_-34px_rgba(60,40,10,0.5)] sm:mx-0 lg:mr-4 lg:ml-auto lg:h-[470px] lg:w-[430px] lg:rounded-t-[215px] lg:rounded-b-[28px] dk:mx-[26px] dk:h-[240px] dk:rounded-xs dk:shadow-[0_0_0_6px_var(--background),0_0_0_7px_var(--gold-500),0_40px_80px_-30px_rgba(0,0,0,0.7)] dk:sm:mx-0 dk:lg:mr-11 dk:lg:h-[430px] dk:lg:w-[410px] dk:lg:shadow-[0_0_0_8px_var(--background),0_0_0_9px_var(--gold-500),0_0_0_17px_var(--background),0_0_0_18px_color-mix(in_oklab,var(--gold-500)_45%,transparent),0_40px_80px_-30px_rgba(0,0,0,0.7)]">
              <Image
                src={showImage ? media.imageUrl : poster}
                alt=""
                fill
                priority
                sizes="(min-width:1024px) 430px, 90vw"
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

            <div className="absolute top-[60px] -left-[100px] hidden rounded-[18px] border border-line bg-white px-[18px] py-3 text-[0.78rem] font-semibold text-foreground shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] lg:block dk:rounded-xs dk:border-gold-500 dk:bg-card dk:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]">
              {WARRANTY_YEARS}-year warranty
              <b className="block font-display text-[1.15rem] font-semibold text-gold-ink">Guaranteed</b>
            </div>
            {startingPrice != null && (
              <div className="absolute -right-5 -bottom-[7px] hidden rounded-[18px] border border-line bg-white px-[18px] py-3 text-[0.78rem] font-semibold text-foreground shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] lg:block dk:-right-[30px] dk:rounded-xs dk:border-gold-500 dk:bg-card dk:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]">
                {chipLabel}
                <b className="block font-display text-[1.15rem] font-semibold text-gold-ink">{formatPrice(startingPrice)}</b>
              </div>
            )}
          </motion.div>

          {/* ---- copy ---- */}
          <div className="flex flex-col items-start">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-transparent bg-white py-2 pr-4 pl-2.5 text-[0.82rem] font-medium text-gold-ink shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)] dk:rounded-xs dk:border-gold-500 dk:bg-transparent dk:shadow-none"
            >
              <span aria-hidden className="size-2 rounded-full bg-[#46d37a] shadow-[0_0_0_4px_rgba(70,211,122,0.22)]" />
              {content.heroBadge}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06 }}
              className="mt-4 mb-3.5 font-display text-[clamp(2.1rem,7.4vw,2.8rem)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance text-chrome-100 sm:text-[clamp(2.2rem,4.4vw,3.8rem)] sm:leading-[1.04]"
            >
              {content.heroHeadline}
              <br className="hidden sm:block" />{' '}
              <span className="text-gold-ink">{content.heroAccent}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="max-w-[640px] text-base text-chrome-400 sm:text-[1.15rem] sm:leading-[1.6]"
            >
              {content.heroSubtext}
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-x-[26px]"
            >
              {content.heroPoints.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[0.84rem] font-medium text-chrome-100 sm:items-center sm:text-[0.95rem]">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink sm:mt-0 sm:size-[18px]" strokeWidth={2.6} />
                  {p}
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-[22px] flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row"
            >
              <Link href="/quote" className={siteButton({ size: 'lg' })}>
                Book now
                <ArrowRight />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={siteButton({ variant: 'ghost', size: 'lg' })}
              >
                <WhatsAppIcon />
                WhatsApp us
              </a>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="mt-9 lg:mt-8"
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}
