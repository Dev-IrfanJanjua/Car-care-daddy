import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlowBackground } from './glow-background'
import { WhatsAppIcon } from './brand-icons'

/**
 * Shared body for the four pages the header nav now points at
 * (/services, /gallery, /about, /contact) that don't have real content yet --
 * placeholders rather than 404s while their content gets designed separately.
 * Each page supplies its own eyebrow/title/description; the CTA is the same
 * everywhere, since "get a price" and "talk to us" are always the two live
 * things a visitor can actually do today.
 */
export function ComingSoonSection({
  eyebrow,
  title,
  description,
  whatsappUrl,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  whatsappUrl: string
  children?: ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900 py-20 sm:py-28">
      <GlowBackground />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center sm:px-6">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">
          {eyebrow}
        </span>
        <span className="rule-gold mt-3" />
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-muted-foreground">{description}</p>

        {children}

        <div className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" className="h-12 px-6 text-base" render={<Link href="/quote" />}>
            Get your price
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-6 text-base"
            render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <WhatsAppIcon className="size-4" />
            WhatsApp us
          </Button>
        </div>
      </div>
    </section>
  )
}
