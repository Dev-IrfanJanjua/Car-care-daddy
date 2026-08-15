import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateTechnicianStatus } from '@/lib/actions/admin/technicians'
import type { Database } from '@/lib/types/database.types'

type TechnicianStatus = Database['public']['Enums']['technician_status']

const STATUS_OPTIONS: TechnicianStatus[] = ['active', 'inactive', 'on_leave']

export default async function TechnicianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: technician }, { data: upcomingBookings }] = await Promise.all([
    supabase.from('technicians').select('*').eq('id', id).single(),
    supabase
      .from('bookings')
      .select('id, customer_name, scheduled_at, status')
      .eq('assigned_technician_id', id)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at'),
  ])

  if (!technician) notFound()

  const updateStatusForThisTechnician = updateTechnicianStatus.bind(null, id)

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">{technician.full_name}</h1>
      <p className="text-muted-foreground">{technician.email ?? technician.phone ?? '—'}</p>

      <form action={updateStatusForThisTechnician} className="mt-4">
        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={technician.status}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="mt-3 rounded-md border border-border px-4 py-2 text-sm font-semibold"
        >
          Update status
        </button>
      </form>

      <div className="mt-8">
        <h2 className="font-semibold">Upcoming jobs</h2>
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
          {(upcomingBookings ?? []).map((b) => (
            <li key={b.id} className="flex items-center justify-between px-4 py-3">
              <span>{b.customer_name}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(b.scheduled_at).toLocaleString()}
              </span>
            </li>
          ))}
          {(upcomingBookings ?? []).length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">No upcoming jobs.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
