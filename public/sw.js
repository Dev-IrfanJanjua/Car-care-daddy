// Minimal service worker: keeps the app installable and nothing more.
//
// The previous version cached every GET response -- including /admin pages,
// booking success links (which carry a private ?t= token) and API responses --
// and served them back offline. On a shared phone that means a signed-out
// admin's pages remained readable. This version caches nothing and, on
// activation, deletes every cache an older version created.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})
