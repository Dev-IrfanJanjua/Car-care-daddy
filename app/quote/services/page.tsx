import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ServiceSelector } from './service-selector'
import type { Database } from '@/lib/types/database.types'
import { QuoteShell } from '@/components/quote/quote-shell'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export default async function ServicesStepPage({
  searchParams,
}: {
  searchParams: Promise<{
    make?: string
    model?: string
    year?: string
    class?: string
    services?: string
  }>
}) {
  const { make, model, year, class: vehicleClass, services: preselected } = await searchParams

  if (!make || !model || !year || !vehicleClass) {
    redirect('/quote')
  }

  const supabase = await createClient()
  const [{ data: services }, { data: prices }] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, description, category, sort_order')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('service_prices')
      .select('service_id, base_price')
      .eq('vehicle_class', vehicleClass as VehicleClass),
  ])

  const priceByService = new Map((prices ?? []).map((p) => [p.service_id, Number(p.base_price)]))
  const servicesWithPrice = (services ?? [])
    .filter((s) => priceByService.has(s.id))
    .map((s) => ({ ...s, price: priceByService.get(s.id)! }))

  const vehicleQuery = new URLSearchParams({ make, model, year, class: vehicleClass }).toString()

  return (
    <QuoteShell
      step={2}
      backHref={`/quote?${vehicleQuery}`}
      hrefs={[`/quote?${vehicleQuery}`]}
      title="Select your services"
      description={`${year} ${make} ${model}`}
    >
      <ServiceSelector
        services={servicesWithPrice}
        vehicleParams={{ make, model, year, class: vehicleClass }}
        initialSelectedIds={preselected ? preselected.split(',').filter(Boolean) : []}
      />
    </QuoteShell>
  )
}
