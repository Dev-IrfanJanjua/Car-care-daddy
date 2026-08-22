'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, LayoutDashboard } from 'lucide-react'

// Only /admin/* lives here, so the map is small and explicit -- clearer than
// title-casing slugs, which would render "Services & pricing" as "Services".
const LABELS: Record<string, string> = {
  admin: 'Dashboard',
  bookings: 'Bookings',
  leads: 'Leads',
  reviews: 'Reviews',
  technicians: 'Technicians',
  partners: 'Partners',
  reports: 'Reports',
  settings: 'Settings',
  services: 'Services & pricing',
  vehicles: 'Vehicles',
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function AdminBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const crumbs = segments.map((segment, i) => ({
    href: '/' + segments.slice(0, i + 1).join('/'),
    // A record id in the URL is meaningless as a label; the parent crumb
    // already says what kind of thing it is.
    label: UUID.test(segment) ? 'Details' : (LABELS[segment] ?? segment),
    isLast: i === segments.length - 1,
  }))

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
      <ol className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex min-w-0 items-center gap-1">
            {crumb.isLast ? (
              <span aria-current="page" className="truncate font-medium">
                {crumb.label}
              </span>
            ) : (
              <>
                <Link
                  href={crumb.href}
                  className="flex shrink-0 items-center gap-1.5 rounded-md px-1 py-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.href === '/admin' && <LayoutDashboard className="size-3.5" />}
                  {crumb.label}
                </Link>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
