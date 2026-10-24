export type Faq = { q: string; a: string }

/** Every piece of home-page copy an admin can edit. */
export type HomeContent = {
  heroBadge: string
  heroHeadline: string
  /** second line of the headline, shown in the accent colour */
  heroAccent: string
  heroSubtext: string
  /** four short reassurance points under the hero buttons */
  heroPoints: string[]
  ctaTitle: string
  ctaText: string
  faqs: Faq[]
}
