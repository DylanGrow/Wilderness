const CACHE_NAME = 'survive-v3';
const CORE = ['/', '/index.html', '/manifest.json', '/sw.js'];
const IMAGES = [
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
const PRECACHE = [...CORE, ...IMAGES];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => Promise.all(PRECACHE.map(u => fetch(u).then(r => r.ok ? c.put(u, r) : c.put(u, new Response('', {status:200})))).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(net => {
        if (net.ok) { const clone = net.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, clone)); }
        return net;
      }).catch(() => e.request.mode === 'navigate' ? new Response('<!DOCTYPE html><html><head><title>Offline</title><style>body{font-family:system-ui;background:#0f1410;color:#e8e4d8;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:2rem}h1{color:#4a7c3f}</style></head><body><div><h1>You are offline</h1><p>The guide is fully cached. Refresh if content is missing.</p></div></body></html>', {headers:{'Content-Type':'text/html'}}) : new Response('Offline', {status:408}));
    })
  );
});
