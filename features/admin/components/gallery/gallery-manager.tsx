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
  beforeUrl: string
  afterUrl: string
  isPublished: boolean
  isFeatured: boolean
}

function Picker({ id, label, file, onFile }: { id: string; label: string; file?: File; onFile: (f?: File) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-card px-3 py-3 text-sm text-foreground hover:bg-muted"
      >
        <Upload className="size-4 shrink-0" />
        <span className="truncate">{file ? file.name : 'Choose a photo (JPG, PNG or WebP, up to 8 MB)'}</span>
      </label>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          onFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}

export function GalleryManager({ items }: { items: AdminGalleryItem[] }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [service, setService] = useState('')
  const [before, setBefore] = useState<File>()
  const [after, setAfter] = useState<File>()
  const [featured, setFeatured] = useState(false)
  const [pending, start] = useTransition()

  const previews = useMemo(
    () => ({ before: before ? URL.createObjectURL(before) : '', after: after ? URL.createObjectURL(after) : '' }),
    [before, after]
  )
  useEffect(() => () => Object.values(previews).forEach((u) => u && URL.revokeObjectURL(u)), [previews])

  async function upload(file: File) {
    const { path, token, publicUrl } = await createMediaUploadUrl('gallery', file.name, file.type, file.size)
    const { error } = await createClient().storage.from('site-media').uploadToSignedUrl(path, token, file, { contentType: file.type })
    if (error) throw new Error(`Upload failed: ${error.message}`)
    return publicUrl
  }

  function add() {
    if (!title.trim()) return toast.error('Give the job a short title')
    if (!before || !after) return toast.error('Choose both a before and an after photo')
    start(async () => {
      try {
        const [beforeUrl, afterUrl] = await Promise.all([upload(before), upload(after)])
        await addGalleryItem({ title, service, beforeUrl, afterUrl, isFeatured: featured })
        setTitle('')
        setService('')
        setBefore(undefined)
        setAfter(undefined)
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
          <CardTitle>Add a before / after pair</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="g-title">Title</Label>
              <Input id="g-title" value={title} maxLength={100} placeholder="Honda Civic windshield" onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-service">Service (optional)</Label>
              <Input id="g-service" value={service} maxLength={80} placeholder="Windshield restoration" onChange={(e) => setService(e.target.value)} />
            </div>
            <Picker id="g-before" label="Before photo" file={before} onFile={setBefore} />
            <Picker id="g-after" label="After photo" file={after} onFile={setAfter} />
          </div>

          {(previews.before || previews.after) && (
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

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="size-4 accent-[var(--brand)]" />
            Show this pair in the home page slider
          </label>
          <p className="text-xs text-muted-foreground">Use the same car, angle and light for both photos so the slider is convincing.</p>
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
            <p className="text-sm text-muted-foreground">Nothing yet. Until you add a pair, the public gallery shows a &ldquo;coming soon&rdquo; message and the home slider uses the built-in sample.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {items.map((it) => (
                <li key={it.id} className="space-y-3 rounded-xl border border-border p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[it.beforeUrl, it.afterUrl].map((src, i) => (
                      <div key={i} className="aspect-video overflow-hidden rounded-md bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={i === 0 ? 'Before' : 'After'} loading="lazy" className="size-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {it.title}
                      {it.isFeatured && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-foreground">On home page</span>}
                      {!it.isPublished && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Hidden</span>}
                    </p>
                    {it.service && <p className="text-xs text-muted-foreground">{it.service}</p>}
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
