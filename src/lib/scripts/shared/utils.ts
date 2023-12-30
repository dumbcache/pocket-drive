import { browser } from "$app/environment";
import { get } from "svelte/store";
import {
    activeRefreshTimeout,
    activeTimeout,
    dataCacheName,
    sessionTimeout,
    activeImage,
    mode,
    activeView,
    progress,
    fileStore,
    activeParent,
    recentStore,
    dropItems,
} from "$lib/scripts/shared/stores";
import ChildWorker from "$lib/scripts/worker.ts?worker";
import { IMG_MIME_TYPE, fetchMultiple } from "$lib/scripts/gdrive/utils";
import { clearDropItems } from "$lib/scripts/shared/image";

export let childWorker: Worker;

export const colorPalette = {
    ChocolateIceCream: "#ac725e",
    OldBrickRed: "#d06b64",
    Cardinal: "#f83a22",
    WildStraberries: "#fa573c",
    MarsOrange: "#ff7537",
    YellowCab: "#ffad46",
    Spearmint: "#42d692",
    VernFern: "#16a765",
    Asparagus: "#7bd148",
    SlimeGreen: "#b3dc6c",
    DesertSand: "#fbe983",
    Macaroni: "#fad165",
    SeaFoam: "#92e1c0",
    Pool: "#9fe1e7",
    Denim: "#9fc6e7",
    RainySky: "#4986e7",
    BlueVelvet: "#9a9cff",
    PurpleDino: "#b99aff",
    Mouse: "#8f8f8f",
    MountainGrey: "#cabdbf",
    Earthworm: "#cca6ac",
    BubbleGum: "#f691b2",
    PurpleRain: "#cd74e6",
    ToyEggplant: "#a47ae2",
};

export function isValidUrl(url: string) {
    try {
        new URL(url);
        return url;
    } catch (err) {
        return "";
    }
}

export function toTitleCase(str: string) {
    return str
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/\s+/g, " ")
        .trim();
}

export function getRoot() {
    return window.localStorage.getItem("root") as string;
}

export function getToken() {
    return window.localStorage.getItem("token") as string;
}

export function isTokenExpired() {
    return Date.now() > Number(window.localStorage.getItem("sessionTime"));
}

export function isRefreshNeeded() {
    return Date.now() > Number(window.localStorage.getItem("refreshTime"));
}

export function checkLoginStatus() {
    if (browser) {
        return (
            Boolean(window.localStorage.getItem("token")) && !isTokenExpired()
        );
    }
}

export function signUserOut() {
    clearFiles();
    console.info("logging user out");
}

export async function clearFiles() {
    childWorker.postMessage({ context: "CLEAR_IMAGE_CACHE" });
    (await caches.keys()).forEach(
        (key) => key.startsWith("pd-") && caches.delete(key)
    );
    window.localStorage.clear();
}

export async function setCache(refresh: Boolean) {
    for (let key of await caches.keys()) {
        if (key.startsWith("pd-data")) {
            dataCacheName.set(key);
            refresh && caches.delete(key);
        }
    }
}

export function checkRefreshTimeout() {
    let time = Number(window.localStorage.getItem("refreshTime")) - Date.now();
    time < 0 &&
        activeRefreshTimeout.set(
            setTimeout(() => {
                if (isRefreshNeeded()) {
                    setCache(true);
                } else {
                    clearTimeout(get(activeRefreshTimeout));
                    checkRefreshTimeout();
                    setCache(false);
                }
            }, time)
        );
}
export function checkSessionTimeout() {
    let time = Number(window.localStorage.getItem("sessionTime")) - Date.now();
    time < 0 &&
        activeTimeout.set(
            setTimeout(() => {
                if (isTokenExpired()) {
                    sessionTimeout.set(true);
                } else {
                    clearTimeout(get(activeTimeout));
                    checkSessionTimeout();
                }
            }, time)
        );
}

export function setSessionTimeout(expires: number) {
    window.localStorage.setItem(
        "sessionTime",
        String(Date.now() + expires * 1000)
    );
    sessionTimeout.set(false);
    checkSessionTimeout();
}

export function setRefreshTimeout() {
    let time = Number(window.localStorage.getItem("refreshTime")) - Date.now();
    if (time > 0) return;
    window.localStorage.setItem(
        "refreshTime",
        String(Date.now() + 24 * 60 * 60 * 1000)
    );
    checkRefreshTimeout();
}

export const updateRecents = (data?: { name: string; id: string }) => {
    let old =
        (JSON.parse(window.localStorage.getItem("recents")!) as {
            name: string;
            id: string;
        }[]) ?? [];
    if (old.length === 0 && !data) return;
    if (data) {
        if (old?.length === 10) {
            old.pop();
        }
        old = old.filter((item) => item.id !== data.id);
        old.unshift(data);
    }
    recentStore.set(old);
    window.localStorage.setItem("recents", JSON.stringify(old));
};

