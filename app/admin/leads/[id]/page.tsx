import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { convertLeadToBooking, updateLeadStatus } from '@/lib/actions/admin/leads'
import type { Database } from '@/lib/types/database.types'
import { VEHICLE_CLASSES, vehicleClassLabel } from '@/lib/vehicles/classes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'

type VehicleClass = Database['public']['Enums']['vehicle_class']
type LeadStatus = Database['public']['Enums']['lead_status']
// 'converted' is set by the conversion flow itself, not picked by hand.
const MANUAL_LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'lost']

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lead } = await supabase.from('leads').select('*').eq('id', id).single()
  if (!lead) notFound()

  let guessedClass: VehicleClass | null = null
  if (lead.vehicle_model) {
    const { data: match } = await supabase
      .from('vehicle_models')
      .select('vehicle_class')
      .ilike('name', lead.vehicle_model)
      .limit(1)
      .maybeSingle()
    guessedClass = match?.vehicle_class ?? null
  }

  const serviceIds = (lead.service_ids ?? []) as string[]
  const canConvert = lead.status !== 'converted' && serviceIds.length > 0
  const convertAction = convertLeadToBooking.bind(null, id)

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to leads
        </Link>
        <h1 className="mt-2 text-2xl font-bold">
          {lead.full_name || lead.email || 'Unknown contact'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {lead.email} {lead.phone && `· ${lead.phone}`}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-1.5 text-sm">
          <p>
            {lead.vehicle_year} {lead.vehicle_make} {lead.vehicle_model}
          </p>
          {lead.quote_total !== null && (
            <p>Quoted total: {formatPrice(Number(lead.quote_total))}</p>
          )}
          <Badge variant="outline" className="capitalize">
            {lead.status}
          </Badge>
        </CardContent>
      </Card>

      {lead.status !== 'converted' && (
        <Card>
          <CardHeader>
            <CardTitle>Update status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {MANUAL_LEAD_STATUSES.filter((s) => s !== lead.status).map((s) => (
              <form key={s} action={updateLeadStatus.bind(null, id, s)}>
                <Button type="submit" size="sm" variant="outline" className="capitalize">
                  Mark {s}
                </Button>
              </form>
            ))}
          </CardContent>
        </Card>
      )}

      {canConvert ? (
        <Card>
          <CardHeader>
            <CardTitle>Convert to booking</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={convertAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="customerName">Full name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  defaultValue={lead.full_name ?? ''}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  defaultValue={lead.email ?? ''}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  defaultValue={lead.phone ?? ''}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vehicleClass">Vehicle class</Label>
                {/* Native select: the Select primitive's render-prop SelectValue
                    takes a function child, which a Server Component can't pass
                    to a Client Component. */}
                <select
                  id="vehicleClass"
                  name="vehicleClass"
                  defaultValue={guessedClass ?? ''}
                  required
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm capitalize"
                >
                  <option value="">Confirm vehicle class…</option>
                  {VEHICLE_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {vehicleClassLabel(c)}
                    </option>
                  ))}
                </select>
                {guessedClass && (
                  <p className="text-xs text-muted-foreground">
                    Guessed from the model name — confirm before converting, it sets the price.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serviceAddress">Street address</Label>
                <Input id="serviceAddress" name="serviceAddress" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serviceCity">City</Label>
                <Input id="serviceCity" name="serviceCity" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="scheduledAt">Scheduled at</Label>
                <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
              </div>
              <Button type="submit" className="w-full">
                Create booking
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          {lead.status === 'converted'
            ? 'This lead has already been converted.'
            : "This lead has no service selections captured, so it can't be auto-converted."}
        </p>
      )}
    </div>
  )
}
