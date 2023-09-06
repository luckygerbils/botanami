// import { PlantInstance } from "./types";
import { manifest, version } from '@parcel/service-worker';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
const sw: ServiceWorkerGlobalScope = self as any;

function log(...args: unknown[]) {
    console.log("[Service Worker]", ...args);
}

addEventListener('install', (e: Event) => {
    (e as ExtendableEvent).waitUntil(
        (async () => {
            log("installing for version", version);
            const cache = await caches.open(version);
            await cache.addAll(["/", ...manifest]);
            log("cached", ["/", ...manifest]);
            log("done installing");
        })());
    void sw.skipWaiting();
});


addEventListener('activate', (e: Event) => {
    (e as ExtendableEvent).waitUntil(
        (async () => {
            log("activating for", version);
            const keys = await caches.keys();
            await Promise.all(
                keys.map(key => key !== version && caches.delete(key))
            );
            log("done activating")
        })());
    (e as ExtendableEvent).waitUntil(sw.clients.claim());
});

sw.addEventListener("fetch", (event: FetchEvent) =>  {
    event.respondWith(
        (async () => {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse != null) {
                log(`${event.request.url} is cached`);
                return cachedResponse;
            }
            log(`${event.request.url} is NOT cached..`);
            const response = await fetch(event.request);
            if (event.request.url.startsWith(`https://botanami.apps.anasta.si/`)) {
                const cache = await caches.open(version);
                if (response.status === 200) {
                    await cache.put(event.request, response);
                    log(`Cached ${event.request.url}`);
                } else {
                    log(`Not caching ${event.request.url} as response status was ${response.status}`);
                }
            }
            return response;
        })(),
    );
});