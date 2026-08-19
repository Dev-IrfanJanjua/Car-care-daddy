import Link from 'next/link'
import { Sparkles, ListChecks, BadgeDollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'

const steps = [
  {
    title: 'Tell us about your vehicle',
    description: 'Make, model, and year — takes ten seconds.',
    icon: Sparkles,
  },
  {
    title: 'Pick your services',
    description: 'Chip repair, polishing, headlight restoration, and more.',
    icon: ListChecks,
  },
  {
    title: 'Get an instant price',
    description: 'No calls, no hidden fees. Book on the spot.',
    icon: BadgeDollarSign,
  },
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button render={<Link href="/quote" />}>Get a quote</Button>
          </div>
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
          <Button size="lg" className="mt-8" render={<Link href="/quote" />}>
            Get your instant quote
          </Button>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <Card key={step.title}>
                <CardContent>
                  <step.icon className="size-5 text-brand" />
                  <span className="mt-3 block text-sm font-semibold text-brand">
                    Step {i + 1}
                  </span>
                  <h2 className="mt-1 font-semibold">{step.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {reviews && reviews.length > 0 && (
          <section className="mx-auto max-w-4xl px-4 pb-20">
            <h2 className="text-center text-2xl font-bold">What drivers say</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {reviews.map((r, i) => (
                <Card key={i}>
                  <CardContent>
                    <p aria-hidden className="text-brand">
                      {'★'.repeat(r.rating)}
                      <span className="text-border">{'★'.repeat(5 - r.rating)}</span>
                    </p>
                    <span className="sr-only">{r.rating} out of 5 stars</span>
                    {r.comment && (
                      <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                    )}
                  </CardContent>
                </Card>
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
