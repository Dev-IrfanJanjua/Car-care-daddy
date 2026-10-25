import { Reveal } from '@/components/motion/reveal'
import type { Faq } from '../types'
import { FaqItem } from './faq-item'

/** Animated accordion (see FaqItem); the FAQPage JSON-LD below is rendered on the server. */
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
          <FaqItem key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </section>
  )
}
