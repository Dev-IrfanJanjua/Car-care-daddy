import type { BrandSettings, ThemeMode } from '../types'
import { getScheme, DEFAULT_SCHEME_ID } from './schemes'
import { HEX_RE, foregroundOn } from './colors'

export type TokenMap = Record<string, string>

const mix = (a: string, b: string, pct: number) => `color-mix(in oklch, ${a} ${pct}%, ${b})`

/**
 * CSS custom properties that a scheme + accent change for one theme.
 * Returns {} for the built-in scheme with no accent, so the shipped look is
 * served entirely by globals.css and costs nothing.
 *
 * Pure: the admin preview feeds these same values to an inline `style`, which
 * is why the preview is faithful to what the live site will do.
 */
export function buildTokens(brand: Pick<BrandSettings, 'colorScheme' | 'accentColor'>, mode: ThemeMode): TokenMap {
  const scheme = getScheme(brand.colorScheme)
  const custom = HEX_RE.test(brand.accentColor) ? brand.accentColor : ''
  const isDefault = scheme.id === DEFAULT_SCHEME_ID
  const out: TokenMap = {}

  if (!isDefault) {
    const [deep, page, card, hover] = mode === 'dark' ? scheme.dark : scheme.light
    out['--ink-950'] = deep
    out['--ink-900'] = page
    out['--ink-800'] = card
    out['--ink-700'] = hover
    out['--ink-600'] = mix(hover, mode === 'dark' ? '#ffffff' : '#000000', mode === 'dark' ? 88 : 90)
  }

  // Dark surfaces take the scheme accent. Light surfaces keep the shipped
  // champagne unless the admin picked an accent explicitly: a bright accent
  // that looks right on navy is too faint for text and buttons on pearl.
  const accent = custom || (mode === 'dark' && !isDefault ? scheme.accent : '')
  if (accent) {
    out['--gold-500'] = accent
    out['--gold-300'] = mix(accent, '#ffffff', 55)
    out['--gold-400'] = mix(accent, '#ffffff', 80)
    out['--gold-600'] = mode === 'dark' ? mix(accent, '#ffffff', 85) : mix(accent, '#000000', 82)
    out['--gold-700'] = mix(accent, '#000000', 62)
    out['--gold-ink'] = mode === 'dark' ? out['--gold-400'] : mix(accent, '#000000', 60)
    out['--brand-foreground'] = foregroundOn(accent)
    out['--gold-foreground'] = out['--brand-foreground']
    out['--sidebar-primary-foreground'] = out['--brand-foreground']
  }
  return out
}

const toDecls = (t: TokenMap) => Object.entries(t).map(([k, v]) => `${k}:${v}`).join(';')

/** The stylesheet injected into <head>. Empty string when nothing changes. */
export function buildBrandCss(brand: Pick<BrandSettings, 'colorScheme' | 'accentColor'>): string {
  const light = toDecls(buildTokens(brand, 'light'))
  const dark = toDecls(buildTokens(brand, 'dark'))
  const css: string[] = []
  // `:root:root` doubles the specificity so these win over globals.css no
  // matter which stylesheet the bundler emits first.
  if (light) css.push(`:root:root{${light}}`)
  if (dark) css.push(`:root:root[data-theme="dark"],:root .zone-dark{${dark}}`)
  return css.join('')
}
