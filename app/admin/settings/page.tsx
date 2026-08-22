import Link from 'next/link'
import { Car, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  updateBusinessSettings,
  updateBusinessHours,
  updateServiceArea,
} from '@/lib/actions/admin/settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// hours / service_area are schemaless jsonb, so read them defensively rather
// than trusting the seeded shape.
function readString(value: unknown, key: string) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const found = (value as Record<string, unknown>)[key]
    if (typeof found === 'string') return found
    if (typeof found === 'number') return String(found)
  }
  return ''
}

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('business_settings')
    .select('*')
    .eq('id', true)
    .single()

  const hours = settings?.hours
  const serviceArea = settings?.service_area

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Business info, hours, and service area.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business info</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateBusinessSettings} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                name="businessName"
                defaultValue={settings?.business_name ?? ''}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={settings?.contact_email ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Contact phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                defaultValue={settings?.contact_phone ?? ''}
              />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business hours</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateBusinessHours} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="monFri">Monday &ndash; Friday</Label>
              <Input
                id="monFri"
                name="monFri"
                defaultValue={readString(hours, 'mon_fri')}
                placeholder="8:00 AM - 6:00 PM"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sat">Saturday</Label>
              <Input
                id="sat"
                name="sat"
                defaultValue={readString(hours, 'sat')}
                placeholder="9:00 AM - 3:00 PM"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sun">Sunday</Label>
              <Input
                id="sun"
                name="sun"
                defaultValue={readString(hours, 'sun')}
                placeholder="Closed"
              />
            </div>
            <Button type="submit">Save hours</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service area</CardTitle>
          <p className="text-sm text-muted-foreground">
            Recorded for reference only — bookings are not yet validated against this.
          </p>
        </CardHeader>
        <CardContent>
          <form action={updateServiceArea} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="centerZip">Center ZIP</Label>
              <Input
                id="centerZip"
                name="centerZip"
                defaultValue={readString(serviceArea, 'center_zip')}
                placeholder="90210"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="radiusMiles">Radius (miles)</Label>
              <Input
                id="radiusMiles"
                name="radiusMiles"
                type="number"
                min={1}
                defaultValue={readString(serviceArea, 'radius_miles') || '25'}
              />
            </div>
            <Button type="submit">Save service area</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" render={<Link href="/admin/settings/services" />}>
          <Wrench className="size-4" />
          Services &amp; pricing
        </Button>
        <Button variant="outline" render={<Link href="/admin/settings/vehicles" />}>
          <Car className="size-4" />
          Vehicle catalog
        </Button>
      </div>
    </div>
  )
}
