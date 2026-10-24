/**
 * Colour schemes. Each one is a dark and a light surface ramp
 * ([deepest, page, raised card, hover/secondary]) plus an optional accent.
 * The first scheme is the shipped default and needs no override at all: its
 * values live in app/globals.css.
 */
export type ColorScheme = {
  id: string
  label: string
  blurb: string
  /** '' = keep the built-in brass/champagne */
  accent: string
  dark: [string, string, string, string]
  light: [string, string, string, string]
}

export const DEFAULT_SCHEME_ID = 'midnight-pearl'

export const COLOR_SCHEMES: ColorScheme[] = [
  { id: 'midnight-pearl', label: 'Heritage & Pearl', blurb: 'Deep green with brass, pearl with champagne', accent: '',
    dark: ['#0B241F', '#0E2B25', '#143A32', '#1D4A40'], light: ['#F1EBE0', '#F8F5F0', '#FFFFFF', '#FBF8F2'] },
  { id: 'navy-aqua', label: 'Navy & Gold', blurb: 'Navy blue with warm gold', accent: '#D4AF37',
    dark: ['#0A1E3C', '#0D2547', '#12305A', '#183A6B'], light: ['#EEE4CD', '#F6EEDC', '#FFFBF1', '#FAF2E1'] },
  { id: 'royal-gold', label: 'Royal Gold', blurb: 'Royal blue with rich gold', accent: '#D4AF37',
    dark: ['#0B1B3A', '#0F2447', '#152E58', '#1B3A6A'], light: ['#F1EAD8', '#FAF6EC', '#FFFDF7', '#F7F0E0'] },
  { id: 'ocean-silver', label: 'Ocean & Silver', blurb: 'Deep ocean blue with silver-blue', accent: '#8FB8D8',
    dark: ['#072238', '#0A2B47', '#0F3659', '#15426C'], light: ['#E8EEF3', '#F3F6F9', '#FFFFFF', '#F0F4F7'] },
  { id: 'obsidian-champagne', label: 'Obsidian & Champagne', blurb: 'Near-black with soft champagne', accent: '#C9A66B',
    dark: ['#0F1217', '#151A21', '#1C222B', '#252D38'], light: ['#EBE6DC', '#F5F2EC', '#FFFEFB', '#F8F5EE'] },
  { id: 'emerald-brass', label: 'Emerald & Brass', blurb: 'Rich emerald with brass', accent: '#C8A96A',
    dark: ['#08231F', '#0B2C27', '#10382F', '#164A3E'], light: ['#E9E4D5', '#F4F1E8', '#FFFEF8', '#F7F4EA'] },
  { id: 'graphite-copper', label: 'Graphite & Copper', blurb: 'Graphite grey with copper', accent: '#D08A5B',
    dark: ['#14171C', '#1A1E25', '#222730', '#2B313C'], light: ['#EAE5E0', '#F4F1EE', '#FFFFFF', '#F8F5F2'] },
]

export function getScheme(id: string): ColorScheme {
  return COLOR_SCHEMES.find((s) => s.id === id) ?? COLOR_SCHEMES[0]
}

export const isSchemeId = (id: string) => COLOR_SCHEMES.some((s) => s.id === id)
