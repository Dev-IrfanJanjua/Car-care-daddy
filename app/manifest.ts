import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Car Care Daddy',
    short_name: 'Car Care Daddy',
    description:
      'Professional CeO₂ windshield restoration and full glass polishing at your doorstep in Lahore.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'en',
    theme_color: '#0b0b0c',
    // Light-only app, so the PWA splash background matches --background rather
    // than the near-black it used to use.
    background_color: '#0b0b0c',
    icons: [
      { src: '/api/icons/192', sizes: '192x192', type: 'image/png' },
      { src: '/api/icons/512', sizes: '512x512', type: 'image/png' },
    ],
  }
}
