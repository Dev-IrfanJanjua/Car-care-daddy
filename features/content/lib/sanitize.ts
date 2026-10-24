import type { HomeContent } from '../types'
import { DEFAULT_CONTENT } from './defaults'

export const LIMITS = {
  heroBadge: 60,
  heroHeadline: 70,
  heroAccent: 70,
  heroSubtext: 300,
  heroPoint: 50,
  ctaTitle: 90,
  ctaText: 200,
  faqQ: 140,
  faqA: 600,
  faqCount: 10,
} as const

const str = (v: unknown, fallback: string, max: number) => {
  if (typeof v !== 'string') return fallback
  const t = v.trim().slice(0, max)
  return t || fallback
}

/**
 * Turns whatever is stored (or submitted) into a complete, bounded HomeContent.
 * A blank or malformed field falls back to the default, so a half-filled form
 * can never produce an empty hero.
 */
export function sanitizeContent(raw: unknown): HomeContent {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const d = DEFAULT_CONTENT

  const rawPoints = Array.isArray(r.heroPoints) ? r.heroPoints : []
  const points = d.heroPoints.map((def, i) => str(rawPoints[i], def, LIMITS.heroPoint))

  // FAQs: undefined means "use defaults"; an explicit array (even empty) is respected.
  let faqs = d.faqs
  if (Array.isArray(r.faqs)) {
    faqs = r.faqs
      .map((f) => {
        const o = (f && typeof f === 'object' ? f : {}) as Record<string, unknown>
        return {
          q: typeof o.q === 'string' ? o.q.trim().slice(0, LIMITS.faqQ) : '',
          a: typeof o.a === 'string' ? o.a.trim().slice(0, LIMITS.faqA) : '',
        }
      })
      .filter((f) => f.q && f.a)
      .slice(0, LIMITS.faqCount)
  }

  return {
    heroBadge: str(r.heroBadge, d.heroBadge, LIMITS.heroBadge),
    heroHeadline: str(r.heroHeadline, d.heroHeadline, LIMITS.heroHeadline),
    heroAccent: str(r.heroAccent, d.heroAccent, LIMITS.heroAccent),
    heroSubtext: str(r.heroSubtext, d.heroSubtext, LIMITS.heroSubtext),
    heroPoints: points,
    ctaTitle: str(r.ctaTitle, d.ctaTitle, LIMITS.ctaTitle),
    ctaText: str(r.ctaText, d.ctaText, LIMITS.ctaText),
    faqs,
  }
}
