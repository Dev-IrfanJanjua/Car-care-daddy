import { createAdminClient } from '@/lib/supabase/admin'

/** A job is treated as finished this long after its scheduled start. */
export const AUTO_COMPLETE_AFTER_HOURS = 4

const THROTTLE_MS = 60_000
let lastRun = 0

export type AutoStatusResult = { enabled: boolean; started: number; completed: number }

/**
 * Moves bookings along on their own so nobody has to click through statuses:
 *
 *   confirmed   --(start time passed)-->            in_progress
 *   confirmed / in_progress --(start + 4h passed)--> completed
 *
 * `pending`, `cancelled` and `no_show` are never touched: they're human
 * decisions. The whole thing can be switched off with business_settings
 * .auto_status. Runs from the daily cron AND whenever an admin opens the
 * dashboard or bookings list (throttled to once a minute), so on a plan with
 * only daily crons the board is still current when someone looks at it.
 */
export async function syncBookingStatuses(opts: { force?: boolean } = {}): Promise<AutoStatusResult> {
  const now = Date.now()
  if (!opts.force && now - lastRun < THROTTLE_MS) return { enabled: true, started: 0, completed: 0 }
  lastRun = now

  const admin = createAdminClient()
  const { data: settings } = await admin.from('business_settings').select('*').maybeSingle()
  // Missing column (migration not run yet) counts as on, matching the column default.
  if (settings?.auto_status === false) return { enabled: false, started: 0, completed: 0 }

  const nowIso = new Date(now).toISOString()
  const doneBefore = new Date(now - AUTO_COMPLETE_AFTER_HOURS * 3_600_000).toISOString()

  // Completion first, so a job that started long ago skips straight to done
  // instead of flashing through in_progress.
  const { data: done } = await admin
    .from('bookings')
    .update({ status: 'completed' })
    .in('status', ['confirmed', 'in_progress'])
    .lte('scheduled_at', doneBefore)
    .select('id')

  const { data: started } = await admin
    .from('bookings')
    .update({ status: 'in_progress' })
    .eq('status', 'confirmed')
    .lte('scheduled_at', nowIso)
    .select('id')

  return { enabled: true, started: started?.length ?? 0, completed: done?.length ?? 0 }
}
