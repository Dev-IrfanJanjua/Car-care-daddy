'use client'

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
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-foreground">
            C
          </div>
          <span className="font-semibold">Car Care</span>
        </div>
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
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
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
