import { createClient } from '@/lib/supabase/server'
import { BundleEditor } from '@/features/admin'

export const metadata = { title: 'Bundles' }

export default async function AdminBundlesPage() {
  const supabase = await createClient()
  const [{ data: bundles }, { data: services }, { data: prices }] = await Promise.all([
    supabase.from('bundles').select('*').order('sort_order'),
    supabase.from('services').select('id, name, coming_soon, exclusive_group').eq('is_active', true).order('sort_order'),
    supabase.from('service_prices').select('service_id, vehicle_class, base_price'),
  ])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Bundles</h1>
        <p className="text-sm text-muted-foreground">
          Services sold together at a percentage off. Prices come from the services themselves, so a price change updates every bundle.
        </p>
      </div>
      <BundleEditor
        bundles={(bundles ?? []).map((b) => ({
          id: b.id,
          name: b.name,
          badge: b.badge ?? '',
          description: b.description ?? '',
          discountPercent: b.discount_percent,
          serviceIds: b.service_ids ?? [],
          isActive: b.is_active,
        }))}
        services={(services ?? []).map((s) => ({ id: s.id, name: s.name, comingSoon: s.coming_soon, exclusiveGroup: s.exclusive_group }))}
        prices={(prices ?? []).map((p) => ({ service_id: p.service_id, vehicle_class: p.vehicle_class, base_price: Number(p.base_price) }))}
      />
    </div>
  )
}
