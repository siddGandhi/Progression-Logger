const CACHE_NAME = 'progression-v1';
const ASSETS_TO_CACHE = [
  './',
  '/index.html',
  '/view.html',
  '/analytics.html',
  '/styles.css',
  '/movements.js',
  '/db-service.js',
  '/firebase-config.js'
];

// Install event: cache the core UI shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We map through the array and try to add each file individually
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((error) => {
            // This will tell you EXACTLY which file failed to download
            console.error(`Failed to cache: ${url}`, error);
          });
        })
      );
    })
  );
});

// Activate event: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: Network-first approach for logic/UI, 
// allowing the app to load faster from cache while fetching updates.
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (like Firebase SDK) to avoid errors
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Update cache with the fresh version
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
