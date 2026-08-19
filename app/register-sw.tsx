'use client'

import { useEffect } from 'react'

export function RegisterServiceWorker() {
  useEffect(() => {
    // Dev-only skip: a cached service worker can serve stale JS chunks after
    // edits, which looks exactly like "the app is broken" but isn't -- it's a
    // well-known SW/HMR interaction, not an app bug. Production only.
    if (process.env.NODE_ENV !== 'production') return

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Installability is a progressive enhancement -- ignore registration failures.
      })
    }
  }, [])

  return null
}
