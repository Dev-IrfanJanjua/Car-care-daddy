import { WARRANTY_YEARS } from '@/lib/contact'
import type { HomeContent } from '../types'

export const DEFAULT_CONTENT: HomeContent = {
  heroBadge: 'Free doorstep service · Lahore',
  heroHeadline: 'Crystal-clear glass,',
  heroAccent: 'right at your doorstep.',
  heroSubtext:
    'Professional CeO₂ windshield restoration, full glass polishing and headlight restoration. We remove water spots, wiper marks and night glare — at your home or office.',
  heroPoints: [
    'Free doorstep service',
    'Done in 60–90 minutes',
    `${WARRANTY_YEARS}-year results warranty`,
    'Pay after the job',
  ],
  ctaTitle: 'Ready for a crystal-clear windshield?',
  ctaText: 'Get an instant price and book your doorstep appointment in under a minute.',
  faqs: [
    {
      q: 'Do you really come to my home or office?',
      a: 'Yes. Every job is done at your doorstep anywhere in Lahore, and the visit is free. You only need a shaded spot and access to the car.',
    },
    {
      q: 'How long does a restoration take?',
      a: 'Most windshield jobs take 60 to 90 minutes. Full glass polishing or a package takes a little longer, and we tell you the time when you book.',
    },
    {
      q: 'When do I pay?',
      a: 'After the job, once you have seen the result. There is no deposit.',
    },
    {
      q: 'What does the warranty cover?',
      a: `Your restoration is covered by a ${WARRANTY_YEARS}-year results warranty. If the glass hazes or spots again from normal use, message us on WhatsApp and we will put it right.`,
    },
  ],
}
