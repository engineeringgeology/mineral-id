/* Offline cache: the whole app is stored on the phone on first visit */
const V = 'mineralid-v0.10.1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'css/app.css', 'lib/leaflet.css',
  'lib/jspdf.umd.min.js', 'lib/xlsx.mini.min.js', 'lib/leaflet.js', 'js/font.js',
  'js/minerals.js', 'js/i18n-names.js', 'js/i18n-terms.js', 'js/i18n.js', 'js/db.js', 'js/art.js', 'js/identify.js', 'js/photo.js', 'js/model.js', 'js/quiz.js', 'js/export.js', 'js/license.js', 'js/app.js',
  'lib/tf.min.js', 'model/head.json', 'model/credits.json', 'model/base/model.json', 'model/base/group1-shard1of2.bin', 'model/base/group1-shard2of2.bin',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
    return res;
  }).catch(() => caches.match('index.html'))));
});
