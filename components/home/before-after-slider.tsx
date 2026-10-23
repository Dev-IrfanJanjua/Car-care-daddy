'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GripVertical, Sparkles } from 'lucide-react'

// Two real photographs, not one image with a filter applied to fake a result.
// NOTE: these are two different cars. Replace with a genuine pair from a single
// job (same car, same angle, same light) as soon as one is available.
const BEFORE_SRC = '/images/before-windshield.jpg'
const AFTER_SRC = '/images/after-windshield.jpg'

export function BeforeAfterSlider() {
  const [value, setValue] = useState(50)

  return (
    <div className="relative mx-auto aspect-16/10 w-full max-w-3xl touch-none overflow-hidden rounded-2xl border border-border/60 shadow-xl select-none sm:aspect-video">
      <div className="absolute inset-0">
        <Image
          src={BEFORE_SRC}
          alt="Windshield before restoration, showing haze and swirl marks"
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
          priority
        />
        <span className="absolute top-4 left-4 rounded-full bg-ink-950/75 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-chrome-100 uppercase backdrop-blur">
          Before
        </span>
      </div>

      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
        <Image
          src={AFTER_SRC}
          alt="Windshield after restoration, clear and reflective"
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
          priority
        />
        <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-semibold tracking-[0.18em] text-gold-foreground uppercase shadow">
          <Sparkles className="size-3" />
          After
        </span>
      </div>

      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_0_1px_var(--ink-950)]"
        style={{ left: `${value}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground shadow-lg ring-1 ring-gold/40">
          <GripVertical className="size-4" />
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label="Drag to compare before and after"
        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
      />
    </div>
  )
}
