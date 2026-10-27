'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

/** Small photo thumbnails on a review card; tapping one opens it full size. */
export function ReviewPhotos({ urls, name }: { urls: string[]; name: string }) {
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (urls.length === 0) return null
  return (
    <>
      <div className="flex gap-2">
        {urls.map((u) => (
          <button
            key={u}
            type="button"
            aria-label={`View photo from ${name}`}
            onClick={() => setOpen(u)}
            className="size-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-line-2 transition hover:border-gold-500 dk:rounded-xs"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt={`Photo from ${name}`} loading="lazy" className="size-full object-cover" />
          </button>
        ))}
      </div>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Review photo" className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4" onClick={() => setOpen(null)}>
          <button type="button" aria-label="Close" className="absolute top-4 right-4 grid size-10 cursor-pointer place-items-center rounded-full bg-white/15 text-white hover:bg-white/25" onClick={() => setOpen(null)}>
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open} alt={`Photo from ${name}`} className="max-h-[88vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}
