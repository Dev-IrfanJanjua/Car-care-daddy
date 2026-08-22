import Link from 'next/link'
import { ArrowLeft, Car, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updateServicePrices } from '@/lib/actions/admin/settings'
import {
  createService,
  updateService,
  toggleServiceActive,
} from '@/lib/actions/admin/catalog'
import { VEHICLE_CLASSES } from '@/lib/vehicles/classes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function ServiceSettingsPage() {
  const supabase = await createClient()

  const [{ data: services }, { data: prices }] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, description, category, is_active, sort_order')
      .order('sort_order'),
    supabase.from('service_prices').select('service_id, vehicle_class, base_price'),
  ])

  const priceLookup = new Map(
    (prices ?? []).map((p) => [`${p.service_id}:${p.vehicle_class}`, Number(p.base_price)])
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
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
        <Button variant="outline" render={<Link href="/admin/settings/vehicles" />}>
          <Car className="size-4" />
          Vehicles
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Plus className="size-4 text-brand" />
            Add a service
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            A price row is created for all six vehicle classes at $0.00 — set the real prices in
            the matrix below, then activate it.
          </p>
        </CardHeader>
        <CardContent>
          <form action={createService} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-name">Name</Label>
              <Input id="new-name" name="name" required placeholder="Rock Chip Sealing" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-category">Category</Label>
              <Input id="new-category" name="category" placeholder="windshield" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                name="description"
                rows={2}
                placeholder="Shown to customers on the service picker."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-sort">Sort order</Label>
              <Input
                id="new-sort"
                name="sortOrder"
                type="number"
                defaultValue={(services?.length ?? 0) + 1}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit">Add service</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <p className="text-sm text-muted-foreground">
            Inactive services disappear from the customer quote flow but stay on past bookings.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {(services ?? []).map((s) => (
              <li key={s.id} className="px-6 py-4">
                <form
                  action={updateService.bind(null, s.id)}
                  className="grid gap-3 sm:grid-cols-[1fr_auto]"
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input name="name" defaultValue={s.name} aria-label="Name" required />
                    <Input
                      name="category"
                      defaultValue={s.category ?? ''}
                      aria-label="Category"
                      placeholder="Category"
                    />
                    <Input
                      name="sortOrder"
                      type="number"
                      defaultValue={s.sort_order}
                      aria-label="Sort order"
                      className="w-24"
                    />
                    <Textarea
                      name="description"
                      defaultValue={s.description ?? ''}
                      aria-label="Description"
                      rows={2}
                      placeholder="Description"
                      className="sm:col-span-3"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Button type="submit" size="sm" variant="outline">
                      Save
                    </Button>
                  </div>
                </form>

                <form action={toggleServiceActive.bind(null, s.id, !s.is_active)} className="mt-2">
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
            ))}
            {(services ?? []).length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-muted-foreground">
                No services yet.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing matrix</CardTitle>
          <p className="text-sm text-muted-foreground">
            Leave a cell blank to leave that price unchanged. A service with no price for a class
            is hidden from customers driving that class.
          </p>
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
                            min="0"
                            name={`price:${s.id}:${c}`}
                            defaultValue={priceLookup.get(`${s.id}:${c}`) ?? ''}
                            aria-label={`${s.name} ${c} price`}
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
