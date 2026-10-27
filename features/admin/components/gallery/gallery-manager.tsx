'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Star, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { createMediaUploadUrl } from '../../actions/brand'
import { addGalleryItem, deleteGalleryItem, setGalleryFeatured, setGalleryPublished } from '../../actions/gallery'

export type AdminGalleryItem = {
  id: string
  title: string
  service: string
  kind: 'compare' | 'video' | 'image'
  beforeUrl: string | null
  afterUrl: string | null
  mediaUrl: string | null
  posterUrl: string | null
  isPublished: boolean
  isFeatured: boolean
}

function Picker({ id, label, file, onFile, video = false }: { id: string; label: string; file?: File; onFile: (f?: File) => void; video?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-card px-3 py-3 text-sm text-foreground hover:bg-muted"
      >
        <Upload className="size-4 shrink-0" />
        <span className="truncate">{file ? file.name : video ? 'Choose a video (MP4 or WebM, up to 50 MB)' : 'Choose a photo (JPG, PNG or WebP, up to 8 MB)'}</span>
      </label>
      <input
        id={id}
        type="file"
        accept={video ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'}
        className="sr-only"
        onChange={(e) => {
          onFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}

/**
 * Grabs a still from the video in the browser (about 0.5 s in, to skip a black
 * first frame) and returns it as a JPEG. Resolves null if the browser cannot
 * decode the file, in which case the video is simply added without a cover.
 */
function makePosterFromVideo(file: File): Promise<File | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    let done = false
    const finish = (result: File | null) => {
      if (done) return
      done = true
      URL.revokeObjectURL(url)
      resolve(result)
    }
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.onerror = () => finish(null)
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 4)
    }
    video.onseeked = () => {
      try {
        const w = video.videoWidth
        const h = video.videoHeight
        if (!w || !h) return finish(null)
        const scale = Math.min(1, 1280 / w)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(w * scale)
        canvas.height = Math.round(h * scale)
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => finish(blob ? new File([blob], 'cover.jpg', { type: 'image/jpeg' }) : null), 'image/jpeg', 0.85)
      } catch {
        finish(null)
      }
    }
    setTimeout(() => finish(null), 15000)
    video.src = url
  })
}

