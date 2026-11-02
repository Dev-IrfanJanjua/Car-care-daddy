'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { deleteBooking } from '../actions/bookings'

/**
 * Deletes a booking after a confirmation. `redirectTo` is for the detail
 * page (the booking it is showing no longer exists); list rows just refresh.
 */
export function DeleteBookingButton({
  bookingId,
  customerName,
  redirectTo,
  compact = false,
}: {
  bookingId: string
  customerName: string
  redirectTo?: string
  compact?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onDelete() {
    if (!window.confirm(`Delete the booking for ${customerName}? This cannot be undone.`)) return
    startTransition(async () => {
      try {
        await deleteBooking(bookingId)
        toast.success('Booking deleted')
        if (redirectTo) router.push(redirectTo)
        else router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not delete the booking')
      }
    })
  }

  return (
    <Button
      type="button"
      variant={compact ? 'ghost' : 'outline'}
      size={compact ? 'icon-sm' : 'sm'}
      onClick={onDelete}
      disabled={pending}
      aria-label={`Delete booking for ${customerName}`}
      title="Delete booking"
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="size-4" />
      {!compact && (pending ? 'Deleting…' : 'Delete booking')}
    </Button>
  )
}
