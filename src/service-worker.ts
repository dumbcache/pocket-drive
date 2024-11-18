/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from "$service-worker";

const sw = self as unknown as ServiceWorkerGlobalScope;

const STATIC_CACHE = `pd-static`;
const APP_CACHE = `pd-app`;
const DATA_CACHE = `pd-data`;
const TEMP_CACHE = "pd-temp";

/***************** SW Event Listners****************/
sw.addEventListener("install", (e) => {
    async function addFilesToCache() {
        const cache1 = await caches.open(STATIC_CACHE);
        await cache1.addAll(files);
        // const cache2 = await caches.open(CACHE_APP);
        // await cache2.addAll(build);
    }
    e.waitUntil(addFilesToCache());
});

sw.addEventListener("activate", (e) => {
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== APP_CACHE && key !== DATA_CACHE && key != STATIC_CACHE)
                await caches.delete(key);
        }
    }

    e.waitUntil(deleteOldCaches());
});

// async function handleShareTarget(event) {
//     try {
//         const formData = await event.request.formData();
//         const title = formData.get("title");
//         const text = formData.get("text");
//         const url = formData.get("url");
//         const files = formData.getAll("file");

//         const fileData = files.map((file) => ({
//             title,
//             text,
//             url,
//             fileName: file.name,
//             fileType: file.type,
//             fileContent: file.arrayBuffer(),
//         }));

//         // Await all fileContent promises to resolve
//         await Promise.all(
//             fileData.map(async (fd) => {
//                 fd.fileContent = await fd.fileContent;
//             })
//         );

//         // Send a message to the client with the shared data
//         const clients = await self.clients.matchAll({
//             includeUncontrolled: true,
//         });
//         for (const client of clients) {
//             client.postMessage({
//                 type: "SHARED_FILES",
//                 data: fileData,
//             });
//         }

//         // Redirect to a page where you can display the received files
//         return Response.redirect("/display.html");
//     } catch (error) {
//         console.error("Error handling share target:", error);
//         return new Response("Error handling share target", { status: 500 });
//     }
// }

sw.addEventListener("fetch", (e) => {
    // if (e.request.url.endsWith("/share-target")) {
    //     e.respondWith(handleShareTarget(e));
    //     return;
    // }
    if (e.request.method !== "GET") return;
    if (e.request.mode === "navigate") return;
    const url = new URL(e.request.url);
    switch (url.host) {
        case self.location.host:
            e.respondWith(
                (async () => {
                    if (files.includes(url.pathname)) {
                        const cache = await caches.open(STATIC_CACHE);
                        return cache.match(url.pathname) as Promise<Response>;
                        // } else if (build.includes(url.pathname)) {
                        //     const cache = await caches.open(CACHE_APP);
                        //     return cache.match(url.pathname) as Promise<Response>;
                    } else {
                        const response = await fetch(e.request);
                        // if (response.status === 200) {
                        //     const cache = await caches.open(CACHE_APP);
                        //     cache.put(e.request, response.clone());
                        // }
                        return response;
                    }
                })()
            );
            break;

        case "www.googleapis.com":
            if (url.search === "?alt=media") return;
            if (url.searchParams.has("pageToken")) return;

            if (url.searchParams.get("q")?.includes("name contains")) {
                e.respondWith(
                    (async () => {
                        const cache = await caches.open(TEMP_CACHE);
                        const cacheData = await cache.match(e.request);
                        if (cacheData) {
                            return cacheData;
                        } else {
                            const response = await fetch(e.request);
                            if (response.status === 200) {
                                cache.put(e.request, response.clone());
                            }
                            return response;
                        }
                    })()
                );
            }

            e.respondWith(
                (async () => {
                    const cache = await caches.open(DATA_CACHE);
                    const cacheData = await cache.match(e.request);
                    if (cacheData) {
                        return cacheData;
                    } else {
                        const response = await fetch(e.request);
                        if (response.status === 200) {
                            cache.put(e.request, response.clone());
                        }
                        return response;
                    }
                })()
            );
            break;
        default:
            // e.respondWith(fetch(e.request));
            return;
    }
});
