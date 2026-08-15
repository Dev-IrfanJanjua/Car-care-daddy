import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { convertLeadToBooking } from '@/lib/actions/admin/leads'
import type { Database } from '@/lib/types/database.types'

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
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">{lead.full_name || lead.email || 'Unknown contact'}</h1>
      <p className="text-muted-foreground">
        {lead.email} {lead.phone && `· ${lead.phone}`}
      </p>

      <div className="mt-6 rounded-lg border border-border p-4 text-sm">
        <p>
          {lead.vehicle_year} {lead.vehicle_make} {lead.vehicle_model}
        </p>
        {lead.quote_total !== null && (
          <p className="mt-1">Quoted total: ${Number(lead.quote_total).toFixed(2)}</p>
        )}
        <p className="mt-1 capitalize text-muted-foreground">Status: {lead.status}</p>
      </div>

      {canConvert ? (
        <form
          action={convertAction}
          className="mt-6 space-y-3 rounded-lg border border-border p-4"
        >
          <h2 className="font-semibold">Convert to booking</h2>
          <input
            name="customerName"
            placeholder="Full name"
            defaultValue={lead.full_name ?? ''}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          <input
            name="customerEmail"
            type="email"
            placeholder="Email"
            defaultValue={lead.email ?? ''}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          <input
            name="customerPhone"
            type="tel"
            placeholder="Phone"
            defaultValue={lead.phone ?? ''}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          <select
            name="vehicleClass"
            defaultValue={guessedClass ?? ''}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          >
            <option value="" disabled>
              Confirm vehicle class
            </option>
            {VEHICLE_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            name="serviceAddress"
            placeholder="Street address"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          <div className="flex gap-3">
            <input
              name="serviceCity"
              placeholder="City"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            />
            <input
              name="serviceZip"
              placeholder="ZIP"
              required
              className="w-32 rounded-md border border-border bg-background px-3 py-2"
            />
          </div>
          <input
            name="scheduledAt"
            type="datetime-local"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-brand px-4 py-2.5 font-semibold text-brand-foreground"
          >
            Create booking
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          {lead.status === 'converted'
            ? 'This lead has already been converted.'
            : "This lead has no service selections captured, so it can't be auto-converted."}
        </p>
      )}
    </div>
  )
}
