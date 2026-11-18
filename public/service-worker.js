const STATIC_CACHE = 'tecnomarket-static-v1';
const DYNAMIC_CACHE = 'tecnomarket-dynamic-v1';

// Archivos base (App Shell) de TecnoMarket
const APP_SHELL = [
  './',
  './index.html',
  './offline.html',
  './styles.css',
  './dist/app.js',
  './manifest.json',
  './icons/icon-192.png.png',
  './icons/icon-512.png.png'
];

// 1. Instalación: precarga el App Shell en la caché estática
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      for (const asset of APP_SHELL) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('[Service Worker] No se pudo precachear el recurso:', asset, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// 2. Activación: limpia cachés antiguas cuando se actualiza la versión
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 3. Interceptación de peticiones (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorar métodos que no sean GET (POST, PUT, DELETE van directo a red)
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Ignorar esquemas de extensiones de navegador
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // A. Peticiones a la API REST (/api/...) -> Estrategia Network First con respaldo en Caché
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedApi = await caches.match(request);
          if (cachedApi) {
            return cachedApi;
          }
          return new Response(
            JSON.stringify({
              offline: true,
              mensaje: 'Datos servidos en modo sin conexión.'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // B. Navegación de documentos HTML -> Network First con fallback a index.html u offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage =
            (await caches.match(request)) ||
            (await caches.match('./index.html')) ||
            (await caches.match('./offline.html'));
          return cachedPage;
        })
    );
    return;
  }

  // C. Recursos estáticos (CSS, JS compilado, iconos, fuentes) -> Cache First con actualización en segundo plano
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});