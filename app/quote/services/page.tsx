import { redirect } from 'next/navigation'

// The separate services step is part of /quote now; old links keep working.
export default async function ServicesStepRedirect({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(await searchParams)) if (v) q.set(k, v)
  redirect(`/quote${q.size ? `?${q}` : ''}`)
}
