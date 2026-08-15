import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database.types'

type LeadStatus = Database['public']['Enums']['lead_status']

const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'converted', 'lost']

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('leads')
    .select(
      'id, full_name, email, phone, vehicle_make, vehicle_model, quote_total, status, created_at'
    )
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status as LeadStatus)
  }

  const { data: leads } = await query

  return (
    <div>
      <h1 className="text-2xl font-bold">Leads</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/leads"
          className={`rounded-full px-3 py-1 text-sm ${!status ? 'bg-brand text-brand-foreground' : 'border border-border'}`}
        >
          All
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/leads?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm capitalize ${status === s ? 'bg-brand text-brand-foreground' : 'border border-border'}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
        {(leads ?? []).map((lead) => (
          <li key={lead.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <Link href={`/admin/leads/${lead.id}`} className="font-medium hover:underline">
                {lead.full_name || lead.email || 'Unknown contact'}
              </Link>
              <p className="text-sm text-muted-foreground">
                {lead.vehicle_make} {lead.vehicle_model}
                {lead.quote_total ? ` · $${Number(lead.quote_total).toFixed(2)}` : ''}
              </p>
            </div>
            <span className="text-sm capitalize text-muted-foreground">{lead.status}</span>
          </li>
        ))}
        {(leads ?? []).length === 0 && (
          <li className="px-4 py-3 text-sm text-muted-foreground">No leads found.</li>
        )}
      </ul>
    </div>
  )
}
