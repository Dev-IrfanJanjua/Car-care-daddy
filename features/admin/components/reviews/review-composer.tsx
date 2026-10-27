'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Camera, Loader2, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { createMediaUploadUrl } from '../../actions/brand'
import { addReview } from '../../actions/reviews'

/** Admin form for adding a review yourself, with up to three photos. */
export function ReviewComposer() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [city, setCity] = useState('Lahore')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(0)
  const [publish, setPublish] = useState(true)
  const [pending, start] = useTransition()

  async function addFiles(list: FileList | null) {
    if (!list) return
    for (const file of Array.from(list).slice(0, 3 - photos.length)) {
      setUploading((n) => n + 1)
      try {
        const { path, token, publicUrl } = await createMediaUploadUrl('review', file.name, file.type, file.size)
        const { error } = await createClient().storage.from('site-media').uploadToSignedUrl(path, token, file, { contentType: file.type })
        if (error) throw new Error(error.message)
        setPhotos((p) => [...p, publicUrl].slice(0, 3))
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not upload that photo')
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  function submit() {
    start(async () => {
      try {
        await addReview({ name, city, rating, comment, imageUrls: photos, publish })
        setName('')
        setComment('')
        setPhotos([])
        setRating(5)
        toast.success(publish ? 'Review added and live on the site' : 'Review saved (not published yet)')
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not add the review')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a review</CardTitle>
        <p className="text-sm text-muted-foreground">For customers who booked by phone or WhatsApp, or kind messages you want to feature.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="rv-name">Customer name</Label>
            <Input id="rv-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Ayesha K." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rv-city">City or area</Label>
            <Input id="rv-city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={40} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" aria-label={`${n} stars`} onClick={() => setRating(n)} className="cursor-pointer rounded p-0.5">
                <Star className={cn('size-7', n <= rating ? 'fill-amber-500 text-amber-500' : 'text-border')} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rv-comment">What the customer said</Label>
          <Textarea id="rv-comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} maxLength={1000} />
        </div>

        <div className="space-y-1.5">
          <Label>Photos (optional, up to 3)</Label>
          <div className="flex flex-wrap gap-3">
            {photos.map((u) => (
              <div key={u} className="relative size-20 overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="Review photo" className="size-full object-cover" />
                <button type="button" aria-label="Remove photo" onClick={() => setPhotos((p) => p.filter((x) => x !== u))} className="absolute top-1 right-1 grid size-5 cursor-pointer place-items-center rounded-full bg-black/70 text-white">
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {Array.from({ length: uploading }).map((_, i) => (
              <div key={i} className="grid size-20 place-items-center rounded-lg border border-dashed border-border text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ))}
            {photos.length + uploading < 3 && (
              <label className="grid size-20 cursor-pointer place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted">
                <span className="flex flex-col items-center gap-1 text-xs"><Camera className="size-5" /> Add</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { void addFiles(e.target.files); e.target.value = '' }} />
              </label>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="size-4 accent-[var(--brand)]" />
          Show it on the website straight away
        </label>

        <Button type="button" onClick={submit} disabled={pending || uploading > 0}>
          {pending ? 'Saving…' : 'Add review'}
        </Button>
      </CardContent>
    </Card>
  )
}
