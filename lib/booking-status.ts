import type { Database } from '@/lib/types/database.types'

type BookingStatus = Database['public']['Enums']['booking_status']

// Status color is reserved for state (good/warning/bad), kept distinct from
// the brand navy used for identity/actions elsewhere in the UI. `confirmed` is
// the exception: it's the brand's own accent because it's the state the whole
// funnel is aiming at.
export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  confirmed: 'bg-gold/15 text-gold-ink',
  in_progress: 'bg-sky-500/12 text-sky-700',
  completed: 'bg-emerald-500/10 text-emerald-600',
  cancelled: 'bg-red-500/10 text-red-600',
  no_show: 'bg-red-500/10 text-red-600',
}

export function formatBookingStatus(status: BookingStatus) {
  return status.replace('_', ' ')
}
