import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const steps = [
  { title: 'Tell us about your vehicle', description: 'Make, model, and year — takes ten seconds.' },
  { title: 'Pick your services', description: 'Chip repair, polishing, headlight restoration, and more.' },
  { title: 'Get an instant price', description: 'No calls, no hidden fees. Book on the spot.' },
]

export default async function Home() {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold">Car Care</span>
          <Link
            href="/quote"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
          >
            Get a quote
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Auto glass repair, priced instantly.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Windshield chip repair, polishing, headlight restoration, and more — see your exact
            price before you book, then get it fixed at your driveway or office.
          </p>
          <Link
            href="/quote"
            className="mt-8 inline-block rounded-md bg-brand px-6 py-3 font-semibold text-brand-foreground"
          >
            Get your instant quote
          </Link>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-lg border border-border p-6">
                <span className="text-sm font-semibold text-brand">Step {i + 1}</span>
                <h2 className="mt-2 font-semibold">{step.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {reviews && reviews.length > 0 && (
          <section className="mx-auto max-w-4xl px-4 pb-20">
            <h2 className="text-center text-2xl font-bold">What drivers say</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {reviews.map((r, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <p aria-hidden className="text-brand">
                    {'★'.repeat(r.rating)}
                    <span className="text-border">{'★'.repeat(5 - r.rating)}</span>
                  </p>
                  <span className="sr-only">{r.rating} out of 5 stars</span>
                  {r.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Car Care
      </footer>
    </div>
  )
}
