/* Service worker: працює офлайн + приймає файл чату через «Поділитися» (Android) */
const V = 'zvedennia-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png', './icons/logo.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('zvedennia-') && k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method === 'POST' && u.pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      try {
        const fd = await r.formData();
        const f = fd.get('chat');
        if (f && f.size !== undefined) {
          const c = await caches.open('shared-chat');
          await c.put('shared-file', new Response(f, {headers: {'x-name': encodeURIComponent(f.name || 'chat'), 'content-type': f.type || 'application/octet-stream'}}));
        }
      } catch (err) {}
      return Response.redirect(new URL('./index.html?shared=1', self.registration.scope).href, 303);
    })());
    return;
  }
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.mode === 'navigate') {   // спершу мережа (щоб бачити оновлення), без мережі — кеш
    e.respondWith(fetch(r).then(res => {
      const copy = res.clone(); caches.open(V).then(c => c.put('./index.html', copy)); return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); return res;
  })));
});
