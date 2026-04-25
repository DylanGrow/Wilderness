// Service Worker for Wilderness Survival Guide PWA
// Cache-first strategy with offline fallback

const CACHE_VERSION = 'survive-v1';
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

const OFFLINE_FALLBACK = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Offline - Survive</title><style>:root{--bg:#0f1410;--text:#e8e4d8;--accent:#4a7c3f}body{margin:0;font-family:system-ui,sans-serif;background:var(--bg);color:var(--text);display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}.container{max-width:500px}h1{color:var(--accent);margin-bottom:1rem}p{line-height:1.6;opacity:0.9}.icon{width:64px;height:64px;margin:0 auto 1.5rem;fill:var(--accent)}</style></head><body><div class="container"><svg class="icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg><h1>You're Offline</h1><p>The Wilderness Survival Guide is cached and ready. Most content is available without connection.</p><p>If you're seeing this, try refreshing the page or check your network settings.</p></div></body></html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(ALL_PRECACHE.map((url) =>
        fetch(url).then((response) => {
          if (response.ok) return cache.put(url, response);
          return cache.put(url, new Response('', { status: 200, statusText: 'Cached' }));
        }).catch(() => cache.put(url, new Response('', { status: 200, statusText: 'Cached' })))
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
          return caches.match('/offline.html').then((fallback) => {
            if (fallback) return fallback;
            return new Response(OFFLINE_FALLBACK, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
          });
        }
        return new Response('Resource not available offline', { status: 408 });
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
