/* Life OS service worker — offline + fast load.
   HTML pages: network-first (fresh when online, cached when offline).
   Static assets (fonts, sub-pages once visited): cache-first.
   Gemini/Ansible API calls: always live (never cached). */
const CACHE = 'lifeos-v8';
const ASSETS = [
  './','index.html',
  'food.html','gym.html','games.html','loki.html','tyranids.html','wishlist.html','formats.html',
  'kingdoms.html','driftland.html','crm.html','finances.html','ideas.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Ansible / Gemini must always hit the network
  if (url.hostname.indexOf('generativelanguage') > -1) return;

  // HTML documents: network-first, fall back to cache (offline)
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
    );
    return;
  }

  // Everything else (fonts, etc.): cache-first, then network
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => cached))
  );
});
