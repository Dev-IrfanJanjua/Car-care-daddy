import Link from 'next/link'
import { ArrowLeft, Plus, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  createVehicleMake,
  createVehicleModel,
  updateVehicleModelClass,
} from '@/lib/actions/admin/catalog'
import { VEHICLE_CLASSES } from '@/lib/vehicles/classes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default async function VehicleSettingsPage() {
  const supabase = await createClient()

  const [{ data: makes }, { data: models }] = await Promise.all([
    supabase.from('vehicle_makes').select('id, name').order('name'),
    supabase.from('vehicle_models').select('id, make_id, name, vehicle_class').order('name'),
  ])

  const modelsByMake = new Map<string, typeof models>()
  for (const model of models ?? []) {
    const list = modelsByMake.get(model.make_id) ?? []
    list.push(model)
    modelsByMake.set(model.make_id, list)
  }

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
          <h1 className="mt-2 text-2xl font-bold">Vehicle catalog</h1>
          <p className="text-sm text-muted-foreground">
            A car must be listed here before a customer can get an instant quote. The vehicle class
            determines the price for every service.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/admin/settings/services" />}>
          <Wrench className="size-4" />
          Services
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Plus className="size-4 text-brand" />
              Add a car brand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createVehicleMake} className="flex gap-2">
              <Input name="name" required placeholder="Subaru" aria-label="Car brand name" />
              <Button type="submit">Add</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Plus className="size-4 text-brand" />
              Add a model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createVehicleModel} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="makeId">Car Brand</Label>
                <select
                  id="makeId"
                  name="makeId"
                  required
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
                >
                  <option value="">Select a car brand…</option>
                  {(makes ?? []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modelName">Model</Label>
                <Input id="modelName" name="name" required placeholder="Outback" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vehicleClass">Vehicle class (sets the price tier)</Label>
                <select
                  id="vehicleClass"
                  name="vehicleClass"
                  required
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm capitalize"
                >
                  {VEHICLE_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit">Add model</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {(makes ?? []).map((make) => {
          const makeModels = modelsByMake.get(make.id) ?? []
          return (
            <Card key={make.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {make.name}
                  <Badge variant="outline" className="text-muted-foreground">
                    {makeModels.length} model{makeModels.length === 1 ? '' : 's'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {makeModels.map((model) => (
                    <li
                      key={model.id}
                      className="flex items-center justify-between gap-3 px-6 py-2.5"
                    >
                      <span className="font-medium">{model.name}</span>
                      <form
                        action={updateVehicleModelClass.bind(null, model.id)}
                        className="flex items-center gap-2"
                      >
                        <select
                          name="vehicleClass"
                          defaultValue={model.vehicle_class}
                          aria-label={`${model.name} vehicle class`}
                          className="h-8 rounded-lg border border-border bg-background px-2 text-sm capitalize"
                        >
                          {VEHICLE_CLASSES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" size="sm" variant="ghost">
                          Save
                        </Button>
                      </form>
                    </li>
                  ))}
                  {makeModels.length === 0 && (
                    <li className="px-6 py-4 text-sm text-muted-foreground">
                      No models yet — customers can&apos;t quote this brand.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )
        })}
        {(makes ?? []).length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No car brands yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
