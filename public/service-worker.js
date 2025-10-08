const CACHE_NAME = 'toolsyfy-cache-v1';
// Define assets to cache on install.
// This includes the main page, essential styles, scripts, and data.
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/tools.json',
  '/site-config.json',
  '/data/affiliates.json',
  '/data/changelog.json',
  // Key 3rd-party assets
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://rsms.me/inter/inter.css'
];

// Install event: opens a cache and adds the core assets to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching core assets.');
        // Use addAll to fetch and cache all specified URLs.
        // We catch errors because a single failed asset (e.g., from a CDN) shouldn't break the whole SW install.
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Failed to cache some assets during install:', err);
        });
      })
  );
});

// Activate event: cleans up old caches to save space.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache is found that is not in our whitelist, delete it.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: implements a robust cache-first strategy with network fallback.
self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith((async () => {
    // 1. Try to get the response from the cache.
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // 2. If not in cache, try to fetch from the network.
    try {
      const networkResponse = await fetch(event.request);
      
      // 3. If the fetch is successful, cache the response and return it.
      // This check ensures we don't cache error responses (like 404s or 500s).
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, responseToCache);
      }
      return networkResponse;
    } catch (error) {
      // 4. If the network fetch fails, return a generic offline response.
      console.error('Fetch failed; returning offline fallback.', event.request.url, error);
      return new Response(
        '<p>You are offline and this resource is not available in the cache.</p>', 
        { 
          status: 503, 
          statusText: 'Service Unavailable', 
          headers: { 'Content-Type': 'text/html' } 
        }
      );
    }
  })());
});