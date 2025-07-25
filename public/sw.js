// Service worker for PWA with React Router support
const CACHE_NAME = 'ampi-loteria-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content and handle SPA routing
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // For navigation requests (HTML pages), return index.html
        // This allows React Router to handle client-side routing
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html').then(cachedResponse => {
            return cachedResponse || fetch('/index.html');
          });
        }
        
        // For other requests, try to fetch from network first, then cache
        return fetch(event.request).catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});