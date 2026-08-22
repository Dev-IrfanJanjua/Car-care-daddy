import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updatePartner, togglePartnerActive } from '@/lib/actions/admin/partners'
import type { Database } from '@/lib/types/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

type PartnerType = Database['public']['Enums']['partner_type']
const PARTNER_TYPES: PartnerType[] = ['insurance', 'dealership', 'fleet', 'referral']

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: partner } = await supabase.from('partners').select('*').eq('id', id).single()
  if (!partner) notFound()

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link
          href="/admin/partners"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to partners
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{partner.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePartner.bind(null, id)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Partner name</Label>
              <Input id="name" name="name" defaultValue={partner.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue={partner.type}
                className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm capitalize"
              >
                {PARTNER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Contact name</Label>
              <Input
                id="contactName"
                name="contactName"
                defaultValue={partner.contact_name ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={partner.contact_email ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Contact phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                defaultValue={partner.contact_phone ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commissionRate">Commission rate (%)</Label>
              <Input
                id="commissionRate"
                name="commissionRate"
                type="number"
                step="0.01"
                min="0"
                defaultValue={partner.commission_rate ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} defaultValue={partner.notes ?? ''} />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={togglePartnerActive.bind(null, id, !partner.is_active)}>
            <Button
              type="submit"
              variant="outline"
              className={partner.is_active ? undefined : 'text-muted-foreground'}
            >
              {partner.is_active ? 'Deactivate partner' : 'Reactivate partner'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
