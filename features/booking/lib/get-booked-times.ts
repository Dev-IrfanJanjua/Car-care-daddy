import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Start times (UTC ISO) of every upcoming booking that still holds a slot --
 * everything except cancelled and no-show. Times only: no names, no addresses,
 * so it is safe to hand to the browser for greying out the calendar.
 */
export async function getBookedTimes(): Promise<string[]> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('bookings')
      .select('scheduled_at')
      .gte('scheduled_at', new Date(Date.now() - 3 * 3600 * 1000).toISOString())
      .not('status', 'in', '(cancelled,no_show)')
      .order('scheduled_at')
      .limit(1000)
    return (data ?? []).map((r) => r.scheduled_at)
  } catch {
    // Never block the page on this; the server re-checks when the booking is made.
    return []
  }
}
