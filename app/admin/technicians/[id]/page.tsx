import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updateTechnician, updateTechnicianStatus } from '@/lib/actions/admin/technicians'
import type { Database } from '@/lib/types/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <div className="max-w-xl space-y-6">
      <div>
        <Link
          href="/admin/technicians"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to technicians
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{technician.full_name}</h1>
        <p className="text-sm text-muted-foreground">
          {technician.email ?? technician.phone ?? '—'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateTechnician.bind(null, id)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" defaultValue={technician.full_name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={technician.email ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={technician.phone ?? ''} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                name="skills"
                defaultValue={(technician.skills ?? []).join(', ')}
                placeholder="windshield, headlights"
              />
              <p className="text-xs text-muted-foreground">Comma-separated.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input id="photoUrl" name="photoUrl" defaultValue={technician.photo_url ?? ''} />
            </div>
            <Button type="submit">Save details</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateStatusForThisTechnician} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Availability</Label>
              {/* Native select: the Select primitive's render-prop SelectValue
                  takes a function child, which a Server Component can't pass to
                  a Client Component. */}
              <select
                id="status"
                name="status"
                defaultValue={technician.status}
                className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm capitalize"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="outline">
              Update status
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {(upcomingBookings ?? []).map((b) => (
              <li key={b.id} className="flex items-center justify-between px-6 py-3">
                <span>{b.customer_name}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(b.scheduled_at).toLocaleString()}
                </span>
              </li>
            ))}
            {(upcomingBookings ?? []).length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-muted-foreground">
                No upcoming jobs.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
