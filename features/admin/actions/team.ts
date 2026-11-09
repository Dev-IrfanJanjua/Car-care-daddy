'use server'

import { revalidatePath } from 'next/cache'
import { requireSuperAdmin } from '@/lib/auth/require-super-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export type TeamMember = {
  id: string
  email: string
  name: string
  isSuperAdmin: boolean
  lastSignIn: string | null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function checkPassword(password: string) {
  if (password.length < 10) throw new Error('Use a password of at least 10 characters.')
}

async function superAdminCount() {
  const { count } = await createAdminClient()
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
    .eq('is_super_admin', true)
  return count ?? 0
}

/** Admins and super admins, with their login emails. */
export async function listTeam(): Promise<TeamMember[]> {
  await requireSuperAdmin()
  const admin = createAdminClient()

  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, full_name, is_super_admin')
    .eq('role', 'admin')
  if (error) throw new Error(error.message)

  const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const byId = new Map((users?.users ?? []).map((u) => [u.id, u]))

  return (profiles ?? [])
    .map((p) => ({
      id: p.id,
      email: byId.get(p.id)?.email ?? '',
      name: p.full_name ?? '',
      isSuperAdmin: p.is_super_admin,
      lastSignIn: byId.get(p.id)?.last_sign_in_at ?? null,
    }))
    .sort((a, b) => Number(b.isSuperAdmin) - Number(a.isSuperAdmin) || a.email.localeCompare(b.email))
}

/**
 * Creates a login (or promotes an existing account) and gives it the admin
 * role. The password is a temporary one the super admin hands over.
 */
export async function addTeamMember(input: { email: string; fullName: string; password: string; superAdmin: boolean }) {
  await requireSuperAdmin()
  const email = input.email.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) throw new Error('Enter a valid email address.')
  checkPassword(input.password)

  const admin = createAdminClient()
  let userId: string | null = null
  let existing = false

  const created = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName.trim() },
  })

  if (created.error) {
    // Already has an account (e.g. a past customer): promote it, keep its password.
    const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const found = users?.users.find((u) => u.email?.toLowerCase() === email)
    if (!found) throw new Error(created.error.message)
    userId = found.id
    existing = true
  } else {
    userId = created.data.user.id
  }

  const { data, error } = await admin
    .from('profiles')
    .update({
      role: 'admin',
      is_super_admin: input.superAdmin,
      ...(input.fullName.trim() ? { full_name: input.fullName.trim() } : {}),
    })
    .eq('id', userId)
    .select('id')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('The account was created but its profile row is missing.')

  revalidatePath('/admin/team')
  return { existing }
}

export type MemberRole = 'super_admin' | 'admin' | 'customer'

/** Sets someone's role. 'customer' removes admin access (the login stays). */
export async function setMemberRole(memberId: string, role: MemberRole) {
  const { user } = await requireSuperAdmin()
  if (!['super_admin', 'admin', 'customer'].includes(role)) throw new Error('Unknown role.')
  if (memberId === user.id) throw new Error('You cannot change your own role.')

  const admin = createAdminClient()
  const { data: target } = await admin.from('profiles').select('role, is_super_admin').eq('id', memberId).single()
  if (!target) throw new Error('Member not found.')

  const losingSuper = target.is_super_admin && role !== 'super_admin'
  if (losingSuper && (await superAdminCount()) <= 1) throw new Error('There must be at least one super admin.')

  const { error } = await admin
    .from('profiles')
    .update({
      role: role === 'customer' ? 'customer' : 'admin',
      is_super_admin: role === 'super_admin',
    })
    .eq('id', memberId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/team')
}

/** Takes admin access away. The login itself stays (as a normal customer account). */
export async function removeMemberAccess(memberId: string) {
  const { user } = await requireSuperAdmin()
  if (memberId === user.id) throw new Error('You cannot remove your own access.')

  const admin = createAdminClient()
  const { data: target } = await admin.from('profiles').select('is_super_admin').eq('id', memberId).single()
  if (target?.is_super_admin && (await superAdminCount()) <= 1) {
    throw new Error('There must be at least one super admin.')
  }

  const { error } = await admin.from('profiles').update({ role: 'customer', is_super_admin: false }).eq('id', memberId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/team')
}

export async function resetMemberPassword(memberId: string, password: string) {
  await requireSuperAdmin()
  checkPassword(password)
  const { error } = await createAdminClient().auth.admin.updateUserById(memberId, { password })
  if (error) throw new Error(error.message)
}
