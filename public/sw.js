// Service Worker for Sanskara AI - YC Grade Performance
const CACHE_NAME = 'sanskara-ai-v1';
const urlsToCache = [
  '/',
  '/logo.jpeg',
  '/lovable-uploads/ef091a6d-01c3-422d-9dac-faf459fb74ab.webp',
  '/lovable-uploads/82e13d9f-7faf-4d65-8c82-2be524f85cf7.webp',
  '/lovable-uploads/7d1ca230-11c7-4edb-9419-d5847fd86028.webp',
  '/lovable-uploads/89ffba58-4862-4bf8-b505-e54b0c6fd052.webp'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
