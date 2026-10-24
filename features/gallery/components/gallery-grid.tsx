import { BeforeAfterSlider } from '@/features/home'
import type { GalleryItem } from '../types'

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">Our work</span>
        <span className="rule-gold mt-3" />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Before-and-after gallery</h1>
        <p className="mt-3 text-muted-foreground">Real jobs from real doorsteps across Lahore. Drag each slider to compare.</p>
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {items.map((item, i) => (
          <figure key={item.id} className="space-y-3">
            <BeforeAfterSlider beforeSrc={item.beforeUrl} afterSrc={item.afterUrl} alt={item.title} priority={i < 2} />
            <figcaption className="px-1">
              <p className="font-medium text-foreground">{item.title}</p>
              {item.service && <p className="text-sm text-muted-foreground">{item.service}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
