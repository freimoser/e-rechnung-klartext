// Service Worker: macht das Werkzeug nach dem ersten Besuch offline nutzbar.
// Er speichert nur Dateien dieser Website – niemals Rechnungen.
const VERSION = '__VERSION__';
const BASE = '__BASE__';
const CACHE = 'erk-' + VERSION;
const ALL = __PRECACHE__;
// Vorab gespeichert wird alles außer den Ratgeberseiten (die werden beim Besuch gespeichert)
const CORE = ALL.filter((u) => u === BASE || !u.endsWith('/'))
  .filter((u) => !u.endsWith('sitemap.xml') && !u.endsWith('llms.txt'));

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('erk-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;

  if (req.mode === 'navigate') {
    // Seiten: erst Netz (aktueller Stand), sonst Zwischenspeicher
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(url.pathname, copy));
          }
          return res;
        })
        .catch(() => caches.match(url.pathname).then((hit) => hit || caches.match(BASE))),
    );
    return;
  }

  // Dateien: erst Zwischenspeicher, sonst Netz
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(url.pathname, copy));
      }
      return res;
    })),
  );
});
