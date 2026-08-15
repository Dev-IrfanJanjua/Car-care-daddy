import { createClient } from '@/lib/supabase/server'
import { createPartner, togglePartnerActive } from '@/lib/actions/admin/partners'
import type { Database } from '@/lib/types/database.types'

type PartnerType = Database['public']['Enums']['partner_type']
const PARTNER_TYPES: PartnerType[] = ['insurance', 'dealership', 'fleet', 'referral']

export default async function AdminPartnersPage() {
  const supabase = await createClient()
  const { data: partners } = await supabase
    .from('partners')
    .select('id, name, type, contact_email, is_active')
    .order('name')

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Partners</h1>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
        {(partners ?? []).map((p) => {
          const toggleAction = togglePartnerActive.bind(null, p.id, !p.is_active)
          return (
            <li key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm capitalize text-muted-foreground">
                  {p.type} {p.contact_email && `· ${p.contact_email}`}
                </p>
              </div>
              <form action={toggleAction}>
                <button
                  type="submit"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    p.is_active ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {p.is_active ? 'Active' : 'Inactive'}
                </button>
              </form>
            </li>
          )
        })}
        {(partners ?? []).length === 0 && (
          <li className="px-4 py-3 text-sm text-muted-foreground">No partners yet.</li>
        )}
      </ul>

      <form action={createPartner} className="mt-8 space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-semibold">Add a partner</h2>
        <input
          name="name"
          placeholder="Partner name"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <select
          name="type"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        >
          {PARTNER_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          name="contactName"
          placeholder="Contact name"
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <input
          name="contactEmail"
          type="email"
          placeholder="Contact email"
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <input
          name="contactPhone"
          type="tel"
          placeholder="Contact phone"
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <input
          name="commissionRate"
          type="number"
          step="0.01"
          placeholder="Commission rate (%)"
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 font-semibold text-brand-foreground"
        >
          Add partner
        </button>
      </form>
    </div>
  )
}
