import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ServiceSelector } from './service-selector'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export default async function ServicesStepPage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; model?: string; year?: string; class?: string }>
}) {
  const { make, model, year, class: vehicleClass } = await searchParams

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

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold">Select your services</h1>
      <p className="mt-2 text-muted-foreground">
        {year} {make} {model}
      </p>
      <ServiceSelector
        services={servicesWithPrice}
        vehicleParams={{ make, model, year, class: vehicleClass }}
      />
    </main>
  )
}
