// Service Worker for Sanubari POS — Offline & Resilient Cache
const CACHE_NAME = 'sanubari-pos-v18';
const STATIC_CACHE_NAME = 'sanubari-pos-static-v18';

const PRECACHE_URLS = [
    '/favicon.svg',
    '/favicon-192x192.png',
    '/favicon-512x512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS).catch((err) => {
                console.warn('Precache partial warning:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Aggressively flush any legacy caches (v1, v2, v3, v4, etc.)
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // 1. NEVER intercept Inertia SPA requests, auth routes, or dynamic POS APIs
    const isInertia = event.request.headers.get('X-Inertia') === 'true';
    const isDynamicApi =
        url.pathname.startsWith('/pos/orders') ||
        url.pathname.startsWith('/pos/checkout') ||
        url.pathname.startsWith('/pos/cash-flows') ||
        url.pathname.startsWith('/pos/settings') ||
        url.pathname.startsWith('/pos/reports') ||
        url.pathname.startsWith('/pos/queue') ||
        url.pathname.startsWith('/pos/login') ||
        url.pathname.startsWith('/pos/logout') ||
        url.pathname.startsWith('/pos/download');

    if (isInertia || isDynamicApi) {
        event.respondWith(fetch(event.request));
        return;
    }

    // 2. Navigation requests (/pos, etc.): NETWORK-FIRST
    // Never serve stale redirect or unauthenticated cache when online!
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Truly offline: try cached page
                    return caches.match(event.request);
                })
        );
        return;
    }

    // 3. POS Catalog API: Network-First with Cache Fallback for Offline
    if (url.pathname === '/pos/catalog') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 4. Static Assets (hashed build assets, fonts, brand images, storage media): Cache-First
    if (
        url.pathname.startsWith('/build/') ||
        url.pathname.startsWith('/fonts/') ||
        url.pathname.startsWith('/brand/') ||
        url.pathname.startsWith('/storage/') ||
        url.pathname.endsWith('.woff2')
    ) {
        event.respondWith(
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // 5. Default pass-through
    event.respondWith(fetch(event.request));
});
