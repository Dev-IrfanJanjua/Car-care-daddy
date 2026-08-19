import type { Database } from '@/lib/types/database.types'

type BookingStatus = Database['public']['Enums']['booking_status']

// Status color is reserved for state (good/warning/bad), kept distinct from
// the brand teal used for identity/actions elsewhere in the UI.
export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  confirmed: 'bg-brand/10 text-brand',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400',
  no_show: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

export function formatBookingStatus(status: BookingStatus) {
  return status.replace('_', ' ')
}
