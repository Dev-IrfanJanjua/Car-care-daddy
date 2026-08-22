import Link from 'next/link'
import { CalendarCheck, CalendarRange, DollarSign, Target, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCompactNumber, formatCompactCurrency, formatPrice } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BOOKING_STATUS_STYLES, formatBookingStatus } from '@/lib/booking-status'

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
    { label: 'Bookings today', value: formatCompactNumber(bookingsToday ?? 0), icon: CalendarCheck },
    {
      label: 'Bookings this week',
      value: formatCompactNumber(bookingsThisWeek ?? 0),
      icon: CalendarRange,
    },
    { label: 'Revenue this month', value: formatCompactCurrency(revenueThisMonth), icon: DollarSign },
    { label: 'Pending leads', value: formatCompactNumber(pendingLeads ?? 0), icon: Target },
    {
      label: 'Active technicians',
      value: formatCompactNumber(activeTechnicians ?? 0),
      icon: Wrench,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">A snapshot of how the business is running.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {tile.label}
              </CardTitle>
              <tile.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{tile.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {(recentBookings ?? []).map((b) => (
              <li key={b.id} className="flex items-center justify-between px-6 py-3">
                <Link href={`/admin/bookings/${b.id}`} className="min-w-0">
                  <p className="truncate font-medium hover:underline">{b.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(b.scheduled_at).toLocaleString()}
                  </p>
                </Link>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={BOOKING_STATUS_STYLES[b.status]}>
                    {formatBookingStatus(b.status)}
                  </Badge>
                  <span className="font-semibold tabular-nums">
                    {formatPrice(Number(b.total_amount))}
                  </span>
                </div>
              </li>
            ))}
            {(recentBookings ?? []).length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-muted-foreground">
                No bookings yet.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
