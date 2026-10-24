import type { Metadata } from 'next'
import { SiteHeader } from '@/features/site-shell'

export const metadata: Metadata = {
  title: 'Book your doorstep service',
  description: 'Choose a time and we come to your home or office in Lahore.',
  robots: { index: false },
}

// Same as app/quote/layout.tsx: the booking wizard and its success screen
// rendered with no site header before this. A layout here covers both
// without either page importing it directly.
export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}
