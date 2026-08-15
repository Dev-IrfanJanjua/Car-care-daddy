import { createClient } from '@/lib/supabase/server'

// proxy.ts only does an optimistic session check; Server Actions must re-verify
// independently since they aren't guaranteed to run behind a proxy matcher.
// Every admin-only Server Action should call this first.
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: admin role required')
  }

  return { supabase, user }
}
