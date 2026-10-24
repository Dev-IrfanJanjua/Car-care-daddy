import type { Metadata } from 'next'
import { SiteHeader } from '@/features/site-shell'

export const metadata: Metadata = {
  title: 'Get an instant price',
  description: 'Pick your car and the glass work you need — see a transparent price in seconds.',
}

// Every quote step used to render without the site header -- a carry-over
// from when these were treated as a focused, chrome-free flow. A layout here
// puts it back around the vehicle picker, its "not listed" branch, and the
// services step, without each page needing to import it (and without losing
// it if error.tsx swaps in: a segment's layout stays mounted around its own
// error boundary).
export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}
