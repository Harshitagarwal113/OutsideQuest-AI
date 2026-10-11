// OutsideQuest AI - Service Worker
// Versioned cache strategy with safe eviction and same-origin restrictions

const CACHE_VERSION = 'outsidequest-v2';
const OFFLINE_URL = '/offline.html';

const APP_SHELL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('outsidequest-') && key !== CACHE_VERSION)
          .map((obsoleteKey) => caches.delete(obsoleteKey))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Restrict caching to same-origin requests to prevent blindly caching third-party or untrusted endpoints
  if (url.origin !== self.location.origin) return;

  // HTML navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid response, clone and update cache
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return response;
        })
        .catch(async () => {
          // Fall back to cached page or offline page
          const cache = await caches.open(CACHE_VERSION);
          const cachedPage = await cache.match(event.request);
          if (cachedPage) return cachedPage;

          const offlineFallback = await cache.match(OFFLINE_URL);
          return offlineFallback || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Same-origin static asset caching (stale-while-revalidate)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_VERSION).then((cache) => {
                cache.put(event.request, copy);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
