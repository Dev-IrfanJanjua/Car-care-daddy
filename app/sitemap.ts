import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site-url'

const ROUTES: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  { path: '/services', priority: 0.9 },
  { path: '/quote', priority: 0.9 },
  { path: '/gallery', priority: 0.7 },
  { path: '/about', priority: 0.6 },
  { path: '/contact', priority: 0.6 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  return ROUTES.map((r) => ({
    url: `${base}${r.path}`,
    changeFrequency: 'weekly',
    priority: r.priority,
  }))
}
