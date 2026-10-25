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

/**
 * The two facts every service card carries besides its price: how long the job
 * takes and what stands behind it. Copy per category rather than per row, so a
 * service the owner adds under an existing category inherits sensible wording.
 * Unmapped categories simply show neither.
 */
const CATEGORY_META: Record<string, { duration: string; warranty: string }> = {
  windshield: { duration: '60–90 min', warranty: '3-year results warranty' },
  glass: { duration: '90 min', warranty: '3-year results warranty' },
  headlights: { duration: '45–60 min', warranty: '1-year warranty · UV protected' },
  detailing: { duration: 'Half day', warranty: '7-day finish guarantee' },
}

export function categoryMeta(category: string | null | undefined) {
  return (category && CATEGORY_META[category]) || null
}

const CATEGORY_LABEL: Record<string, string> = {
  windshield: 'Windshield',
  glass: 'Glass polish',
  headlights: 'Headlights',
  detailing: 'Detailing',
}

export function categoryLabel(category: string | null | undefined) {
  return (category && CATEGORY_LABEL[category]) || 'Service'
}

/** The bullet points under a service on the Services page; per category, like the meta above. */
const CATEGORY_FEATURES: Record<string, string[]> = {
  windshield: ['Removes water spots & wiper marks', 'Reduces night glare', 'Professional CeO₂ compound', '3-year results warranty'],
  glass: ['All windows, inside-out clarity', 'Removes mineral deposits', 'Hydrophobic-ready surface', 'Backed by warranty'],
  headlights: ['Removes yellowing & oxidation', 'Brighter, wider beam', 'UV-protective finish', 'Both lights, same visit'],
  detailing: ['Interior deep clean', 'Exterior wash, buff & polish', 'Trim & tyre dressing', 'Add-on to any service'],
}

export function categoryFeatures(category: string | null | undefined) {
  return (category && CATEGORY_FEATURES[category]) || []
}