export function fetchImgPreview(id: string) {
    childWorker.postMessage({
        context: "IMG_PREVIEW",
        id,
        token: getToken(),
    });
}

export function setActiveImage(id: string, src: string) {
    let url = "";
    let img = document.querySelector(".preview-img") as HTMLImageElement;
    if (img && img.dataset.id === id) return;
    fetchImgPreview(id);
    if (img) {
        url = img.src;
        img.src = src;
        URL.revokeObjectURL(url);
    }
    activeImage.set({ id, src });
}

export function changeImage(direction: "PREV" | "NEXT") {
    const thumbs = document.querySelector(".thumbs");
    if (!thumbs) return;
    const active = thumbs.querySelector(`[data-id="${get(activeImage).id}"]`);
    const ele = (
        direction === "PREV"
            ? active?.previousSibling?.firstChild
            : active?.nextSibling?.firstChild
    ) as HTMLImageElement;
    if (!ele) return;
    setActiveImage(ele.dataset.id!, ele.src);
    ele.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
    });
}

if (browser) {
    childWorker = new ChildWorker();
    childWorker.onerror = (e) => console.warn(e);
    childWorker.onmessage = async ({ data }) => {
        let parent: string, set: Set;
        switch (data.context) {
            case "IMG_PREVIEW":
                const { id, blob } = data;

                const img = document.querySelector(
                    `.preview-img`
                ) as HTMLImageElement;

                if (img.dataset.id !== id) return;
                let url = URL.createObjectURL(blob);
                img.src = url;
                return;

            case "MOVE":
                parent = data.parent;
                set = new Set(data.set);
                fileStore.update((prev) => ({
                    nextPageToken: prev?.nextPageToken,
                    files: prev?.files.filter((file) => !set.has(file.id)),
                }));
                progress.set(false);
                fetchMultiple(
                    { parent, mimeType: IMG_MIME_TYPE },
                    getToken(),
                    true
                );
                fetchMultiple(
                    { parent, mimeType: IMG_MIME_TYPE, pageSize: 3 },
                    getToken(),
                    true
                );
                fetchMultiple(
                    { parent: get(activeParent).id, mimeType: IMG_MIME_TYPE },
                    getToken(),
                    true
                );
                fetchMultiple(
                    {
                        parent: get(activeParent).id,
                        mimeType: IMG_MIME_TYPE,
                        pageSize: 3,
                    },
                    getToken(),
                    true
                );
                return;

            case "DELETE":
                set = new Set(data.set);
                fileStore.update((prev) => ({
                    nextPageToken: prev?.nextPageToken,
                    files: prev?.files.filter((file) => !set.has(file.id)),
                }));
                progress.set(false);
                fetchMultiple(
                    { parent: get(activeParent).id, mimeType: IMG_MIME_TYPE },
                    getToken(),
                    true
                );
                fetchMultiple(
                    {
                        parent: get(activeParent).id,
                        mimeType: IMG_MIME_TYPE,
                        pageSize: 3,
                    },
                    getToken(),
                    true
                );
                return;
            case "DROP_SAVE":
                let successSet = new Set();
                let failureSet = new Set();
                let parentSet = new Set();
                data.data.forEach((item) => {
                    if (item.value.status === "success") {
                        successSet.add(item.value.id);
                        parentSet.add(item.value.parent);
                    }
                });
                data.data.forEach(
                    (item) =>
                        item.value.status === "failure" &&
                        failureSet.add(item.value.parent)
                );
                dropItems.set(
                    get(dropItems).map((item) => {
                        if (successSet.has(item.id)) {
                            item.progress = "success";
                            return item;
                        }
                        failureSet.has(item.id) && (item.progress = "failure");
                        return item;
                    })
                );
                setTimeout(() => {
                    clearDropItems();
                    let token = getToken();
                    parentSet.forEach(async (parent) => {
                        const data = await fetchMultiple(
                            { parent, mimeType: IMG_MIME_TYPE },
                            token,
                            true
                        );
                        fetchMultiple(
                            { parent, mimeType: IMG_MIME_TYPE, pageSize: 3 },
                            token,
                            true
                        );
                        if (parent === get(activeParent).id) {
                            fileStore.set(data);
                        }
                    });
                }, 5000);
                return;

            case "IDB_RELOAD_REQUIRED":
                return;
        }
    };

    globalThis.addEventListener("keydown", (e: KeyboardEvent) => {
        switch (e.key) {
            case "Escape":
                mode.set("");
                return;
            case "e":
                activeView.update((prev) =>
                    prev === "FOLDER" ? "FILE" : "FOLDER"
                );
                return;
        }
    });
}
