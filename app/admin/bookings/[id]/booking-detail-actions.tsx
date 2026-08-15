'use client'

import { useState, useTransition } from 'react'
import {
  updateBookingStatus,
  assignTechnician,
  updateBookingNotes,
} from '@/lib/actions/admin/bookings'
import type { Database } from '@/lib/types/database.types'

type BookingStatus = Database['public']['Enums']['booking_status']

const STATUS_OPTIONS: BookingStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]

export function BookingDetailActions({
  bookingId,
  currentStatus,
  currentTechnicianId,
  currentNotes,
  technicians,
}: {
  bookingId: string
  currentStatus: BookingStatus
  currentTechnicianId: string | null
  currentNotes: string
  technicians: { id: string; full_name: string }[]
}) {
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(currentNotes)

  return (
    <div className="mt-6 space-y-4 rounded-lg border border-border p-4">
      <h2 className="font-semibold">Manage</h2>

      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          defaultValue={currentStatus}
          onChange={(e) =>
            startTransition(() => updateBookingStatus(bookingId, e.target.value as BookingStatus))
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="technician" className="block text-sm font-medium">
          Assigned technician
        </label>
        <select
          id="technician"
          defaultValue={currentTechnicianId ?? ''}
          onChange={(e) =>
            startTransition(() => assignTechnician(bookingId, e.target.value || null))
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
        >
          <option value="">Unassigned</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          Internal notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => startTransition(() => updateBookingNotes(bookingId, notes))}
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
        />
      </div>

      {isPending && <p className="text-xs text-muted-foreground">Saving…</p>}
    </div>
  )
}
