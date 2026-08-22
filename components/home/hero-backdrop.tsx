'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import Image from 'next/image'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Read the OS reduce-motion preference in a way that survives hydration.
 *
 * motion/react's useReducedMotion() resolves to the real value on the very
 * first client render, so swapping the <video> for the poster on the strength
 * of it mismatches the server HTML. useSyncExternalStore is the supported way
 * to do this: React hydrates against the server snapshot (false), then
 * re-renders with the client's.
 */
function usePrefersReducedMotion() {
  const subscribe = useCallback((onChange: () => void) => {
    const mq = window.matchMedia(QUERY)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}

/**
 * The full-bleed hero background: a silent looping clip under a stack of
 * scrims that guarantee the copy stays legible whatever frame is on screen.
 *
 * MotionConfig's reducedMotion="user" only governs motion/react components --
 * it will happily let an autoplaying <video> keep moving. So we check the
 * preference ourselves and serve the poster still instead.
 */
export function HeroBackdrop() {
  const reduceMotion = usePrefersReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)

  // A <video> keeps decoding once it's scrolled out of sight, and that decode
  // competes with the compositor for frames: leaving it running made the
  // "See our services" smooth scroll visibly stutter on mobile. Pause it the
  // moment the hero leaves the viewport, resume when it comes back.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Rejects when the browser blocks autoplay (iOS Low Power Mode);
          // the poster is already showing, so there is nothing to recover.
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reduceMotion])

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-navy-950">
      {reduceMotion ? (
        <Image
          src="/images/hero-poster.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          className="size-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/video2.mp4" type="video/mp4" />
        </video>
      )}

      {/* One element, one paint -- see .hero-scrim in globals.css. */}
      <div className="hero-scrim" />
    </div>
  )
}
