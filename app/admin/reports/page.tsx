import { createClient } from '@/lib/supabase/server'
import { RevenueTrendChart } from './revenue-trend-chart'
import { TopServicesChart } from './top-services-chart'

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const now = new Date()
  const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000)

  const [{ data: completedBookings }, { data: bookingServices }] = await Promise.all([
    supabase
      .from('bookings')
      .select('scheduled_at, total_amount')
      .eq('status', 'completed')
      .gte('scheduled_at', eightWeeksAgo.toISOString()),
    supabase.from('booking_services').select('service_id'),
  ])

  const weekBuckets: { weekStart: Date; total: number }[] = []
  for (let i = 7; i >= 0; i--) {
    const weekStart = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000))
    weekBuckets.push({ weekStart, total: 0 })
  }
  for (const booking of completedBookings ?? []) {
    const bookingWeekStart = startOfWeek(new Date(booking.scheduled_at)).getTime()
    const bucket = weekBuckets.find((b) => b.weekStart.getTime() === bookingWeekStart)
    if (bucket) bucket.total += Number(booking.total_amount)
  }

  const countByService = new Map<string, number>()
  for (const row of bookingServices ?? []) {
    countByService.set(row.service_id, (countByService.get(row.service_id) ?? 0) + 1)
  }
  const serviceIds = Array.from(countByService.keys())
  const { data: services } =
    serviceIds.length > 0
      ? await supabase.from('services').select('id, name').in('id', serviceIds)
      : { data: [] }
  const serviceNameById = new Map((services ?? []).map((s) => [s.id, s.name]))

  const topServices = Array.from(countByService.entries())
    .map(([serviceId, count]) => ({ name: serviceNameById.get(serviceId) ?? 'Unknown', count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div>
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="font-semibold">Revenue, last 8 weeks</h2>
          <RevenueTrendChart
            data={weekBuckets.map((b) => ({ label: b.weekStart, value: b.total }))}
          />
        </div>

        <div className="rounded-lg border border-border p-4">
          <h2 className="font-semibold">Top services by bookings</h2>
          <TopServicesChart data={topServices} />
        </div>
      </div>
    </div>
  )
}
