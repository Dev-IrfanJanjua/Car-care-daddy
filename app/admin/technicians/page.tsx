import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createTechnician } from '@/lib/actions/admin/technicians'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const TECHNICIAN_STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600',
  inactive: 'bg-muted text-muted-foreground',
  on_leave: 'bg-amber-500/10 text-amber-600',
}

export default async function AdminTechniciansPage() {
  const supabase = await createClient()
  const { data: technicians } = await supabase
    .from('technicians')
    .select('id, full_name, email, phone, status')
    .order('full_name')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Technicians</h1>
        <p className="text-sm text-muted-foreground">Your mobile repair team.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {(technicians ?? []).map((t) => (
              <li key={t.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <Link
                    href={`/admin/technicians/${t.id}`}
                    className="font-medium hover:underline"
                  >
                    {t.full_name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{t.email ?? t.phone ?? '—'}</p>
                </div>
                <Badge variant="outline" className={`capitalize ${TECHNICIAN_STATUS_STYLES[t.status]}`}>
                  {t.status.replace('_', ' ')}
                </Badge>
              </li>
            ))}
            {(technicians ?? []).length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-muted-foreground">
                No technicians yet.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a technician</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTechnician} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
            <Button type="submit">Add technician</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
