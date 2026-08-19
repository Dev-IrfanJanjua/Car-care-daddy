import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { convertLeadToBooking } from '@/lib/actions/admin/leads'
import type { Database } from '@/lib/types/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type VehicleClass = Database['public']['Enums']['vehicle_class']
const VEHICLE_CLASSES: VehicleClass[] = ['sedan', 'suv', 'truck', 'van', 'coupe', 'luxury']

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
            <p>Quoted total: ${Number(lead.quote_total).toFixed(2)}</p>
          )}
          <Badge variant="outline" className="capitalize">
            {lead.status}
          </Badge>
        </CardContent>
      </Card>

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
                <Select name="vehicleClass" defaultValue={guessedClass ?? undefined} required>
                  <SelectTrigger id="vehicleClass" className="w-full">
                    <SelectValue placeholder="Confirm vehicle class" className="capitalize">
                      {(value: VehicleClass | null) => value}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_CLASSES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serviceAddress">Street address</Label>
                <Input id="serviceAddress" name="serviceAddress" required />
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="serviceCity">City</Label>
                  <Input id="serviceCity" name="serviceCity" required />
                </div>
                <div className="w-32 space-y-1.5">
                  <Label htmlFor="serviceZip">ZIP</Label>
                  <Input id="serviceZip" name="serviceZip" required />
                </div>
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
