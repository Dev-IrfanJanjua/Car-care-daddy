import { Mail } from 'lucide-react'
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from './brand-icons'
import { WHATSAPP_URL } from '@/lib/contact'

// TODO: swap the Instagram/TikTok handles and the email for the real ones.
const links = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/carcaredaddy',
    icon: InstagramIcon,
    // Instagram's mark is an official multi-stop gradient, painted via the
    // <linearGradient> defined once below.
    style: { fill: 'url(#ig-gradient)' },
  },
  { label: 'TikTok', href: 'https://tiktok.com/@carcaredaddy', icon: TikTokIcon, color: '#000000' },
  { label: 'WhatsApp', href: WHATSAPP_URL, icon: WhatsAppIcon, color: '#25D366' },
  // Not a third-party mark, so this one is ours to brand: champagne gold.
  { label: 'Email', href: 'mailto:hello@carcaredaddy.com', icon: Mail, color: '#b4832f' },
] as const

export function MobileTabBar() {
  return (
    <nav
      aria-label="Contact us"
      className="sticky bottom-0 z-50 border-t border-border/60 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg"
    >
      {/* Defined once for the whole bar; referenced by fill="url(#ig-gradient)". */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD600" />
            <stop offset="25%" stopColor="#FF7A00" />
            <stop offset="50%" stopColor="#FF0069" />
            <stop offset="75%" stopColor="#D300C5" />
            <stop offset="100%" stopColor="#7638FA" />
          </linearGradient>
        </defs>
      </svg>

      <div className="mx-auto flex max-w-6xl items-center justify-around px-4 py-2.5 sm:justify-center sm:gap-16">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1 rounded-lg px-3 py-1 transition-transform hover:-translate-y-0.5"
          >
            <link.icon
              className="size-5"
              style={'style' in link ? link.style : { color: link.color }}
            />
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
              {link.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  )
}
