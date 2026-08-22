import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type LeadStatus = Database['public']['Enums']['lead_status']

const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'converted', 'lost']

const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-gold/15 text-gold-ink',
  contacted: 'bg-sky-500/12 text-sky-700',
  converted: 'bg-emerald-500/10 text-emerald-600',
  lost: 'bg-muted text-muted-foreground',
}

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Contacts captured from incomplete quote flows.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={!status ? 'default' : 'outline'}
          size="sm"
          render={<Link href="/admin/leads" />}
        >
          All
        </Button>
        {STATUS_OPTIONS.map((s) => (
          <Button
            key={s}
            variant={status === s ? 'default' : 'outline'}
            size="sm"
            className="capitalize"
            render={<Link href={`/admin/leads?status=${s}`} />}
          >
            {s}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(leads ?? []).map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Link href={`/admin/leads/${lead.id}`} className="font-medium hover:underline">
                      {lead.full_name || lead.email || 'Unknown contact'}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.vehicle_make} {lead.vehicle_model}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {lead.quote_total ? formatPrice(Number(lead.quote_total)) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${LEAD_STATUS_STYLES[lead.status]}`}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(leads ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
