const CACHE_VERSION = 'survive-v2';
const CACHE_NAME = `survive-${CACHE_VERSION}`;

const CORE_ASSETS = ['/', '/index.html', '/manifest.json', '/sw.js'];

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1464822759085-2f3662e9c074?w=1400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1584464491033-06628f6a8a8f?w=1400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623e02e42e?w=1400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=1400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80&fit=crop'
];

const ALL_PRECACHE = [...CORE_ASSETS, ...UNSPLASH_IMAGES];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(ALL_PRECACHE.map((url) =>
        fetch(url).then((response) => {
          if (response.ok) return cache.put(url, response);
          return cache.put(url, new Response('', { status: 200 }));
        }).catch(() => cache.put(url, new Response('', { status: 200 })))
      ));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;
  
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        if (request.mode === 'navigate') {
          return new Response('<h1>Offline</h1><p>Content is cached for offline use.</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        return new Response('Offline', { status: 408 });
      });
    })
  );
});
