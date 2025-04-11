const cacheName = 'v1';

const putInCache = async (request, response) => {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
};

const cacheFirst = async (request, event) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    const responseFromNetwork = await fetch(request);
    event.waitUntil(putInCache(request, responseFromNetwork.clone()));
    return responseFromNetwork;
};

const allowList = ['', 'json'];

self.addEventListener('fetch', (event) => {
    console.log(event.request.destination);
    if (allowList.includes(event.request.destination)) {
        const url = new URL(event.request.url);
        if (url.pathname.startsWith('/data')) {
            event.respondWith(cacheFirst(event.request, event));
        }
    }
});
