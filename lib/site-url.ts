/** Public origin of the site, no trailing slash. Set NEXT_PUBLIC_SITE_URL in production. */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}
