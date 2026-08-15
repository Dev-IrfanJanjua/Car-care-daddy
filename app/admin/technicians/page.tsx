import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createTechnician } from '@/lib/actions/admin/technicians'

export default async function AdminTechniciansPage() {
  const supabase = await createClient()
  const { data: technicians } = await supabase
    .from('technicians')
    .select('id, full_name, email, phone, status')
    .order('full_name')

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Technicians</h1>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
        {(technicians ?? []).map((t) => (
          <li key={t.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <Link href={`/admin/technicians/${t.id}`} className="font-medium hover:underline">
                {t.full_name}
              </Link>
              <p className="text-sm text-muted-foreground">{t.email ?? t.phone ?? '—'}</p>
            </div>
            <span className="text-sm capitalize text-muted-foreground">
              {t.status.replace('_', ' ')}
            </span>
          </li>
        ))}
        {(technicians ?? []).length === 0 && (
          <li className="px-4 py-3 text-sm text-muted-foreground">No technicians yet.</li>
        )}
      </ul>

      <form
        action={createTechnician}
        className="mt-8 space-y-3 rounded-lg border border-border p-4"
      >
        <h2 className="font-semibold">Add a technician</h2>
        <input
          name="fullName"
          placeholder="Full name"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone"
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 font-semibold text-brand-foreground"
        >
          Add technician
        </button>
      </form>
    </div>
  )
}
