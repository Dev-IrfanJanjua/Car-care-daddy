import { createClient } from '@/lib/supabase/server'
import { updateServicePrices, toggleServiceActive } from '@/lib/actions/admin/settings'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']
const VEHICLE_CLASSES: VehicleClass[] = ['sedan', 'coupe', 'suv', 'van', 'truck', 'luxury']

export default async function ServiceSettingsPage() {
  const supabase = await createClient()

  const [{ data: services }, { data: prices }] = await Promise.all([
    supabase.from('services').select('id, name, is_active').order('sort_order'),
    supabase.from('service_prices').select('service_id, vehicle_class, base_price'),
  ])

  const priceLookup = new Map(
    (prices ?? []).map((p) => [`${p.service_id}:${p.vehicle_class}`, Number(p.base_price)])
  )

  return (
    <div>
      <h1 className="text-2xl font-bold">Service catalog &amp; pricing</h1>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
        {(services ?? []).map((s) => {
          const toggleAction = toggleServiceActive.bind(null, s.id, !s.is_active)
          return (
            <li key={s.id} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium">{s.name}</span>
              <form action={toggleAction}>
                <button
                  type="submit"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    s.is_active ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s.is_active ? 'Active' : 'Inactive'}
                </button>
              </form>
            </li>
          )
        })}
      </ul>

      <form
        action={updateServicePrices}
        className="mt-8 overflow-x-auto rounded-lg border border-border"
      >
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Service</th>
              {VEHICLE_CLASSES.map((c) => (
                <th key={c} className="px-4 py-3 capitalize">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(services ?? []).map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium">{s.name}</td>
                {VEHICLE_CLASSES.map((c) => (
                  <td key={c} className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      name={`price:${s.id}:${c}`}
                      defaultValue={priceLookup.get(`${s.id}:${c}`) ?? ''}
                      className="w-20 rounded-md border border-border bg-background px-2 py-1"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4">
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 font-semibold text-brand-foreground"
          >
            Save prices
          </button>
        </div>
      </form>
    </div>
  )
}
