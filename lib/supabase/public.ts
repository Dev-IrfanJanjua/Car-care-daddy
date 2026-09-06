import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

// Cookie-free client for public, cacheable reads (the service and vehicle
// catalogs).
//
// lib/supabase/server.ts cannot be used inside unstable_cache: it reads
// cookies, and touching cookies inside a cached function is both an error and
// the opposite of the point -- a per-visitor input would give every visitor
// their own cache entry. Nothing read through this client is visitor-specific,
// and it uses the anon key, so RLS still applies.
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
