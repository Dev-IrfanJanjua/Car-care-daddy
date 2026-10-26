'use client'

import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * A video that shows its poster until tapped (nothing downloads before that),
 * then plays with native controls. `active={false}` stops it and returns to the
 * poster, so a slide that scrolls out of view never keeps playing.
 */
export function VideoPlayer({
  src,
  poster,
  title,
  active = true,
  onPlayingChange,
  className,
}: {
  src: string
  poster?: string | null
  title: string
  active?: boolean
  onPlayingChange?: (playing: boolean) => void
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  // Leaving view returns to the poster. State is reset while rendering (the
  // documented pattern for reacting to a prop change); the effect only touches
  // the <video> element and tells the parent.
  const [wasActive, setWasActive] = useState(active)
  if (active !== wasActive) {
    setWasActive(active)
    if (!active) setPlaying(false)
  }

  useEffect(() => {
    if (active) return
    const v = ref.current
    if (v && !v.paused) v.pause()
    onPlayingChange?.(false)
  }, [active, onPlayingChange])

  return (
    <div className={cn('absolute inset-0 bg-black', className)}>
      <video
        ref={ref}
        src={src}
        poster={poster ?? undefined}
        playsInline
        loop
        preload="none"
        controls={playing}
        aria-label={title}
        className="size-full object-cover"
      />
      {!playing && (
        <button
          type="button"
          aria-label={`Play video: ${title}`}
          onClick={() => {
            const v = ref.current
            if (!v) return
            setPlaying(true)
            onPlayingChange?.(true)
            void v.play()
          }}
          className="absolute inset-0 z-[3] grid place-items-center"
        >
          <span className="grid size-[72px] place-items-center rounded-full bg-gold-500 text-gold-foreground shadow-[0_14px_40px_-10px_rgba(0,0,0,0.6)] transition hover:scale-105">
            <Play aria-hidden className="size-7 translate-x-0.5 fill-current" />
          </span>
        </button>
      )}
    </div>
  )
}
