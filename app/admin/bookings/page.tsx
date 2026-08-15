import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('bookings')
    .select(
      'id, customer_name, vehicle_make, vehicle_model, scheduled_at, status, total_amount'
    )
    .order('scheduled_at', { ascending: true })

  if (status) {
    query = query.eq('status', status as BookingStatus)
  }

  const { data: bookings } = await query

  return (
    <div>
      <h1 className="text-2xl font-bold">Bookings</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/bookings"
          className={`rounded-full px-3 py-1 text-sm ${!status ? 'bg-brand text-brand-foreground' : 'border border-border'}`}
        >
          All
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/bookings?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm capitalize ${status === s ? 'bg-brand text-brand-foreground' : 'border border-border'}`}
          >
            {s.replace('_', ' ')}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Scheduled</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(bookings ?? []).map((b) => (
              <tr key={b.id} className="hover:bg-muted">
                <td className="px-4 py-3">
                  <Link href={`/admin/bookings/${b.id}`} className="font-medium hover:underline">
                    {b.customer_name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {b.vehicle_make} {b.vehicle_model}
                </td>
                <td className="px-4 py-3">{new Date(b.scheduled_at).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{b.status.replace('_', ' ')}</td>
                <td className="px-4 py-3">${Number(b.total_amount).toFixed(2)}</td>
              </tr>
            ))}
            {(bookings ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
