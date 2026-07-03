const CACHE_NAME = 'next-pwa-cache-v1';
const DYNAMIC_CACHE = 'next-pwa-dynamic-v1';

//Asset yang akan di cache saat instalasi
const urlsToCache = [
    '/',
    '/manifest.json',
    '/favicon.ico',
    '/icon-192x192.png',
    '/icon-512x512.png',
];

// Install event - caching assets static
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - cleaning old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    event.waitUntil(
        self.clients.claim().then(() => {
            return caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            });
        })
    );
});

// Fetch event - serving cached assets
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();

                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    if (event.request.destination === 'document') {
                        return caches.match('/');
                    }
                });
            })
    );
});

// Push notification click event
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Notification';
    const options = {
        body: data.body || 'You have a new notification.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: data.url ? {
            url: data.url || '/',
        } : { url: '/' },
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'close', title: 'Close' }
        ]
    };
    event.waitUntil(self.registration.showNotification(title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('On notification click: ', event.notification.tag);
    event.notification.close();

    const urlToOpen = event.action === 'close' ? null : event.notification.data?.url || '/';

    if (urlToOpen) {
        const absoluteUrl = new URL(urlToOpen, self.location.origin).href;
        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    for (let i = 0; i < clientList.length; i++) {
                        const client = clientList[i];
                        if (client.url === absoluteUrl && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    if (self.clients.openWindow) {
                        return self.clients.openWindow(absoluteUrl);
                    }
                })
        );
    }
});

// Backgorund sync event
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Logic to sync data with server
    console.log('Syncing data with server...');
    // Example: Fetch unsynced data from IndexedDB and send to server
}