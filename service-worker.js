const CACHE = "euro-only-v1";
const ASSETS = ["./", "./index.html", "./style.css", "./app.js", "./manifest.json"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});
self.addEventListener("fetch", (e) => {
  if (ASSETS.some(a => e.request.url.endsWith(a.replace("./","")))) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
  }
});
