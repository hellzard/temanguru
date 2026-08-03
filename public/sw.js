const CACHE_VERSION = "temanguru-static-v2";
const STATIC_ASSETS = ["/offline", "/icons/icon.svg", "/icons/maskable-icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  const privatePath = ["/onboarding", "/dashboard", "/classes", "/attendance", "/journal", "/grades", "/students", "/schedule", "/settings", "/api", "/auth"].some((prefix) => url.pathname.startsWith(prefix));
  if (privatePath) {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && !response.headers.has("set-cookie")) {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
      }
      return response;
    })));
  }
});
