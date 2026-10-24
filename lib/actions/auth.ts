'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, RateLimitError } from '@/lib/security/rate-limit'
import { safeRedirectPath } from '@/lib/security/validate'

export type SignInState = { error: string | null }

export async function signIn(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') || '').trim().slice(0, 120)
  const password = String(formData.get('password') || '').slice(0, 200)
  // Only same-site paths: an attacker-supplied ?redirectTo=https://evil.example
  // must not be able to bounce a freshly signed-in admin off-site.
  const redirectTo = safeRedirectPath(String(formData.get('redirectTo') || '/admin'))

  try {
    // Brute-force guard: 8 attempts per 15 minutes per connection, and per account.
    await rateLimit('signin', { max: 8, windowSeconds: 900, extra: email.toLowerCase(), extraMax: 8 })
  } catch (e) {
    if (e instanceof RateLimitError) return { error: 'Too many sign-in attempts. Try again in 15 minutes.' }
    throw e
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // One generic message: never reveal whether the email exists.
    return { error: 'Incorrect email or password.' }
  }

  redirect(redirectTo)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
