// Service worker do Atlas de Exanima.
// Guarda em cache o que for aberto pela primeira vez (com internet) e
// passa a servir dali quando o app for aberto sem conexão.

var CACHE_NAME = 'atlas-exanima-v1';

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request).then(function (cached) {
        var network = fetch(event.request)
          .then(function (response) {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(function () {
            return cached || new Response(
              'Offline e esta página ainda não foi salva em cache.',
              {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}}
            );
          });
        // Serve do cache na hora (rápido) se existir; senão espera a rede.
        return cached || network;
      });
    })
  );
});
