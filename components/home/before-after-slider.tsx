'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GripVertical, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const IMAGE_SRC = 'https://picsum.photos/id/1040/1200/750'

export function BeforeAfterSlider() {
  const [value, setValue] = useState(50)

  return (
    <div className="relative mx-auto aspect-16/10 w-full max-w-3xl touch-none overflow-hidden rounded-2xl border border-border/60 shadow-xl select-none sm:aspect-video">
      <div className="absolute inset-0">
        <Image
          src={IMAGE_SRC}
          alt="Windshield before polishing"
          fill
          unoptimized
          className="object-cover grayscale-[40%] brightness-75 contrast-90 blur-[1px] saturate-50"
        />
        <div className="absolute inset-0 bg-black/15" />
        <span className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          Before
        </span>
      </div>

      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
        <Image
          src={IMAGE_SRC}
          alt="Windshield after polishing"
          fill
          priority
          unoptimized
          className="object-cover brightness-105 contrast-110 saturate-125"
        />
        <div className="absolute inset-y-0 left-0 w-1/2 -translate-x-1/3 bg-linear-to-r from-transparent via-white/40 to-transparent" />
        <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground shadow">
          <Sparkles className="size-3" />
          After
        </span>
      </div>

      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
        style={{ left: `${value}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-700 shadow-lg">
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
        className={cn(
          'absolute inset-0 z-20 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0'
        )}
      />
    </div>
  )
}
