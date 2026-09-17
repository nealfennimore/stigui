// Registered as /sw.js?v=<build id> (see src/app/layout.tsx). A new build
// changes the URL, so the browser installs a new worker whose cache name
// differs from the previous build's; activation deletes the old caches.
const buildId = new URL(self.location.href).searchParams.get('v') || 'dev';
const cacheName = `stigui-${buildId}`;

const deleteOldCaches = async () => {
    const keyList = await caches.keys();
    await Promise.all(
        keyList
            .filter((key) => key !== cacheName)
            .map((key) => caches.delete(key)),
    );
};

self.addEventListener('install', () => {
    // Take over from the previous build without waiting for tabs to close.
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(deleteOldCaches().then(() => self.clients.claim()));
});

const putInCache = async (request, response) => {
    if (!response.ok) {
        return;
    }
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
};

/** Hashed assets and STIG data: serve from this build's cache first. */
const cacheFirst = async (request, event) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    const responseFromNetwork = await fetch(request);
    event.waitUntil(putInCache(request, responseFromNetwork.clone()));
    return responseFromNetwork;
};

/** Pages: prefer the network so a deploy shows up on the next navigation. */
const networkFirst = async (request, event) => {
    try {
        const responseFromNetwork = await fetch(request);
        event.waitUntil(putInCache(request, responseFromNetwork.clone()));
        return responseFromNetwork;
    } catch (error) {
        const responseFromCache = await caches.match(request);
        if (responseFromCache) {
            return responseFromCache;
        }
        throw error;
    }
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET' || !request.url.startsWith('https:')) {
        return;
    }
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request, event));
        return;
    }
    event.respondWith(cacheFirst(request, event));
});
