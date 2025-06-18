self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/css/timekeeper.css',
        '/workTimeCalculator.js',
        '/settings_menu.js',
        '/draw_circle.js',
        '/icons/timekeeper-icon-192.png',
        '/icons/timekeeper-icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
