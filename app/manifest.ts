import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Car Aurum',
    short_name: 'Car Aurum',
    description:
      'Professional CeO₂ windshield restoration and full glass polishing at your doorstep in Lahore.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'en',
    theme_color: '#f8f5f0',
    // PWA splash matches the default (light) --background.
    background_color: '#f8f5f0',
    icons: [
      { src: '/api/icons/192', sizes: '192x192', type: 'image/png' },
      { src: '/api/icons/512', sizes: '512x512', type: 'image/png' },
    ],
  }
}
