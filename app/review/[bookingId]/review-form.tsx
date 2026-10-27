'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Camera, Loader2, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SiteButton } from '@/components/ui/site-button'
import { createClient } from '@/lib/supabase/client'
import { createReviewPhotoUploadUrl } from '@/lib/actions/reviews'
import { cn } from '@/lib/utils'

const MAX_PHOTOS = 3

function Submit({ busy }: { busy: boolean }) {
  const { pending } = useFormStatus()
  return (
    <SiteButton type="submit" className="w-full" disabled={pending || busy}>
      {pending ? 'Sending…' : 'Submit review'}
    </SiteButton>
  )
}

/**
 * Rating, name, comment and up to three photos. Photos upload as soon as they
 * are chosen (straight to storage), and the form then posts only their URLs.
 */
export function ReviewForm({
  action,
  bookingId,
  accessToken,
  defaultName,
}: {
  action: (formData: FormData) => void | Promise<void>
  bookingId: string
  accessToken: string
  defaultName: string
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [ratingError, setRatingError] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(0)

  async function addFiles(list: FileList | null) {
    if (!list) return
    const files = Array.from(list).slice(0, MAX_PHOTOS - photos.length)
    for (const file of files) {
      setUploading((n) => n + 1)
      try {
        const { path, token, publicUrl } = await createReviewPhotoUploadUrl(bookingId, accessToken, file.name, file.type, file.size)
        const { error } = await createClient().storage.from('site-media').uploadToSignedUrl(path, token, file, { contentType: file.type })
        if (error) throw new Error(error.message)
        setPhotos((p) => [...p, publicUrl].slice(0, MAX_PHOTOS))
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not upload that photo')
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  const shown = hover || rating

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!rating) {
          e.preventDefault()
          setRatingError(true)
        }
      }}
      className="space-y-5"
    >
      <fieldset>
        <Label className={ratingError ? 'text-red-600' : undefined}>Your rating</Label>
        <div className="mt-2 flex gap-1.5" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              aria-pressed={rating === n}
              onMouseEnter={() => setHover(n)}
              onClick={() => {
                setRating(n)
                setRatingError(false)
              }}
              className="cursor-pointer rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <Star className={cn('size-9 transition-colors', n <= shown ? 'fill-gold-500 text-gold-500' : 'text-muted-foreground')} />
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating || ''} />
        {ratingError && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">Please tap a star rating.</p>}
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="reviewerName">Name shown with your review</Label>
        <Input id="reviewerName" name="reviewerName" defaultValue={defaultName} maxLength={60} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comment">Your experience</Label>
        <Textarea id="comment" name="comment" placeholder="Tell us about your experience (optional)" rows={4} />
      </div>

      <div className="space-y-2">
        <Label>Add photos (optional)</Label>
        <div className="flex flex-wrap gap-3">
          {photos.map((url) => (
            <div key={url} className="relative size-20 overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Your photo" className="size-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                className="absolute top-1 right-1 grid size-5 cursor-pointer place-items-center rounded-full bg-black/70 text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <div key={`u${i}`} className="grid size-20 place-items-center rounded-lg border border-dashed border-border text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ))}
          {photos.length + uploading < MAX_PHOTOS && (
            <label className="grid size-20 cursor-pointer place-items-center rounded-lg border border-dashed border-gold-500 text-gold-ink hover:bg-gold-500/10">
              <span className="flex flex-col items-center gap-1 text-[0.68rem] font-semibold">
                <Camera className="size-5" /> Add
              </span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { void addFiles(e.target.files); e.target.value = '' }} />
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Up to {MAX_PHOTOS} photos, 5 MB each. Show off the result!</p>
        <input type="hidden" name="images" value={JSON.stringify(photos)} />
      </div>

      <Submit busy={uploading > 0} />
    </form>
  )
}
