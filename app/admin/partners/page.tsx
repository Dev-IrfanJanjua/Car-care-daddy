import { createClient } from '@/lib/supabase/server'
import { createPartner, togglePartnerActive } from '@/lib/actions/admin/partners'
import type { Database } from '@/lib/types/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type PartnerType = Database['public']['Enums']['partner_type']
const PARTNER_TYPES: PartnerType[] = ['insurance', 'dealership', 'fleet', 'referral']

export default async function AdminPartnersPage() {
  const supabase = await createClient()
  const { data: partners } = await supabase
    .from('partners')
    .select('id, name, type, contact_email, is_active')
    .order('name')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Partners</h1>
        <p className="text-sm text-muted-foreground">
          Insurance, dealership, fleet, and referral relationships.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {(partners ?? []).map((p) => {
              const toggleAction = togglePartnerActive.bind(null, p.id, !p.is_active)
              return (
                <li key={p.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm capitalize text-muted-foreground">
                      {p.type} {p.contact_email && `· ${p.contact_email}`}
                    </p>
                  </div>
                  <form action={toggleAction}>
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className={
                        p.is_active
                          ? 'bg-brand/10 text-brand hover:bg-brand/20'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Button>
                  </form>
                </li>
              )
            })}
            {(partners ?? []).length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-muted-foreground">
                No partners yet.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a partner</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPartner} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Partner name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue={PARTNER_TYPES[0]}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue className="capitalize">
                    {(value: PartnerType | null) => value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PARTNER_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Contact name</Label>
              <Input id="contactName" name="contactName" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input id="contactEmail" name="contactEmail" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Contact phone</Label>
              <Input id="contactPhone" name="contactPhone" type="tel" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commissionRate">Commission rate (%)</Label>
              <Input id="commissionRate" name="commissionRate" type="number" step="0.01" />
            </div>
            <Button type="submit">Add partner</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
