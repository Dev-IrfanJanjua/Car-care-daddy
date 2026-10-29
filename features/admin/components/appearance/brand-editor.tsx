'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, ImageIcon, Moon, Sun, Upload, Video, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  COLOR_SCHEMES,
  HEX_RE,
  buildTokens,
  getScheme,
  type BrandSettings,
  type DefaultTheme,
  type HeroMediaType,
} from '@/features/brand/client'
import { createMediaUploadUrl, saveBrandSettings, type MediaKind } from '../../actions/brand'

export type BrandDraft = BrandSettings & { autoStatus: boolean }

type HeroKind = Exclude<MediaKind, 'gallery' | 'galleryVideo' | 'review' | 'service'>
type Files = Partial<Record<HeroKind, File>>

function without(files: Files, key: HeroKind): Files {
  const next = { ...files }
  delete next[key]
  return next
}

const FALLBACK_POSTER = '/images/hero-poster.jpg'
const FALLBACK_VIDEO = '/videos/Video1.mp4'

function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; icon?: React.ReactNode }[]
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-border bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === o.value ? 'bg-brand text-brand-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** A miniature homepage, themed by the draft. Inline tokens on a `.zone-*` wrapper re-resolve every derived colour. */
function PreviewFrame({
  mode,
  draft,
  media,
}: {
  mode: 'light' | 'dark'
  draft: BrandDraft
  media: { type: HeroMediaType; video: string; image: string; poster: string }
}) {
  const style = buildTokens(draft, mode) as React.CSSProperties
  return (
    <div
      className={cn('overflow-hidden rounded-xl border border-border shadow-sm', mode === 'dark' ? 'zone-dark' : 'zone-light')}
      style={style}
    >
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <span className="font-display text-sm font-semibold text-chrome-100">Car Aurum</span>
        <span className="flex gap-3 text-[11px] text-chrome-500">
          <span>Services</span>
          <span>Gallery</span>
          <span>Contact</span>
        </span>
        <span className="rounded-md bg-brand px-2.5 py-1 text-[11px] font-semibold text-brand-foreground">Book now</span>
      </div>
      <div className="grid grid-cols-[1.2fr_1fr] items-center gap-4 bg-background p-4">
        <div>
          <p className="font-display text-lg leading-tight font-bold text-chrome-100">
            Crystal-clear glass,
            <span className="block text-gold-ink">right at your doorstep.</span>
          </p>
          <p className="mt-2 text-[11px] leading-snug text-chrome-300">Windshield, glass and headlight restoration in Lahore.</p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-md bg-brand px-3 py-1.5 text-[11px] font-semibold text-brand-foreground">Get a price</span>
            <span className="rounded-md border border-gold-500 px-3 py-1.5 text-[11px] font-semibold text-gold-ink">WhatsApp</span>
          </div>
          <div className="mt-3 rounded-lg border border-border bg-card p-2.5">
            <p className="text-[10px] text-chrome-500">Windshield restoration</p>
            <p className="font-display text-sm font-semibold text-gold-ink">Rs 6,500</p>
          </div>
        </div>
        <div className="relative h-36 overflow-hidden rounded-t-[4rem] rounded-b-xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.type === 'image' && media.image ? media.image : media.poster}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          {media.type === 'video' && (
            <video key={media.video} src={media.video} muted loop autoPlay playsInline className="absolute inset-0 size-full object-cover" />
          )}
        </div>
      </div>
    </div>
  )
}

