import { createClient } from '@/lib/supabase/server'
import { BrandEditor } from '@/features/admin'
import { DEFAULT_BRAND, isSchemeId, HEX_RE, type DefaultTheme } from '@/features/brand'

export const metadata = { title: 'Appearance' }

export default async function AppearancePage() {
  const supabase = await createClient()
  const { data } = await supabase.from('business_settings').select('*').eq('id', true).maybeSingle()

  const theme = data?.default_theme as DefaultTheme | undefined
  const initial = {
    colorScheme: data?.color_scheme && isSchemeId(data.color_scheme) ? data.color_scheme : DEFAULT_BRAND.colorScheme,
    accentColor: data?.accent_color && HEX_RE.test(data.accent_color) ? data.accent_color : '',
    defaultTheme: theme === 'dark' || theme === 'system' ? theme : ('light' as DefaultTheme),
    heroMediaType: data?.hero_media_type === 'image' ? ('image' as const) : ('video' as const),
    heroVideoUrl: data?.hero_video_url ?? '',
    heroImageUrl: data?.hero_image_url ?? '',
    heroPosterUrl: data?.hero_poster_url ?? '',
    autoStatus: data?.auto_status !== false,
    ogImageUrl: data?.og_image_url ?? '',
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Pick a colour scheme, set the home page hero, and preview everything before it goes live.
        </p>
      </div>
      <BrandEditor initial={initial} />
    </div>
  )
}
