import { Resend } from 'resend'

// Returns null when no key is configured yet, so callers can no-op gracefully
// instead of crashing a booking flow over an unconfigured optional feature.
export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}
