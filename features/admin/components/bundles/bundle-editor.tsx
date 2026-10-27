'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice } from '@/lib/format'
import { applyDiscount, sumFor } from '@/features/bundles'
import { VEHICLE_CLASSES, vehicleClassLabel } from '@/lib/vehicles/classes'
import { deleteBundle, saveBundle, type BundleInput } from '../../actions/bundles'

export type EditorService = { id: string; name: string; comingSoon: boolean; exclusiveGroup: string | null }
export type EditorPrice = { service_id: string; vehicle_class: string; base_price: number }
export type EditorBundle = BundleInput & { id: string }

const EMPTY: BundleInput = { name: '', badge: '', description: '', discountPercent: 10, serviceIds: [], isActive: true }

/** What the customer will see for this draft, worked out the same way the site does. */
function Preview({ draft, services, prices }: { draft: BundleInput; services: EditorService[]; prices: EditorPrice[] }) {
  const parts = services.filter((s) => draft.serviceIds.includes(s.id))
  const soon = parts.some((s) => s.comingSoon)
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Preview</p>
      <div className="rounded-lg border border-border bg-card p-4">
        {draft.badge && <span className="mb-2 inline-block rounded-full bg-gold-500 px-2.5 py-0.5 text-[10px] font-bold text-gold-foreground uppercase">{draft.badge}</span>}
        <h4 className="font-display text-lg font-semibold">{draft.name || 'Bundle name'}</h4>
        {draft.description && <p className="mt-1 text-sm text-muted-foreground">{draft.description}</p>}
        <ul className="my-3 space-y-1 text-sm">
          {parts.map((s) => (
            <li key={s.id} className="flex gap-2">
              <Check className="mt-0.5 size-3.5 text-gold-ink" /> {s.name}
              {s.comingSoon && <span className="text-xs text-muted-foreground">(coming soon)</span>}
            </li>
          ))}
        </ul>
        {soon ? (
          <p className="text-sm text-muted-foreground">Shows as “Coming soon” until every service is on sale.</p>
        ) : parts.length >= 2 ? (
          <table className="w-full text-sm">
            <tbody>
              {VEHICLE_CLASSES.map((c) => {
                const full = sumFor(draft.serviceIds, c, prices)
                return (
                  <tr key={c} className="border-t border-border">
                    <td className="py-1 text-muted-foreground">{vehicleClassLabel(c)}</td>
                    <td className="py-1 text-right">
                      {full == null ? '—' : (
                        <>
                          {draft.discountPercent > 0 && <s className="mr-2 text-muted-foreground">{formatPrice(full)}</s>}
                          <b>{formatPrice(applyDiscount(full, draft.discountPercent))}</b>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground">Pick at least two services to see prices.</p>
        )}
      </div>
    </div>
  )
}

function Editor({ initial, services, prices, onDone }: { initial: BundleInput; services: EditorService[]; prices: EditorPrice[]; onDone?: () => void }) {
  const router = useRouter()
  const [draft, setDraft] = useState<BundleInput>(initial)
  const [pending, start] = useTransition()
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial)

  function toggle(id: string) {
    setDraft((d) => ({ ...d, serviceIds: d.serviceIds.includes(id) ? d.serviceIds.filter((x) => x !== id) : [...d.serviceIds, id] }))
  }

  function run(fn: () => Promise<void>, ok: string, after?: () => void) {
    start(async () => {
      try {
        await fn()
        toast.success(ok)
        after?.()
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={draft.name} maxLength={80} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Badge (optional)</Label>
            <Input value={draft.badge} maxLength={30} placeholder="Best value" onChange={(e) => setDraft({ ...draft, badge: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={draft.description} maxLength={300} rows={3} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Discount % (0–60)</Label>
          <Input type="number" min={0} max={60} value={draft.discountPercent} onChange={(e) => setDraft({ ...draft, discountPercent: Number(e.target.value) })} className="max-w-32" />
        </div>
        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium">Services in this bundle</legend>
          <p className="text-xs text-muted-foreground">
            Glass services overlap (windshield is already part of the front &amp; back, doors and full-glass options), so a bundle can include only one of them.
            Pick one glass service, then add headlights or any other service.
          </p>
          {services.map((s) => {
            const on = draft.serviceIds.includes(s.id)
            const blocker = !on && s.exclusiveGroup ? services.find((o) => o.id !== s.id && o.exclusiveGroup === s.exclusiveGroup && draft.serviceIds.includes(o.id)) : undefined
            return (
              <label key={s.id} className={`flex items-center gap-2 text-sm ${blocker ? 'opacity-50' : ''}`}>
                <input type="checkbox" checked={on} disabled={!!blocker} onChange={() => toggle(s.id)} className="size-4 accent-[var(--brand)]" />
                {s.name}
                {s.comingSoon && <span className="text-xs text-muted-foreground">(coming soon)</span>}
                {blocker && <span className="text-xs text-muted-foreground">(overlaps with {blocker.name})</span>}
              </label>
            )
          })}
        </fieldset>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} className="size-4 accent-[var(--brand)]" />
          Shown on the website
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={pending || !dirty} onClick={() => run(() => saveBundle(draft), 'Bundle saved', onDone)}>
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
          {initial.id && (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                if (window.confirm(`Delete the “${initial.name}” bundle?`)) run(() => deleteBundle(initial.id!), 'Bundle deleted')
              }}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">The preview shows what customers will see. Nothing changes on the site until you press Save.</p>
      </div>
      <Preview draft={draft} services={services} prices={prices} />
    </div>
  )
}

export function BundleEditor({ bundles, services, prices }: { bundles: EditorBundle[]; services: EditorService[]; prices: EditorPrice[] }) {
  const [adding, setAdding] = useState(false)
  return (
    <div className="space-y-6">
      {bundles.map((b) => (
        <Card key={b.id}>
          <CardHeader>
            <CardTitle>
              {b.name} {!b.isActive && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Hidden</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Editor initial={b} services={services} prices={prices} />
          </CardContent>
        </Card>
      ))}
      {adding ? (
        <Card>
          <CardHeader>
            <CardTitle>New bundle</CardTitle>
          </CardHeader>
          <CardContent>
            <Editor initial={EMPTY} services={services} prices={prices} onDone={() => setAdding(false)} />
          </CardContent>
        </Card>
      ) : (
        <Button type="button" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Add a bundle
        </Button>
      )}
    </div>
  )
}