export function GalleryManager({ items }: { items: AdminGalleryItem[] }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [service, setService] = useState('')
  const [kind, setKind] = useState<'compare' | 'image' | 'video'>('compare')
  const [before, setBefore] = useState<File>()
  const [after, setAfter] = useState<File>()
  const [media, setMedia] = useState<File>()
  const [poster, setPoster] = useState<File>()
  const [autoPoster, setAutoPoster] = useState<File>()
  const [featured, setFeatured] = useState(false)
  const [pending, start] = useTransition()

  const previews = useMemo(
    () => ({
      before: before ? URL.createObjectURL(before) : '',
      after: after ? URL.createObjectURL(after) : '',
      media: media ? URL.createObjectURL(media) : '',
      poster: poster || autoPoster ? URL.createObjectURL((poster ?? autoPoster)!) : '',
    }),
    [before, after, media, poster, autoPoster]
  )
  useEffect(() => () => Object.values(previews).forEach((u) => u && URL.revokeObjectURL(u)), [previews])

  // Pick a video and a cover photo is made from it automatically.
  useEffect(() => {
    if (kind !== 'video' || !media) return
    let cancelled = false
    void makePosterFromVideo(media).then((f) => {
      if (!cancelled && f) setAutoPoster(f)
    })
    return () => {
      cancelled = true
    }
  }, [kind, media])

  async function upload(file: File, as: 'gallery' | 'galleryVideo' = 'gallery') {
    const { path, token, publicUrl } = await createMediaUploadUrl(as, file.name, file.type, file.size)
    const { error } = await createClient().storage.from('site-media').uploadToSignedUrl(path, token, file, { contentType: file.type })
    if (error) throw new Error(`Upload failed: ${error.message}`)
    return publicUrl
  }

  function add() {
    if (!title.trim()) return toast.error('Give it a short title')
    if (kind === 'compare' && (!before || !after)) return toast.error('Choose both a before and an after photo')
    if (kind === 'image' && !media) return toast.error('Choose a photo')
    if (kind === 'video' && !media) return toast.error('Choose a video')
    start(async () => {
      try {
        if (kind === 'compare') {
          const [beforeUrl, afterUrl] = await Promise.all([upload(before!), upload(after!)])
          await addGalleryItem({ kind, title, service, beforeUrl, afterUrl, isFeatured: featured })
        } else if (kind === 'image') {
          await addGalleryItem({ kind, title, service, mediaUrl: await upload(media!), isFeatured: featured })
        } else {
          // Your own cover photo wins; otherwise the one made from the video.
          // If neither exists the video is added without a cover.
          const cover = poster ?? autoPoster ?? (await makePosterFromVideo(media!))
          const [mediaUrl, posterUrl] = await Promise.all([upload(media!, 'galleryVideo'), cover ? upload(cover) : Promise.resolve(null)])
          await addGalleryItem({ kind, title, service, mediaUrl, posterUrl, isFeatured: featured })
        }
        setTitle('')
        setService('')
        setBefore(undefined)
        setAfter(undefined)
        setMedia(undefined)
        setPoster(undefined)
        setAutoPoster(undefined)
        setFeatured(false)
        toast.success('Added to the gallery')
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not add')
      }
    })
  }

  function run(fn: () => Promise<void>, ok: string) {
    start(async () => {
      try {
        await fn()
        toast.success(ok)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add to the gallery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Type">
            {([['compare', 'Before / after pair'], ['image', 'Photo'], ['video', 'Video']] as const).map(([k, label]) => (
              <Button key={k} type="button" size="sm" variant={kind === k ? 'default' : 'outline'} aria-pressed={kind === k} onClick={() => setKind(k)}>
                {label}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="g-title">Title</Label>
              <Input id="g-title" value={title} maxLength={100} placeholder="Honda Civic windshield" onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-service">Category (Windshield, Glass, Headlights, Detailing…)</Label>
              <Input id="g-service" value={service} maxLength={80} placeholder="Windshield restoration" onChange={(e) => setService(e.target.value)} />
            </div>
            {kind === 'compare' && (
              <>
                <Picker id="g-before" label="Before photo" file={before} onFile={setBefore} />
                <Picker id="g-after" label="After photo" file={after} onFile={setAfter} />
              </>
            )}
            {kind === 'image' && <Picker id="g-media" label="Photo" file={media} onFile={setMedia} />}
            {kind === 'video' && (
              <>
                <Picker id="g-video" label="Video" file={media} onFile={(f) => { setMedia(f); setAutoPoster(undefined) }} video />
                <div>
                  <Picker id="g-poster" label="Cover photo (optional)" file={poster} onFile={setPoster} />
                  <p className="mt-1.5 text-xs text-muted-foreground">Skip it and a frame from the video is used as the cover.</p>
                </div>
              </>
            )}
          </div>

          {/* preview: what the visitor will see, before anything is saved */}
          {kind === 'compare' && (previews.before || previews.after) && (
            <div className="grid grid-cols-2 gap-3">
              {[previews.before, previews.after].map((src, i) => (
                <div key={i} className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                  {src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={i === 0 ? 'Before preview' : 'After preview'} className="size-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
          {kind === 'image' && previews.media && (
            <div className="aspect-video max-w-sm overflow-hidden rounded-lg border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previews.media} alt="Photo preview" className="size-full object-cover" />
            </div>
          )}
          {kind === 'video' && (previews.media || previews.poster) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-video overflow-hidden rounded-lg border border-border bg-black">
                {previews.media && <video src={previews.media} controls muted playsInline className="size-full object-contain" />}
              </div>
              <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                {previews.poster && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previews.poster} alt="Cover preview" className="size-full object-contain" />
                )}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="size-4 accent-[var(--brand)]" />
            Show this in the home page slider
          </label>
          <p className="text-xs text-muted-foreground">For before/after pairs, use the same car, angle and light for both photos. Nothing is published until you press Add.</p>
          <Button type="button" onClick={add} disabled={pending}>
            {pending ? 'Uploading…' : 'Add to gallery'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gallery ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing yet. Until you add something, the public gallery and home slider use a built-in sample.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {items.map((it) => (
                <li key={it.id} className="space-y-3 rounded-xl border border-border p-3">
                  {it.kind === 'compare' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[it.beforeUrl, it.afterUrl].map((src, i) => (
                        <div key={i} className="aspect-video overflow-hidden rounded-md bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {src && <img src={src} alt={i === 0 ? 'Before' : 'After'} loading="lazy" className="size-full object-cover" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-video overflow-hidden rounded-md bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {(it.kind === 'video' ? it.posterUrl : it.mediaUrl) && <img src={(it.kind === 'video' ? it.posterUrl : it.mediaUrl) ?? ''} alt={it.title} loading="lazy" className="size-full object-cover" />}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {it.title}
                      {it.isFeatured && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-foreground">On home page</span>}
                      {!it.isPublished && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Hidden</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {it.kind === 'compare' ? 'Before / after' : it.kind === 'video' ? 'Video' : 'Photo'}
                      {it.service && ` · ${it.service}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => run(() => setGalleryPublished(it.id, !it.isPublished), it.isPublished ? 'Hidden from the site' : 'Now visible')}>
                      {it.isPublished ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      {it.isPublished ? 'Hide' : 'Show'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => run(() => setGalleryFeatured(it.id, !it.isFeatured), it.isFeatured ? 'Removed from home slider' : 'Now in the home slider')}>
                      <Star className="size-4" />
                      {it.isFeatured ? 'Unfeature' : 'Feature on home'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => {
                        if (window.confirm(`Delete “${it.title}” and its photos? This can't be undone.`)) run(() => deleteGalleryItem(it.id), 'Deleted')
                      }}
                    >
                      <Trash2 className="size-4" /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
