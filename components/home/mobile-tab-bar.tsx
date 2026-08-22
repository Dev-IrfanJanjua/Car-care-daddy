import { Mail } from 'lucide-react'
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from './brand-icons'

// TODO: replace with the real handles/number/address.
// WhatsApp expects a full international number, digits only (no +, spaces, or dashes).
const links = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/carcare',
    icon: InstagramIcon,
    // Official brand colors (per simple-icons metadata). TikTok's is black, so
    // it uses the theme foreground to stay visible in dark mode.
    hover: 'hover:text-[#FF0069]',
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@carcare',
    icon: TikTokIcon,
    hover: 'hover:text-foreground',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/10000000000',
    icon: WhatsAppIcon,
    hover: 'hover:text-[#25D366]',
  },
  {
    label: 'Email',
    href: 'mailto:hello@carcare.example',
    icon: Mail,
    hover: 'hover:text-brand',
  },
] as const

export function MobileTabBar() {
  return (
    <nav
      aria-label="Contact us"
      className="sticky bottom-0 z-50 border-t border-border/60 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-around px-4 py-2.5 sm:justify-center sm:gap-16">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-muted-foreground transition-colors ${link.hover}`}
          >
            <link.icon className="size-5" />
            <span className="text-[11px] font-medium">{link.label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}
