import { createClient } from '@/lib/supabase/server'
import { formatCompactNumber, formatCompactCurrency } from '@/lib/format'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: bookingsToday },
    { count: bookingsThisWeek },
    { data: completedThisMonth },
    { count: pendingLeads },
    { count: activeTechnicians },
    { data: recentBookings },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('scheduled_at', startOfToday),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('scheduled_at', startOfWeek),
    supabase
      .from('bookings')
      .select('total_amount')
      .eq('status', 'completed')
      .gte('scheduled_at', startOfMonth),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('technicians')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('bookings')
      .select('id, customer_name, scheduled_at, status, total_amount')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const revenueThisMonth = (completedThisMonth ?? []).reduce(
    (sum, b) => sum + Number(b.total_amount),
    0
  )

  const tiles = [
    { label: 'Bookings today', value: formatCompactNumber(bookingsToday ?? 0) },
    { label: 'Bookings this week', value: formatCompactNumber(bookingsThisWeek ?? 0) },
    { label: 'Revenue this month', value: formatCompactCurrency(revenueThisMonth) },
    { label: 'Pending leads', value: formatCompactNumber(pendingLeads ?? 0) },
    { label: 'Active technicians', value: formatCompactNumber(activeTechnicians ?? 0) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">{tile.label}</p>
            <p className="mt-1 text-2xl font-semibold">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-semibold">Recent bookings</h2>
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
          {(recentBookings ?? []).map((b) => (
            <li key={b.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{b.customer_name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(b.scheduled_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm capitalize">{b.status.replace('_', ' ')}</p>
                <p className="font-semibold">${Number(b.total_amount).toFixed(2)}</p>
              </div>
            </li>
          ))}
          {(recentBookings ?? []).length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">No bookings yet.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
