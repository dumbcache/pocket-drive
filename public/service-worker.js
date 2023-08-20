const s = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), l = [
  s + "/favicon.png",
  s + "/logo_192.png",
  s + "/logo_512.png",
  s + "/logo_mask_192.png",
  s + "/logo_mask_512.png",
  s + "/manifest.json"
], c = "1692559577098", o = self, i = `app-${c}`, p = `krabs_app-${c}`, h = `krabs_data-${c}`;
o.addEventListener("install", (e) => {
  async function a() {
    await (await caches.open(i)).addAll(l);
  }
  e.waitUntil(a());
});
o.addEventListener("activate", (e) => {
  async function a() {
    for (const t of await caches.keys())
      t !== p && t !== h && t != i && await caches.delete(t);
  }
  e.waitUntil(a());
});
o.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.mode === "navigate")
    return;
  const a = new URL(e.request.url);
  switch (a.host) {
    case self.location.host:
      e.respondWith(
        (async () => l.includes(a.pathname) ? (await caches.open(i)).match(a.pathname) : await fetch(e.request))()
      );
      break;
    case "www.googleapis.com":
      if (a.search === "?alt=media")
        return;
      e.respondWith(
        (async () => {
          const t = await caches.open(h), r = await t.match(e.request);
          if (r)
            return r;
          {
            const n = await fetch(e.request);
            return n.status === 200 && t.put(e.request, n.clone()), n;
          }
        })()
      );
      break;
    default:
      return;
  }
});
