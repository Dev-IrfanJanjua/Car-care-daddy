import { Droplets, Lightbulb, Sparkles, Car, Wrench, type LucideIcon } from 'lucide-react'

// Keyed off the `category` column in the services table. Anything unmapped
// falls through to a neutral wrench, so adding a category never breaks the page.
//
// Every tile shares one navy-and-gold treatment on purpose: the icon alone
// distinguishes the service. Colour-coding each category (sky / cyan / amber /
// violet) put five competing hues on one screen and read as a template, not a
// brand.
const CATEGORY_STYLES: Record<string, { icon: LucideIcon; image: string; position: string }> = {
  windshield: {
    icon: Droplets,
    image: '/images/service-windshield.jpg',
    // The subject (hazed glass) sits high in the frame.
    position: 'center 35%',
  },
  glass: {
    icon: Sparkles,
    image: '/images/service-glass-polish.jpg',
    position: 'center',
  },
  headlights: {
    icon: Lightbulb,
    image: '/images/service-headlight.jpg',
    // Portrait source; the lit headlight is low in the frame, so bias the crop
    // down or a 3:2 card would cut it off entirely.
    position: 'center 70%',
  },
  detailing: {
    icon: Car,
    image: '/images/service-detailing.jpg',
    position: 'center',
  },
}

const FALLBACK = {
  icon: Wrench,
  image: '/images/service-glass-polish.jpg',
  position: 'center',
}

export function categoryStyle(category: string | null | undefined) {
  return (category && CATEGORY_STYLES[category]) || FALLBACK
}
