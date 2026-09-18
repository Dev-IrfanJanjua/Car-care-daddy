// The site's top-level pages. One list, shared by the header nav and the
// footer's "Quick Links" column, so the two can never drift out of sync with
// each other.
export const MAIN_NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const
