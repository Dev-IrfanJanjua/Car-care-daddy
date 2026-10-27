'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { BUNDLES_TAG } from '@/features/bundles'
import { isUuid } from '@/lib/security/validate'

export type BundleInput = {
  id?: string
  name: string
  badge: string
  description: string
  discountPercent: number
  serviceIds: string[]
  isActive: boolean
}

function slugify(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function refresh() {
  updateTag(BUNDLES_TAG)
  revalidatePath('/')
  revalidatePath('/services')
  revalidatePath('/admin/bundles')
}

/** Create or update a bundle. Called only from the editor's Save button. */
export async function saveBundle(input: BundleInput) {
  const { supabase } = await requireAdmin()

  const name = input.name.trim().slice(0, 80)
  if (!name) throw new Error('Give the bundle a name')
  const percent = Math.round(Number(input.discountPercent))
  if (!Number.isFinite(percent) || percent < 0 || percent > 60) throw new Error('Discount must be between 0 and 60%')
  const ids = Array.from(new Set(input.serviceIds))
  if (ids.length < 2 || !ids.every(isUuid)) throw new Error('Pick at least two services for a bundle')

  // Glass services overlap (windshield is inside front & back, doors and full
  // glass), so a bundle may hold only one service per exclusive group.
  const { data: picked, error: pickedError } = await supabase.from('services').select('name, exclusive_group').in('id', ids)
  if (pickedError) throw pickedError
  const seen = new Map<string, string>()
  for (const s of picked ?? []) {
    if (!s.exclusive_group) continue
    const other = seen.get(s.exclusive_group)
    if (other) throw new Error(`“${other}” and “${s.name}” overlap — a bundle can include only one of them.`)
    seen.set(s.exclusive_group, s.name)
  }

  const row = {
    name,
    badge: input.badge.trim().slice(0, 30) || null,
    description: input.description.trim().slice(0, 300) || null,
    discount_percent: percent,
    service_ids: ids,
    is_active: input.isActive,
  }

  if (input.id) {
    if (!isUuid(input.id)) throw new Error('Unknown bundle')
    const { error } = await supabase.from('bundles').update(row).eq('id', input.id)
    if (error) throw error
  } else {
    const { count } = await supabase.from('bundles').select('id', { count: 'exact', head: true })
    const slug = `${slugify(name) || 'bundle'}-${Math.random().toString(36).slice(2, 6)}`
    const { error } = await supabase.from('bundles').insert({ ...row, slug, sort_order: (count ?? 0) + 1 })
    if (error) throw error
  }
  refresh()
}

export async function deleteBundle(id: string) {
  const { supabase } = await requireAdmin()
  if (!isUuid(id)) throw new Error('Unknown bundle')
  const { error } = await supabase.from('bundles').delete().eq('id', id)
  if (error) throw error
  refresh()
}
