import { redirect } from 'next/navigation'

// "Car not listed" is handled on /quote itself (pick a car type there).
export default async function NotListedRedirect({ searchParams }: { searchParams: Promise<{ services?: string; bundle?: string; type?: string }> }) {
  const { services, bundle, type } = await searchParams
  const q = new URLSearchParams()
  if (services) q.set('services', services)
  if (bundle) q.set('bundle', bundle)
  if (type) q.set('class', type)
  redirect(`/quote${q.size ? `?${q}` : ''}`)
}
