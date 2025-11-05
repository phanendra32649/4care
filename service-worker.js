// =============================
// 💖 Daily Tracker PWA Service Worker
// =============================
const CACHE_NAME = "daily-tracker-cache-v2"; // increment this when you update files
const ASSETS = [
  "/", // root path
  "/index.html",
  "/favicon.png",
  "/manifest.webmanifest", // match your actual filename
  "/style.css",
  "/app.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// ✅ Install: cache core assets (App Shell)
self.addEventListener("install", (event) => {
  console.log("💖 Installing Service Worker and caching app shell...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // activate worker immediately
});

// ✅ Activate: remove old caches
self.addEventListener("activate", (event) => {
  console.log("⚙️ Activating new Service Worker...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // take control of all pages
});

// ✅ Fetch: network-first strategy for API, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Ignore non-GET or Chrome extension requests
  if (request.method !== "GET" || request.url.startsWith("chrome-extension")) {
    return;
  }

  // For HTML (navigation) requests → network first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // For everything else → cache first, then network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => cachedResponse)
      );
    })
  );
});
