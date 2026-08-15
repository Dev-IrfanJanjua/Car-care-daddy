import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

// Server-only. Bypasses RLS -- never import this from a Client Component.
// Used by Server Actions that need to write guest-originated rows (leads, quotes,
// bookings) with server-recomputed pricing, where the caller has no Supabase session.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
