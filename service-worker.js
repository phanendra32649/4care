// =============================
// 💖 Daily Tracker PWA Service Worker (Final)
// =============================

const CACHE_NAME = "daily-tracker-cache-v4";
const BASE_PATH = "/4care";
const ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/favicon.png`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/app.js`,
  `${BASE_PATH}/icons/android-launchericon-192-192.png`,
  `${BASE_PATH}/icons/android-launchericon-512-512.png`
];

// ✅ Install: cache the core app shell
self.addEventListener("install", (event) => {
  console.log("💖 Installing Service Worker and caching core assets...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
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
  self.clients.claim();
});

// ✅ Fetch: network-first for navigation, cache-first for assets
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET" || request.url.startsWith("chrome-extension")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(`${BASE_PATH}/index.html`))
    );
    return;
  }

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

// =============================
// 💌 Cute System Notifications
// =============================
self.addEventListener("message", (event) => {
  console.log("📩 Message received in SW:", event.data);
  
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body } = event.data;
    console.log("🔔 Showing system notification:", title);

    // 💖 Make it pop even when app not open
    self.registration.showNotification(title, {
      body,
      icon: `${BASE_PATH}/icons/android-launchericon-192-192.png`,
      badge: `${BASE_PATH}/icons/android-launchericon-72-72.png`,
      vibrate: [200, 100, 200],
      requireInteraction: true, // ⬅️ stays visible until user closes it
      tag: "pookie-reminder",   // ⬅️ prevents duplicates
    });
  }
});

// ✅ When user taps the notification → open app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(`${BASE_PATH}/index.html`));
});

