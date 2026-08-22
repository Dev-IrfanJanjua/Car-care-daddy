import { Reveal } from './reveal'
import { BeforeAfterSlider } from './before-after-slider'

export function BeforeAfterSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">
          Real results
        </span>
        <span className="rule-gold mt-3" />
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          See the difference
        </h2>
        <p className="mt-3 text-muted-foreground">
          Drag the slider to see what a CeO₂ restoration does to a hazed, spotted windshield.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <BeforeAfterSlider />
      </Reveal>
    </section>
  )
}
