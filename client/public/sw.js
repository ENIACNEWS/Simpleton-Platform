/**
 * Simpleton PWA Service Worker
 * Provides offline functionality and app-like performance
 */

const CACHE_NAME = 'simpleton-v1.4.0-diamond-prices';
const OFFLINE_URL = '/';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/simpleton-mode',
  '/database',
  '/diamonds',
  '/watches',
  '/education',
  '/community',
  '/manifest.json',
  '/simpleton-logo.jpeg'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        // Only log errors in development
        if (self.location.hostname === 'localhost') {
          console.error('❌ Simpleton PWA: Installation failed:', error);
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // Handle API requests with network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone();
          
          // Cache successful API responses
          if (response.status === 200) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Try to serve from cache if network fails
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Return a fallback response for failed API requests
              return new Response(
                JSON.stringify({ 
                  error: 'Offline mode active', 
                  message: 'Please check your internet connection' 
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'application/json'
                  })
                }
              );
            });
        })
    );
    return;
  }
  
  // Handle navigation requests with network-first strategy
  // This ensures users always get the latest version of the app
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Serve cached version only when truly offline
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }
  
  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            
            return response;
          });
      })
  );
});

// Background sync for data updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'pricing-sync') {
    console.log('✅ Simpleton PWA: Background sync - updating pricing data');
    event.waitUntil(
      fetch('/api/pricing/latest')
        .then((response) => response.json())
        .then((data) => {
          console.log('✅ Simpleton PWA: Pricing data updated in background');
        })
        .catch((error) => {
          console.log('⚠️ Simpleton PWA: Background sync failed:', error);
        })
    );
  }
});

// Push notifications (for future features)
self.addEventListener('push', (event) => {
  console.log('✅ Simpleton PWA: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Simpleton has new updates!',
    icon: '/simpleton-logo.jpeg',
    badge: '/simpleton-logo.jpeg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'open',
        title: 'Open Simpleton',
        icon: '/simpleton-logo.jpeg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/simpleton-logo.jpeg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Simpleton', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('✅ Simpleton PWA: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});