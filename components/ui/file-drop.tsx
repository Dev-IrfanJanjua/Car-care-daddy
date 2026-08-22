'use client'

import { useRef, useState, type DragEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Preview = { name: string; url: string; size: number }

/**
 * Styled replacement for a bare <input type="file">.
 *
 * A real file input is still in the DOM (visually hidden) and still carries the
 * form's `name`, so submission behaviour is unchanged -- this only wraps it in a
 * drop target and thumbnail strip. Files dropped in are written back onto that
 * input via DataTransfer so the form posts them normally.
 */
export function FileDrop({
  id,
  name,
  accept = 'image/*',
  maxFiles = 6,
  className,
}: {
  id: string
  name: string
  accept?: string
  maxFiles?: number
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<Preview[]>([])
  const [dragging, setDragging] = useState(false)

  function readFromInput() {
    const files = Array.from(inputRef.current?.files ?? []).slice(0, maxFiles)
    // Revoke the previous batch's object URLs or they leak for the page's life.
    setPreviews((old) => {
      old.forEach((p) => URL.revokeObjectURL(p.url))
      return files.map((f) => ({ name: f.name, url: URL.createObjectURL(f), size: f.size }))
    })
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragging(false)
    if (!inputRef.current) return

    const dropped = Array.from(e.dataTransfer.files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, maxFiles)
    if (dropped.length === 0) return

    const dt = new DataTransfer()
    dropped.forEach((f) => dt.items.add(f))
    inputRef.current.files = dt.files
    readFromInput()
  }

  function removeAt(index: number) {
    if (!inputRef.current) return
    const kept = Array.from(inputRef.current.files ?? []).filter((_, i) => i !== index)
    const dt = new DataTransfer()
    kept.forEach((f) => dt.items.add(f))
    inputRef.current.files = dt.files
    readFromInput()
  }

  return (
    <div className={cn('space-y-3', className)}>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragging
            ? 'border-brand bg-brand/5'
            : 'border-border bg-muted/30 hover:border-brand/50 hover:bg-muted/60'
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
          <ImagePlus className="size-5" />
        </span>
        <span className="text-sm font-medium">
          {previews.length > 0
            ? `${previews.length} photo${previews.length === 1 ? '' : 's'} selected`
            : 'Tap to add photos, or drag them here'}
        </span>
        <span className="text-xs text-muted-foreground">
          JPG or PNG, up to {maxFiles} photos
        </span>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept={accept}
          multiple
          onChange={readFromInput}
          className="sr-only"
        />
      </label>

      {previews.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((p, i) => (
            <li key={p.url} className="group relative">
              {/* Object URL of a local file -- next/image would have nothing to optimise. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.name}
                className="aspect-square w-full rounded-lg border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${p.name}`}
                className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-foreground text-background opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
