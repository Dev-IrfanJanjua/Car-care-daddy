'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarCheck,
  Target,
  Wrench,
  Handshake,
  BarChart3,
  Settings,
  Star,
  Car,
  Tags,
  Palette,
  LogOut,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { signOut } from '@/lib/actions/auth'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/leads', label: 'Leads', icon: Target },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/technicians', label: 'Technicians', icon: Wrench },
  { href: '/admin/partners', label: 'Partners', icon: Handshake },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

// The catalog pages used to be reachable only via a button buried inside
// Settings, which is where the day-to-day pricing work actually happens.
const CATALOG_ITEMS = [
  { href: '/admin/settings/services', label: 'Services & pricing', icon: Tags },
  { href: '/admin/settings/vehicles', label: 'Vehicles', icon: Car },
  { href: '/admin/appearance', label: 'Appearance', icon: Palette },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

// /admin and /admin/settings are both prefixes of other nav hrefs, so they only
// highlight on an exact match -- otherwise Settings would look active while
// you're on Services or Vehicles.
const EXACT_ONLY = ['/admin', '/admin/settings']

function isActiveHref(pathname: string, href: string) {
  return EXACT_ONLY.includes(href) ? pathname === href : pathname.startsWith(href)
}

export function AppSidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname()
  // On mobile the sidebar is an overlay drawer -- leaving it open on top of the
  // page you just navigated to means you have to dismiss it manually every time.
  const { isMobile, setOpenMobile } = useSidebar()
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  const initials =
    user.name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin" className="flex items-center px-2 py-1.5" aria-label="Car Aurum admin">
          <Image
            src="/images/logo-light.png"
            alt="Car Aurum"
            width={720}
            height={305}
            className="logo-on-light h-10 w-auto"
          />
          <Image
            src="/images/logo-dark.png"
            alt="Car Aurum"
            width={720}
            height={305}
            className="logo-on-dark h-10 w-auto"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {[
          { label: 'Operations', items: NAV_ITEMS },
          { label: 'Catalog', items: CATALOG_ITEMS },
        ].map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActiveHref(pathname, item.href)}
                      onClick={closeOnMobile}
                      className="data-active:bg-sidebar-accent data-active:text-gold-ink"
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="size-7 after:border-sidebar-border">
            <AvatarFallback className="bg-muted text-xs text-gold-ink">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            {/* --muted-foreground is tuned for the light pages; on navy it
                falls under 3:1. */}
            <p className="truncate text-xs text-chrome-500">{user.email}</p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={signOut}>
              <SidebarMenuButton type="submit">
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
