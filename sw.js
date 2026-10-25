// Dama Malvada Trainer: todo se guarda en caché para funcionar sin internet.
const CACHE = 'dm-trainer-v3';
const ASSETS = ['./', 'index.html', 'data.json', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  // cache:'reload' salta la caché HTTP del navegador para no guardar archivos viejos
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('index.html').then(r => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req).then(resp => {
    if (resp.ok && new URL(req.url).origin === location.origin) {
      const copy = resp.clone(); caches.open(CACHE).then(c => c.put(req, copy));
    }
    return resp;
  })));
});
