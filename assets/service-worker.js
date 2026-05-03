self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('obltava-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/obltava/',
                '/obltava/index.html',
                '/obltava/assets/index.9d19f81e.js',
                '/obltava/assets/index.7c801b86.css',
                '/obltava/assets/favicon.4ad42837.ico'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
