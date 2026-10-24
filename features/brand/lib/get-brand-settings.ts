import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { DEFAULT_BRAND, type BrandSettings, type DefaultTheme, type HeroMediaType } from '../types'
import { isSchemeId } from './schemes'
import { HEX_RE } from './colors'

export const BRAND_TAG = 'brand-settings'

/**
 * Appearance + hero media, cached and invalidated on save. Any failure (the
 * columns not migrated yet, database hiccup) returns the shipped defaults, so
 * the public site can never be taken down by the settings table.
 */
export const getBrandSettings = unstable_cache(
  async (): Promise<BrandSettings> => {
    try {
      const { data } = await createPublicClient().from('business_settings').select('*').maybeSingle()
      if (!data) return DEFAULT_BRAND
      const theme = data.default_theme as DefaultTheme | undefined
      const media = data.hero_media_type as HeroMediaType | undefined
      return {
        colorScheme: data.color_scheme && isSchemeId(data.color_scheme) ? data.color_scheme : DEFAULT_BRAND.colorScheme,
        accentColor: data.accent_color && HEX_RE.test(data.accent_color) ? data.accent_color : '',
        defaultTheme: theme === 'dark' || theme === 'system' ? theme : 'light',
        heroMediaType: media === 'image' ? 'image' : 'video',
        heroVideoUrl: data.hero_video_url ?? '',
        heroImageUrl: data.hero_image_url ?? '',
        heroPosterUrl: data.hero_poster_url ?? '',
      }
    } catch {
      return DEFAULT_BRAND
    }
  },
  ['brand-settings'],
  { tags: [BRAND_TAG], revalidate: 3600 }
)
