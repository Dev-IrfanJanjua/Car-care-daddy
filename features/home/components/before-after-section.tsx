import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { BeforeAfterCarousel, type CarouselItem } from './before-after-carousel'
import { SectionHead, SectionShell } from './section-head'

const FALLBACK: CarouselItem = {
  id: 'default',
  kind: 'compare',
  title: 'Windshield restoration',
  category: 'Windshield',
  before: '/images/before-windshield.jpg',
  after: '/images/after-windshield.jpg',
}

/** "Real results": the gallery's published pairs in a carousel (a built-in pair until the first upload). */
export function BeforeAfterSection({ items }: { items: CarouselItem[] }) {
  const slides = items.length ? items : [FALLBACK]
  return (
    <SectionShell id="results" className="bg-ink-950">
      <Reveal>
        <SectionHead
          center
          eyebrow="Real results"
          title="See the difference"
          lead="Drag, swipe or tap through our latest before & after work."
        />
      </Reveal>
      <Reveal delay={0.08}>
        <BeforeAfterCarousel items={slides} />
      </Reveal>
      <div className="mt-11 text-center">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-[0.92rem] font-semibold text-gold-ink [&_svg]:transition-transform hover:[&_svg]:translate-x-1">
          Open the full gallery <ArrowRight className="size-4" />
        </Link>
      </div>
    </SectionShell>
  )
}
