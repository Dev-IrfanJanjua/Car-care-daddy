import { ChevronDown } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import type { Faq } from '../types'

/** Native <details>: keyboard and screen-reader friendly with no client JS. */
export function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Reveal className="flex flex-col items-center text-center">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">Questions</span>
        <span className="rule-gold mt-3" />
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Good to know</h2>
      </Reveal>
      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card dk:rounded-md">
        {faqs.map((f) => (
          <details key={f.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="size-4 shrink-0 text-gold-ink transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
