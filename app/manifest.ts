import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Car Care',
    short_name: 'Car Care',
    description:
      'Instant transparent pricing for windshield chip repair, polishing, headlight restoration, and other mobile auto-glass services.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'en',
    theme_color: '#0d9488',
    background_color: '#09090b',
    icons: [
      { src: '/api/icons/192', sizes: '192x192', type: 'image/png' },
      { src: '/api/icons/512', sizes: '512x512', type: 'image/png' },
    ],
  }
}
