const CACHE_NAME = 'sirsheba-v1'
const STATIC_ASSETS = [
    '/',
    '/students',
    '/attendance',
    '/fees/quick',
    '/fees/pending',
    '/fees/history',
    '/sms',
    '/exams',
    '/settings',
    '/manifest.json',
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(() => {
                // Silently fail for individual assets
            })
        })
    )
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        })
    )
    self.clients.claim()
})

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return

    // Skip non-http(s) requests
    if (!event.request.url.startsWith('http')) return

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached

            return fetch(event.request)
                .then((response) => {
                    // Cache valid responses
                    if (response && response.status === 200 && response.type === 'basic') {
                        const responseToCache = response.clone()
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache)
                        })
                    }
                    return response
                })
                .catch(() => {
                    // Return cached home page for navigation requests when offline
                    if (event.request.mode === 'navigate') {
                        return caches.match('/')
                    }
                })
        })
    )
})
