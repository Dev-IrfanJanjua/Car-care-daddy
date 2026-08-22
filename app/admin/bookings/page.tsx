import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BOOKING_STATUS_STYLES, formatBookingStatus } from '@/lib/booking-status'
import { formatPrice } from '@/lib/format'

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
    .select('id, customer_name, vehicle_make, vehicle_model, scheduled_at, status, total_amount')
    .order('scheduled_at', { ascending: true })

  if (status) {
    query = query.eq('status', status as BookingStatus)
  }

  const { data: bookings } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-muted-foreground">All customer appointments.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={!status ? 'default' : 'outline'}
          size="sm"
          render={<Link href="/admin/bookings" />}
        >
          All
        </Button>
        {STATUS_OPTIONS.map((s) => (
          <Button
            key={s}
            variant={status === s ? 'default' : 'outline'}
            size="sm"
            className="capitalize"
            render={<Link href={`/admin/bookings?status=${s}`} />}
          >
            {formatBookingStatus(s)}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(bookings ?? []).map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <Link href={`/admin/bookings/${b.id}`} className="font-medium hover:underline">
                      {b.customer_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {b.vehicle_make} {b.vehicle_model}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(b.scheduled_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={BOOKING_STATUS_STYLES[b.status]}>
                      {formatBookingStatus(b.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatPrice(Number(b.total_amount))}
                  </TableCell>
                </TableRow>
              ))}
              {(bookings ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