function MediaField({
  kind,
  label,
  hint,
  accept,
  currentUrl,
  file,
  onFile,
  onClear,
}: {
  kind: HeroKind
  label: string
  hint: string
  accept: string
  currentUrl: string
  file?: File
  onFile: (f: File | undefined) => void
  onClear: () => void
}) {
  const id = `media-${kind}`
  const has = !!file || !!currentUrl
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={id}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Upload className="size-4" />
          {has ? 'Replace' : 'Choose file'}
        </label>
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            onFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        {has && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <X className="size-4" /> Use default
          </Button>
        )}
        <span className="truncate text-xs text-muted-foreground">
          {file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB) — not saved yet` : currentUrl ? 'Custom file in use' : 'Using the built-in file'}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

export function BrandEditor({ initial }: { initial: BrandDraft }) {
  const router = useRouter()
  const [saved, setSaved] = useState<BrandDraft>(initial)
  const [draft, setDraft] = useState<BrandDraft>(initial)
  const [files, setFiles] = useState<Files>({})
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light')
  const [pending, startTransition] = useTransition()

  const set = <K extends keyof BrandDraft>(key: K, value: BrandDraft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  // Local blob URLs so a chosen file previews instantly, before anything is uploaded.
  const blobs = useMemo(
    () => ({
      video: files.video ? URL.createObjectURL(files.video) : '',
      image: files.image ? URL.createObjectURL(files.image) : '',
      poster: files.poster ? URL.createObjectURL(files.poster) : '',
    }),
    [files]
  )
  useEffect(() => () => Object.values(blobs).forEach((u) => u && URL.revokeObjectURL(u)), [blobs])

  const media = {
    type: draft.heroMediaType,
    video: blobs.video || draft.heroVideoUrl || FALLBACK_VIDEO,
    image: blobs.image || draft.heroImageUrl,
    poster: blobs.poster || draft.heroPosterUrl || FALLBACK_POSTER,
  }

  const accentOk = draft.accentColor === '' || HEX_RE.test(draft.accentColor)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved) || Object.keys(files).length > 0
  const scheme = getScheme(draft.colorScheme)
  const accentShown = HEX_RE.test(draft.accentColor) ? draft.accentColor : scheme.accent || '#B8935A'

  function discard() {
    setDraft(saved)
    setFiles({})
  }

  function save() {
    if (!accentOk) return toast.error('Accent must look like #B99556')
    startTransition(async () => {
      try {
        const next = { ...draft }
        const urlKey = { video: 'heroVideoUrl', image: 'heroImageUrl', poster: 'heroPosterUrl', ogImage: 'ogImageUrl' } as const
        const sb = createClient()
        for (const kind of Object.keys(files) as HeroKind[]) {
          const f = files[kind]
          if (!f) continue
          const { path, token, publicUrl } = await createMediaUploadUrl(kind, f.name, f.type, f.size)
          const { error } = await sb.storage.from('site-media').uploadToSignedUrl(path, token, f, { contentType: f.type })
          if (error) throw new Error(`Upload failed: ${error.message}`)
          next[urlKey[kind]] = publicUrl
        }
        await saveBrandSettings(next)
        setSaved(next)
        setDraft(next)
        setFiles({})
        toast.success('Saved — the live site is updated')
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not save')
      }
    })
  }

  return (
    <div className="grid gap-6 pb-24 xl:grid-cols-[minmax(0,1fr)_28rem]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Colour scheme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {COLOR_SCHEMES.map((s) => {
                const active = s.id === draft.colorScheme
                const accent = s.accent || '#B8935A'
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set('colorScheme', s.id)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-colors',
                      active ? 'border-gold-500 bg-muted ring-2 ring-gold-500/40' : 'border-border hover:bg-muted'
                    )}
                  >
                    <div className="flex h-9 overflow-hidden rounded-md border border-border">
                      {[s.dark[0], s.dark[1], s.dark[2]].map((c) => (
                        <span key={c} className="flex-1" style={{ background: c }} />
                      ))}
                      <span className="flex-1" style={{ background: accent }} />
                      {[s.light[1], s.light[2]].map((c) => (
                        <span key={c} className="flex-1" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{s.label}</span>
                      {active && <Check className="size-4 text-gold-ink" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{s.blurb}</p>
                  </button>
                )
              })}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accent-hex">Accent colour (buttons, highlights)</Label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  aria-label="Pick accent colour"
                  value={accentShown}
                  onChange={(e) => set('accentColor', e.target.value.toUpperCase())}
                  className="size-10 cursor-pointer rounded-md border border-border bg-card p-1"
                />
                <Input
                  id="accent-hex"
                  value={draft.accentColor}
                  placeholder={scheme.accent || 'Scheme default'}
                  onChange={(e) => set('accentColor', e.target.value.trim())}
                  aria-invalid={!accentOk}
                  className="w-36 font-mono"
                />
                {draft.accentColor && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => set('accentColor', '')}>
                    Use scheme accent
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to use the scheme&apos;s own accent. A custom accent applies to both light and dark.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Theme visitors see first</Label>
              <div>
                <Segmented<DefaultTheme>
                  label="Default theme"
                  value={draft.defaultTheme}
                  onChange={(v) => set('defaultTheme', v)}
                  options={[
                    { value: 'light', label: 'Light', icon: <Sun className="size-4" /> },
                    { value: 'dark', label: 'Dark', icon: <Moon className="size-4" /> },
                    { value: 'system', label: 'Match device' },
                  ]}
                />
              </div>
              <p className="text-xs text-muted-foreground">Visitors can still switch with the toggle; their choice is remembered.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Home page hero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>Show</Label>
              <div>
                <Segmented<HeroMediaType>
                  label="Hero media type"
                  value={draft.heroMediaType}
                  onChange={(v) => set('heroMediaType', v)}
                  options={[
                    { value: 'video', label: 'Video', icon: <Video className="size-4" /> },
                    { value: 'image', label: 'Image', icon: <ImageIcon className="size-4" /> },
                  ]}
                />
              </div>
            </div>

            {draft.heroMediaType === 'video' ? (
              <>
                <MediaField
                  kind="video"
                  label="Hero video"
                  hint="MP4 or WebM, up to 50 MB. Short loops (10–20 s, no audio) work best."
                  accept="video/mp4,video/webm"
                  currentUrl={draft.heroVideoUrl}
                  file={files.video}
                  onFile={(f) => setFiles((x) => ({ ...x, video: f }))}
                  onClear={() => {
                    setFiles((f) => without(f, 'video'))
                    set('heroVideoUrl', '')
                  }}
                />
                <MediaField
                  kind="poster"
                  label="Poster image (shown while the video loads, and for reduced-motion visitors)"
                  hint="JPG, PNG or WebP, up to 8 MB."
                  accept="image/jpeg,image/png,image/webp"
                  currentUrl={draft.heroPosterUrl}
                  file={files.poster}
                  onFile={(f) => setFiles((x) => ({ ...x, poster: f }))}
                  onClear={() => {
                    setFiles((f) => without(f, 'poster'))
                    set('heroPosterUrl', '')
                  }}
                />
              </>
            ) : (
              <MediaField
                kind="image"
                label="Hero image"
                hint="JPG, PNG or WebP, up to 8 MB. Portrait or square crops best."
                accept="image/jpeg,image/png,image/webp"
                currentUrl={draft.heroImageUrl}
                file={files.image}
                onFile={(f) => setFiles((x) => ({ ...x, image: f }))}
                onClear={() => {
                  setFiles((f) => without(f, 'image'))
                  set('heroImageUrl', '')
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social sharing image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">
              This image appears when someone shares your website link on WhatsApp, Facebook, Twitter, LinkedIn etc.
            </p>
            <MediaField
              kind="ogImage"
              label="OG image"
              hint="Recommended 1200×630 px. JPG, PNG or WebP, up to 8 MB."
              accept="image/jpeg,image/png,image/webp"
              currentUrl={draft.ogImageUrl}
              file={files.ogImage}
              onFile={(f) => setFiles((x) => ({ ...x, ogImage: f }))}
              onClear={() => {
                setFiles((f) => without(f, 'ogImage'))
                set('ogImageUrl', '')
              }}
            />
            {(files.ogImage || draft.ogImageUrl) && (
              <div className="space-y-1.5">
                <Label>Preview</Label>
                <div className="overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={files.ogImage ? URL.createObjectURL(files.ogImage) : draft.ogImageUrl}
                    alt="OG image preview"
                    className="aspect-[1200/630] w-full object-cover"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking automation</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={draft.autoStatus}
                onChange={(e) => set('autoStatus', e.target.checked)}
                className="mt-1 size-4 accent-[var(--brand)]"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">Update booking statuses automatically</span>
                <span className="block text-xs text-muted-foreground">
                  Confirmed bookings move to In progress at their start time and to Completed 4 hours later. Pending,
                  cancelled and no-show are never changed automatically.
                </span>
              </span>
            </label>
          </CardContent>
        </Card>
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle>Preview</CardTitle>
            <Segmented<'light' | 'dark'>
              label="Preview theme"
              value={previewMode}
              onChange={setPreviewMode}
              options={[
                { value: 'light', label: 'Light', icon: <Sun className="size-4" /> },
                { value: 'dark', label: 'Dark', icon: <Moon className="size-4" /> },
              ]}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <PreviewFrame mode={previewMode} draft={draft} media={media} />
            <p className="text-xs text-muted-foreground">
              This is a preview only. Nothing changes on the live site until you press <strong>Save changes</strong>.
            </p>
          </CardContent>
        </Card>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:left-[var(--sidebar-width,16rem)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {dirty ? 'You have unsaved changes' : 'All changes saved'}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={discard} disabled={!dirty || pending}>
              Discard
            </Button>
            <Button type="button" onClick={save} disabled={!dirty || pending || !accentOk}>
              {pending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
