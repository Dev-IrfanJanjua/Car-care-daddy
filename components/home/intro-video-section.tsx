'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { Reveal } from './reveal'

/**
 * A click-to-play video, not an ambient loop -- this is the clip that used to
 * autoplay muted behind the hero. An intro video is meant to be watched with
 * sound, so it now waits for a deliberate tap: the poster and a play button
 * until then, a real <video> with controls and audio once you commit.
 */
export function IntroVideoSection() {
  const [playing, setPlaying] = useState(false)

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">
          See it in action
        </span>
        <span className="rule-gold mt-3" />
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Watch how we restore your glass
        </h2>
        <p className="mt-3 text-muted-foreground">
          A real doorstep visit, start to finish — from a hazed windshield to crystal clear.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <div className="relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-ink-950 shadow-xl shadow-ink-900/20">
          {playing ? (
            <video
              className="size-full object-cover"
              src="/videos/Video1.mp4"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Play video"
              className="group absolute inset-0 flex size-full items-center justify-center"
            >
              <Image
                src="/images/hero-poster.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
              />
              <span aria-hidden className="absolute inset-0 bg-ink-950/40" />
              <span className="relative flex size-16 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-lg shadow-ink-950/50 ring-4 ring-white/10 transition-transform group-hover:scale-105 sm:size-20">
                <Play className="size-7 fill-current sm:size-8" />
              </span>
            </button>
          )}
        </div>
      </Reveal>
    </section>
  )
}
