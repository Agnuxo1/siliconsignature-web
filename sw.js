/**
 * SiliconSignature Service Worker
 * Provides offline functionality by caching all assets.
 * Uses Cache-First strategy for static assets.
 */

const CACHE_NAME = 'siliconsignature-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/reedsolomon.js',
  '/js/crypto.js',
  '/js/watermark.js',
  '/js/app.js',
  '/manifest.json'
];

// ---------------------------------------------------------------------------
// Install: Cache all static assets
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Cache install failed:', err);
      })
  );
});

// ---------------------------------------------------------------------------
// Activate: Clean up old caches
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// ---------------------------------------------------------------------------
// Fetch: Cache-first strategy
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and non-HTTP(S) URLs
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  // Skip external resources (fonts, etc.)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        // Return cached version if available
        if (cached) {
          return cached;
        }

        // Otherwise fetch from network and cache
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Network failed - return offline fallback if we have one
            return caches.match('/index.html');
          });
      })
  );
});

// ---------------------------------------------------------------------------
// Message handling from clients
// ---------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
