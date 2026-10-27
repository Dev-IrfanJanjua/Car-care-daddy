'use client'

import { useState } from 'react'
import Image from 'next/image'

// Two real photographs, not one image with a filter applied to fake a result.
// NOTE: these are two different cars. Replace with a genuine pair from a single
// job (same car, same angle, same light) as soon as one is available.
const BEFORE_SRC = '/images/before-windshield.jpg'
const AFTER_SRC = '/images/after-windshield.jpg'

/**
 * Drag-to-compare: the "after" photo sits on the right of the handle, the
 * "before" on the left. A transparent range input on top carries the drag, so
 * mouse, touch and arrow keys all work with no pointer-capture code.
 * Fills its parent (position: absolute inset-0) so it can live in a slide or a
 * grid tile alike.
 */
export function BeforeAfterSlider({
  beforeSrc = BEFORE_SRC,
  afterSrc = AFTER_SRC,
  alt = 'Windshield',
  priority = false,
  sizes = '(min-width: 1200px) 1152px, 100vw',
  fit = 'cover',
}: {
  beforeSrc?: string
  afterSrc?: string
  alt?: string
  priority?: boolean
  sizes?: string
  /** 'contain' shows each photo whole; 'cover' fills the frame (default) */
  fit?: 'cover' | 'contain'
}) {
  const [value, setValue] = useState(50)

  return (
    <div data-compare className="absolute inset-0 touch-pan-y select-none">
      <Image
        src={beforeSrc}
        alt={`${alt} before restoration`}
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
        className={`pointer-events-none brightness-110 saturate-110 ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
      />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${value}%)` }}>
        <Image
          src={afterSrc}
          alt={`${alt} after restoration`}
          fill
          sizes={sizes}
          priority={priority}
          draggable={false}
          className={`pointer-events-none brightness-110 saturate-110 ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
        />
      </div>

      <span className="absolute top-5 right-5 z-[3] rounded-[9px] bg-gold-500 px-3.5 py-1.5 text-[0.72rem] font-bold tracking-[0.14em] text-gold-foreground uppercase">
        After
      </span>

      <div
        aria-hidden
        className="absolute inset-y-0 z-[3] w-0.5 -translate-x-px bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ left: `${value}%` }}
      >
        <span className="absolute top-1/2 left-1/2 grid size-[52px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label="Drag to compare before and after"
        className="absolute inset-0 z-[4] h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
      />
    </div>
  )
}
