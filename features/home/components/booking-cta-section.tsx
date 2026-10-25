import Link from 'next/link'
import { WhatsAppIcon } from '@/components/icons/brand-icons'
import { Reveal } from '@/components/motion/reveal'
import { siteButton } from '@/components/ui/site-button'
import { DEFAULT_CONTENT } from '@/features/content/client'
import { SectionShell } from './section-head'

/**
 * The closing call to action. The headline and sub-line are editable under
 * Admin → Home content; the buttons always go to the quote flow and to the
 * business's WhatsApp.
 */
export function BookingCtaSection({
  title = DEFAULT_CONTENT.ctaTitle,
  text = DEFAULT_CONTENT.ctaText,
  whatsappUrl,
  eyebrow = 'Free doorstep service',
}: {
  title?: string
  text?: string
  whatsappUrl: string
  eyebrow?: string
}) {
  return (
    <SectionShell flush>
      <Reveal>
        <div className="zone-dark rounded-[26px] border border-gold-500/40 bg-ink-800 px-[22px] py-10 text-center sm:px-10 sm:py-14 dk:rounded-sm dk:border-gold-500/45">
          <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.26em] text-gold-ink uppercase before:h-px before:w-[34px] before:bg-current before:content-['']">
            {eyebrow}
          </span>
          <h2 className="mx-auto mt-3.5 mb-4 max-w-[16ch] font-display text-[clamp(1.6rem,3vw,2.35rem)] leading-[1.18] font-semibold tracking-[-0.03em] text-balance text-chrome-100">
            {title}
          </h2>
          <p className="mx-auto mb-[34px] max-w-[60ch] text-[1.05rem] text-chrome-400">{text}</p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link href="/quote" className={siteButton()}>
              Book now
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={siteButton({ variant: 'ghost' })}>
              <WhatsAppIcon /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </Reveal>
    </SectionShell>
  )
}
