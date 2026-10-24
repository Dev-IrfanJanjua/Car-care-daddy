import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private or per-customer pages: never useful in search results.
      disallow: ['/admin', '/api', '/book/success', '/review', '/login'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
