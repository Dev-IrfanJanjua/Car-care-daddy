import { Reveal } from './reveal'
import { BeforeAfterSlider } from './before-after-slider'

export function BeforeAfterSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">See the difference</h2>
        <p className="mt-3 text-muted-foreground">
          Drag the slider to see what polishing does to a hazed, pitted windshield.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-12">
        <BeforeAfterSlider />
      </Reveal>
    </section>
  )
}
