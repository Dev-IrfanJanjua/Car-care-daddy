const ITEMS = [
  'CeO₂ Windshield Restoration',
  'Full Glass Polishing',
  'Headlight Restoration',
  'Interior & Exterior Detailing',
  '3-Year Results Warranty',
  'Doorstep Service in Lahore',
]

/** The slow scrolling ribbon under the hero. Decorative, so hidden from assistive tech. */
export function StripSection() {
  const loop = [...ITEMS, ...ITEMS]
  return (
    <div aria-hidden className="overflow-hidden border-y border-line bg-ink-950 py-5">
      <div className="flex w-max animate-marquee gap-14 motion-reduce:animate-none" style={{ animationDuration: '38s' }}>
        {loop.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-14 font-display text-[0.86rem] font-medium tracking-[0.04em] whitespace-nowrap text-chrome-400 uppercase after:text-[0.6rem] after:text-gold-ink after:content-['◆']"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
