'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  updateBookingStatus,
  assignTechnician,
  updateBookingNotes,
  rescheduleBooking,
} from '@/lib/actions/admin/bookings'
import type { Database } from '@/lib/types/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatBookingStatus } from '@/lib/booking-status'

type BookingStatus = Database['public']['Enums']['booking_status']

const STATUS_OPTIONS: BookingStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]

// <input type="datetime-local"> wants local wall-clock "YYYY-MM-DDTHH:mm", so
// the stored UTC timestamp has to be rendered through the browser's offset.
function toLocalInputValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

export function BookingDetailActions({
  bookingId,
  currentStatus,
  currentTechnicianId,
  currentNotes,
  currentScheduledAt,
  technicians,
}: {
  bookingId: string
  currentStatus: BookingStatus
  currentTechnicianId: string | null
  currentNotes: string
  currentScheduledAt: string
  technicians: { id: string; full_name: string }[]
}) {
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(currentNotes)
  const [scheduledAt, setScheduledAt] = useState(() => toLocalInputValue(currentScheduledAt))

  function handleStatusChange(value: string | null) {
    if (!value) return
    startTransition(async () => {
      try {
        await updateBookingStatus(bookingId, value as BookingStatus)
        toast.success('Status updated')
      } catch {
        toast.error('Could not update status')
      }
    })
  }

  function handleTechnicianChange(value: string | null) {
    if (!value) return
    startTransition(async () => {
      try {
        await assignTechnician(bookingId, value === 'unassigned' ? null : value)
        toast.success('Technician assignment updated')
      } catch {
        toast.error('Could not update technician')
      }
    })
  }

  function handleReschedule() {
    // Parsed here, in the browser, so the admin's wall-clock reading is what
    // gets converted to UTC -- not the server's timezone.
    const parsed = new Date(scheduledAt)
    if (Number.isNaN(parsed.getTime())) {
      toast.error('Pick a valid date and time')
      return
    }
    startTransition(async () => {
      try {
        await rescheduleBooking(bookingId, parsed.toISOString())
        toast.success('Appointment rescheduled')
      } catch {
        toast.error('Could not reschedule')
      }
    })
  }

  function handleNotesBlur() {
    startTransition(async () => {
      try {
        await updateBookingNotes(bookingId, notes)
      } catch {
        toast.error('Could not save notes')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select defaultValue={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue>
                {(value: BookingStatus | null) => (value ? formatBookingStatus(value) : '')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {formatBookingStatus(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="technician">Assigned technician</Label>
          <Select
            defaultValue={currentTechnicianId ?? 'unassigned'}
            onValueChange={handleTechnicianChange}
          >
            <SelectTrigger id="technician" className="w-full">
              <SelectValue>
                {(value: string | null) =>
                  value === 'unassigned' || !value
                    ? 'Unassigned'
                    : technicians.find((t) => t.id === value)?.full_name
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {technicians.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="scheduledAt">Appointment</Label>
          <div className="flex gap-2">
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <Button variant="outline" onClick={handleReschedule} disabled={isPending}>
              Reschedule
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Internal notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            rows={3}
          />
        </div>

        {isPending && (
          <Button variant="ghost" size="sm" disabled className="pointer-events-none">
            Saving…
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
