import { requireAdmin } from '@/lib/auth/require-admin'

/**
 * Admin check plus the super-admin flag. Used only by the team-management
 * actions; every other admin action keeps using requireAdmin().
 */
export async function requireSuperAdmin() {
  const ctx = await requireAdmin()
  const { data } = await ctx.supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', ctx.user.id)
    .single()

  if (!data?.is_super_admin) {
    throw new Error('Forbidden: super admin required')
  }
  return ctx
}

/** For pages/layouts: true when the signed-in user is a super admin. Never throws. */
export async function isSuperAdminUser(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  userId: string
) {
  try {
    const { data } = await supabase.from('profiles').select('is_super_admin').eq('id', userId).single()
    return data?.is_super_admin === true
  } catch {
    return false
  }
}
