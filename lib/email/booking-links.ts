// Absolute URLs for guest-facing booking pages. Both routes read booking rows
// with the service-role client, so they require the per-booking access_token
// (added in 0005_security_hardening.sql) alongside the id.
//
// NEXT_PUBLIC_SITE_URL should be set in production; the localhost fallback
// keeps dev links clickable without extra config.
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function bookingSuccessUrl(bookingId: string, accessToken: string) {
  return `${siteUrl()}/book/success/${bookingId}?t=${accessToken}`
}

export function bookingReviewUrl(bookingId: string, accessToken: string) {
  return `${siteUrl()}/review/${bookingId}?t=${accessToken}`
}

// Booking fields are customer-supplied and land in email HTML, so they must be
// escaped -- a name containing a tag would otherwise inject markup.
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
