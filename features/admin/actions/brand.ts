'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { BRAND_TAG, HEX_RE, isSchemeId, type BrandSettings } from '@/features/brand'

const BUCKET = 'site-media'

const LIMITS = {
  video: { max: 50 * 1024 * 1024, types: ['video/mp4', 'video/webm'] },
  image: { max: 8 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
  poster: { max: 8 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
  gallery: { max: 8 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
  galleryVideo: { max: 50 * 1024 * 1024, types: ['video/mp4', 'video/webm'] },
} as const

export type MediaKind = keyof typeof LIMITS

/**
 * Step 1 of a media upload. Vercel caps request bodies at ~4.5 MB, so a video
 * can't travel through a Server Action; instead the admin gets a one-shot
 * signed URL and the browser uploads straight to Supabase Storage.
 */
export async function createMediaUploadUrl(kind: MediaKind, fileName: string, contentType: string, size: number) {
  await requireAdmin()

  const rule = LIMITS[kind]
  if (!rule) throw new Error('Unknown media type')
  if (!(rule.types as readonly string[]).includes(contentType)) {
    throw new Error(`Unsupported file type. Use ${rule.types.map((t) => t.split('/')[1]).join(', ')}.`)
  }
  if (size > rule.max) throw new Error(`File too large (max ${Math.round(rule.max / 1024 / 1024)} MB).`)

  const ext = (fileName.split('.').pop() ?? '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin'
  const folder = kind === 'gallery' || kind === 'galleryVideo' ? 'gallery' : 'hero'
  const path = `${folder}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`

  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    throw new Error(
      `Could not start the upload (${error?.message ?? 'unknown error'}). Did you run migration 0013 so the site-media bucket exists?`
    )
  }
  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
  return { path, token: data.token, publicUrl: pub.publicUrl }
}

/**
 * Step 2: persist the whole appearance draft in one write. Called only from
 * the editor's Save button, so nothing reaches the live site until then.
 */
export async function saveBrandSettings(input: BrandSettings & { autoStatus?: boolean }) {
  const { supabase } = await requireAdmin()

  if (!isSchemeId(input.colorScheme)) throw new Error('Unknown colour scheme')
  if (input.accentColor && !HEX_RE.test(input.accentColor)) throw new Error('Accent must look like #B99556')
  if (!['light', 'dark', 'system'].includes(input.defaultTheme)) throw new Error('Unknown default theme')
  if (!['video', 'image'].includes(input.heroMediaType)) throw new Error('Unknown hero media type')
  if (input.heroMediaType === 'image' && !input.heroImageUrl) throw new Error('Upload a hero image or switch back to video')

  // Only URLs inside our own bucket are accepted, so the field can't be used to
  // point the homepage at arbitrary third-party media.
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`
  for (const url of [input.heroVideoUrl, input.heroImageUrl, input.heroPosterUrl]) {
    if (url && !url.startsWith(base)) throw new Error('Media must be uploaded through the editor')
  }

  const { data, error } = await supabase
    .from('business_settings')
    .update({
      color_scheme: input.colorScheme,
      accent_color: input.accentColor || null,
      default_theme: input.defaultTheme,
      hero_media_type: input.heroMediaType,
      hero_video_url: input.heroVideoUrl || null,
      hero_image_url: input.heroImageUrl || null,
      hero_poster_url: input.heroPosterUrl || null,
      ...(typeof input.autoStatus === 'boolean' ? { auto_status: input.autoStatus } : {}),
    })
    .eq('id', true)
    .select('id')

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Nothing was saved. Run migration 0013 in Supabase, and make sure the settings row exists.')
  }

  updateTag(BRAND_TAG)
  revalidatePath('/', 'layout')
}
