import { Reveal } from '@/components/motion/reveal'
import { SectionHead, SectionShell } from './section-head'

// `meta` hangs the duration off the step it actually applies to. Only the work
// itself has one -- the first two steps take as long as the customer takes.
const STEPS: { title: string; description: string; meta?: string }[] = [
  {
    title: 'Choose your service',
    description:
      'Windshield restoration, full glass polishing, headlights or detailing — pick what your car needs and get your exact price.',
  },
  {
    title: 'Book a time slot',
    description: 'Grab a slot that suits you. No calls, no back-and-forth — we confirm on WhatsApp.',
  },
  {
    title: 'We restore at your door',
    description:
      'Our technicians arrive at your home or office anywhere in Lahore and get to work.',
    meta: 'Takes 60–90 minutes',
  },
]

/**
 * "The process": three numbered cards on a pale band. The band is the design's
 * one light-on-dark moment, so the cards inside carry their own fixed ink
 * colours rather than following the page tokens.
 */
export function HowItWorksSection() {
  return (
    <SectionShell id="process" className="bg-ink-950 dk:bg-[#EEF4F6]">
      <Reveal>
        <SectionHead
          center
          eyebrow="The process"
          title="Three steps to crystal-clear glass"
          lead="No workshop visits. No waiting rooms. We come to you."
          className="[&_h2]:text-[#14202A] [&_p]:text-[#566774]"
        />
      </Reveal>

      <div className="grid gap-7 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.1} className="flex">
            <div className="w-full rounded-[26px] border border-gold-500/20 bg-white px-8 py-9 shadow-[0_20px_50px_-34px_rgba(70,48,12,0.4)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(70,48,12,0.45)] dk:rounded-sm dk:border-gold-500/45">
              <div className="mb-3.5 font-display text-[4.5rem] leading-none font-semibold text-gold-ink opacity-55">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="mb-2.5 font-display text-xl font-semibold text-[#14202A]">{step.title}</h3>
              <p className="text-[0.96rem] text-[#566774]">{step.description}</p>
              {step.meta && (
                <span className="mt-4 inline-flex rounded-full bg-gold-500/15 px-3.5 py-1.5 text-[0.78rem] font-semibold text-gold-700 dk:rounded-xs dk:text-[#0E4F61]">
                  {step.meta}
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  )
}
