/* Offline-first shell/data cache. Dynamic server pages and YouTube videos need internet. */
const CACHE = "navodaya-vijeta-shell-v2";
const CORE = ["/", "/favicon.svg", "/data/questions.json", "/data/chapters.json", "/data/papers.json"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE.map((url) => new Request(url, { cache: "reload" }))).catch(() => undefined)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("navodaya-vijeta-") && key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/data/")) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
      return response;
    })));
    return;
  }
  if (/\.(?:js|css|woff2?|png|svg|webp|ico)$/.test(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
      return response;
    })));
    return;
  }
  if (request.mode === "navigate" || url.pathname === "/favicon.svg") {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok && url.pathname === "/") caches.open(CACHE).then((cache) => cache.put("/", response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match("/")) || Response.error()));
  }
});
