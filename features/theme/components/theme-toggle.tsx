'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Theme = 'light' | 'dark'

const KEY = 'ca-theme'
const listeners = new Set<() => void>()

function read(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function apply(next: Theme) {
  document.documentElement.setAttribute('data-theme', next)
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* private mode: the choice just won't persist */
  }
  listeners.forEach((cb) => cb())
}

/**
 * Light/dark switch. The theme lives on <html data-theme>, set before first
 * paint by the inline script in app/layout.tsx; this reads and flips it.
 * useSyncExternalStore keeps the icon correct without a hydration mismatch
 * (the server always renders the light icon, the client corrects it).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore<Theme>(subscribe, read, () => 'light')
  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={className}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      onClick={() => apply(next)}
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
