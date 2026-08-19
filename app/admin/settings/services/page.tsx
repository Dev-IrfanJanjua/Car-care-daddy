import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updateServicePrices, toggleServiceActive } from '@/lib/actions/admin/settings'
import type { Database } from '@/lib/types/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to settings
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Service catalog &amp; pricing</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {(services ?? []).map((s) => {
              const toggleAction = toggleServiceActive.bind(null, s.id, !s.is_active)
              return (
                <li key={s.id} className="flex items-center justify-between px-6 py-3">
                  <span className="font-medium">{s.name}</span>
                  <form action={toggleAction}>
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className={
                        s.is_active
                          ? 'bg-brand/10 text-brand hover:bg-brand/20'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {s.is_active ? 'Active' : 'Inactive'}
                    </Button>
                  </form>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form action={updateServicePrices}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    {VEHICLE_CLASSES.map((c) => (
                      <TableHead key={c} className="capitalize">
                        {c}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(services ?? []).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      {VEHICLE_CLASSES.map((c) => (
                        <TableCell key={c}>
                          <Input
                            type="number"
                            step="0.01"
                            name={`price:${s.id}:${c}`}
                            defaultValue={priceLookup.get(`${s.id}:${c}`) ?? ''}
                            className="w-20"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-6 pt-4">
              <Button type="submit">Save prices</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
