// gn-v19: tüm uygulama dosyalarını kurulumda önbelleğe alır (iPhone/Android tam çevrimdışı PWA desteği)
const C = 'gn-v22';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'songs.js',
  'manifest.json',
  'icon.svg',
  'icon-192.png',
  'icon-512.png'
];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS)).catch(() => { }));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.status === 200) {
        const copy = r.clone();
        caches.open(C).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match(e.request).then(m => m || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
