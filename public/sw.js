const CACHE_VERSION = "temanguru-static-v4";
const STATIC_ASSETS = [
  "/workspace",
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
];
const PRIVATE_PREFIXES = [
  "/onboarding", "/dashboard", "/classes", "/attendance", "/journal",
  "/grades", "/students", "/schedule", "/settings", "/events", "/meetings",
  "/operations", "/portfolios", "/connect", "/record", "/assessment",
  "/documents", "/school", "/api", "/auth",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("temanguru-") && key !== CACHE_VERSION).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && url.pathname.startsWith("/workspace")) {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) void caches.open(CACHE_VERSION).then((cache) => cache.put("/workspace", response.clone()));
      return response;
    }).catch(() => caches.match("/workspace").then((cached) => cached || caches.match("/offline"))));
    return;
  }

  const isPrivate = PRIVATE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
  if (isPrivate || request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.endsWith(".png")) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && response.type === "basic" && !response.headers.has("set-cookie")) {
        const copy = response.clone();
        void caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
      }
      return response;
    })));
  }
});
