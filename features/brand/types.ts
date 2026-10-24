export type ThemeMode = 'light' | 'dark'
export type DefaultTheme = ThemeMode | 'system'
export type HeroMediaType = 'video' | 'image'

/** Everything the admin can change about look and hero media. */
export type BrandSettings = {
  colorScheme: string
  /** '#rrggbb' or '' for "use the scheme's own accent" */
  accentColor: string
  defaultTheme: DefaultTheme
  heroMediaType: HeroMediaType
  heroVideoUrl: string
  heroImageUrl: string
  heroPosterUrl: string
}

export const DEFAULT_BRAND: BrandSettings = {
  colorScheme: 'midnight-pearl',
  accentColor: '',
  defaultTheme: 'light',
  heroMediaType: 'video',
  heroVideoUrl: '',
  heroImageUrl: '',
  heroPosterUrl: '',
}
