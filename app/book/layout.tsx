import { SiteHeader } from '@/components/home/site-header'

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
