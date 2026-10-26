'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROUND =
  'grid place-items-center rounded-full bg-gold-500 text-gold-foreground shadow-[0_14px_40px_-10px_rgba(0,0,0,0.6)] transition hover:scale-105 hover:bg-gold-400 focus-visible:ring-4 focus-visible:ring-gold-500/40 focus-visible:outline-none'

/**
 * A video with no native controls. It shows its poster until tapped (nothing
 * downloads before that); after that, a tap anywhere on the picture pauses or
 * resumes it, a paused video shows the gold play button in the middle, and a
 * matching round button in the corner mutes and unmutes it.
 *
 * `active={false}` stops it and returns to the poster, so a slide that scrolls
 * out of view never keeps playing.
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
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  // Leaving view returns to the poster. State is reset while rendering (the
  // documented pattern for reacting to a prop change); the effect only touches
  // the <video> element and tells the parent.
  const [wasActive, setWasActive] = useState(active)
  if (active !== wasActive) {
    setWasActive(active)
    if (!active) {
      setStarted(false)
      setPlaying(false)
    }
  }

  useEffect(() => {
    if (active) return
    const v = ref.current
    if (v && !v.paused) v.pause()
    onPlayingChange?.(false)
  }, [active, onPlayingChange])

  function toggle() {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      setStarted(true)
      void v.play()
    } else {
      v.pause()
    }
  }

  function toggleMute() {
    const v = ref.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <div className={cn('absolute inset-0 bg-black', className)}>
      <video
        ref={ref}
        src={src}
        poster={poster ?? undefined}
        playsInline
        loop
        preload="none"
        aria-label={title}
        onPlay={() => {
          setPlaying(true)
          onPlayingChange?.(true)
        }}
        onPause={() => {
          setPlaying(false)
          onPlayingChange?.(false)
        }}
        className="size-full object-cover"
      />

      {/* One big hit area over the picture: tap to play, pause or resume. */}
      <button
        type="button"
        aria-label={playing ? `Pause video: ${title}` : `Play video: ${title}`}
        onClick={toggle}
        className="group absolute inset-0 z-[3] grid cursor-pointer place-items-center focus-visible:outline-none"
      >
        {!playing && (
          <span className={cn(ROUND, 'size-[72px] group-focus-visible:ring-4 group-focus-visible:ring-gold-500/40')}>
            <Play aria-hidden className="size-7 translate-x-0.5 fill-current" />
          </span>
        )}
        {/* Pause icon only as a brief hint on hover while playing. */}
        {playing && (
          <span className={cn(ROUND, 'size-[64px] scale-90 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 group-focus-visible:opacity-100')}>
            <Pause aria-hidden className="size-6 fill-current" />
          </span>
        )}
      </button>

      {started && (
        <button
          type="button"
          aria-label={muted ? 'Unmute video' : 'Mute video'}
          aria-pressed={muted}
          onClick={toggleMute}
          className={cn(ROUND, 'absolute right-3 bottom-3 z-[4] size-11 cursor-pointer')}
        >
          {muted ? <VolumeX aria-hidden className="size-5" /> : <Volume2 aria-hidden className="size-5" />}
        </button>
      )}
    </div>
  )
}
