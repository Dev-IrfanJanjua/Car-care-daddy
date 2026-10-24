import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export class RateLimitError extends Error {
  constructor(message = 'Too many attempts. Please wait a few minutes and try again.') {
    super(message)
    this.name = 'RateLimitError'
  }
}

/** Best-effort caller address. Vercel sets x-forwarded-for; the first entry is the client. */
export async function clientIp() {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || h.get('x-real-ip') || 'unknown'
}

const hash = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 32)

/**
 * Counts one hit against `action` for this caller and throws RateLimitError
 * once `max` hits land inside `windowSeconds`.
 *
 * `extra` adds a second, independent counter (e.g. the phone number on a
 * booking) so rotating IP addresses does not get round the limit.
 *
 * Fails OPEN if the limiter itself errors (for instance migration 0015 has not
 * been run): this is spam control, not authorisation, and a broken counter must
 * never stop a real customer booking. The failure is logged.
 */
export async function rateLimit(
  action: string,
  opts: { max: number; windowSeconds: number; extra?: string; extraMax?: number }
) {
  const ip = await clientIp()
  const checks: { key: string; max: number }[] = [{ key: `${action}:ip:${hash(ip)}`, max: opts.max }]
  if (opts.extra) checks.push({ key: `${action}:x:${hash(opts.extra)}`, max: opts.extraMax ?? opts.max })

  const admin = createAdminClient()
  for (const c of checks) {
    const { data, error } = await admin.rpc('check_rate_limit', {
      p_key: c.key,
      p_max: c.max,
      p_window_seconds: opts.windowSeconds,
    })
    if (error) {
      console.error('[rate-limit] check failed, allowing request:', error.message)
      return
    }
    if (data === false) throw new RateLimitError()
  }
}
