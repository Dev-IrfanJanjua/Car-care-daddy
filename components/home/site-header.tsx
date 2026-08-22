import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-brand to-cyan-500 text-brand-foreground shadow-sm shadow-brand/30">
            <Sparkles className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">Car Care</span>
        </Link>

        <Button size="lg" className="shadow-md shadow-brand/25" render={<Link href="/quote" />}>
          Book Now
        </Button>
      </div>
    </header>
  )
}
