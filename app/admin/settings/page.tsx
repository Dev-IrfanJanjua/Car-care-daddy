import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { updateBusinessSettings } from '@/lib/actions/admin/settings'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('business_settings')
    .select('*')
    .eq('id', true)
    .single()

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <form
        action={updateBusinessSettings}
        className="mt-6 space-y-3 rounded-lg border border-border p-4"
      >
        <h2 className="font-semibold">Business info</h2>
        <input
          name="businessName"
          placeholder="Business name"
          defaultValue={settings?.business_name ?? ''}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <input
          name="contactEmail"
          type="email"
          placeholder="Contact email"
          defaultValue={settings?.contact_email ?? ''}
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <input
          name="contactPhone"
          type="tel"
          placeholder="Contact phone"
          defaultValue={settings?.contact_phone ?? ''}
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 font-semibold text-brand-foreground"
        >
          Save
        </button>
      </form>

      <Link
        href="/admin/settings/services"
        className="mt-4 inline-block text-sm text-brand hover:underline"
      >
        Manage service catalog &amp; pricing →
      </Link>
    </div>
  )
}
