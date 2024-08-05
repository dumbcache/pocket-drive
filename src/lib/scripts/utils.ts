import { browser } from "$app/environment";
import { get } from "svelte/store";
import {
    fileStore,
    activeFolder,
    dropItems,
    pocketStore,
    imageCache,
    imageFetchLog,
    updateProgressStore,
    folderStore,
    setPocketState,
    CACHE_DATA,
    activeImage,
} from "$lib/scripts/stores";
import { clearToken, getToken } from "$lib/scripts/login";
import ChildWorker from "$lib/scripts/worker.ts?worker";
import { clearDropItems } from "$lib/scripts/image";
import { goto } from "$app/navigation";
import { appPreferences, appStates } from "$lib/scripts/state.svelte";

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

export function disableScrolling() {
    document.body.style.overflow = "hidden";
}

export function enableScorlling() {
    document.body.style.overflow = "auto";
}

// export function getToken() {
//     return window.localStorage.getItem("token") as string;
// }

export function isTokenExpired() {
    return (
        Date.now() - Number(window.localStorage.getItem("sessionTime")) > 5000
    );
}

export function checkLoginStatus() {
    return Boolean(window.localStorage.getItem("token")) && !isTokenExpired();
}

export function checkNetworkError(error: Error) {
    if (error instanceof TypeError && error?.message.includes("NetworkError")) {
        console.log("NET_ERROR");
    }
}

export function setTheme(t?: string) {
    let preferredtheme = t ?? window.localStorage.getItem("theme") ?? "";
    appPreferences.toggleTheme(preferredtheme as "" | "dark");
    const root = document.documentElement;
    let dark = root.classList.contains("dark");
    switch (preferredtheme) {
        case "dark":
            if (!dark) root.classList.add("dark");
            return;
        default:
            if (dark) root.classList.remove("dark");
            return;
    }
}

export function toggleTheme() {
    let newTheme = appPreferences.theme === "" ? "dark" : "";
    window.localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
}

export async function clearCache() {
    await caches.delete(CACHE_DATA);
}

export function clearLocalImages() {
    childWorker.postMessage({ context: "CLEAR_IMAGE_CACHE" });
}

export function clearLocalStorage() {
    window.localStorage.clear();
}

export function clearSessionStorage() {
    window.sessionStorage.clear();
}

export function signUserOutPartial() {
    clearLocalImages();
    let theme = window.localStorage.getItem("theme");
    let preferences = window.localStorage.getItem("preferences");
    let recents = window.localStorage.getItem("recents");
    clearLocalStorage();
    window.localStorage.setItem("preferences", preferences);
    window.localStorage.setItem("theme", theme);
    window.localStorage.setItem("recents", recents);
}

export async function signUserOut() {
    clearLocalImages();
    clearCache();
    let theme = window.localStorage.getItem("theme");
    let preferences = window.localStorage.getItem("preferences");
    clearLocalStorage();
    window.localStorage.setItem("theme", theme);
    window.localStorage.setItem("preferences", preferences);
    clearSessionStorage();
    setPocketState();
    appStates.profile = false;
    goto("/");
    console.info("logging user out");
}

export function setSessionTimeout(expires?: number) {
    if (expires) {
        expires = Date.now() + expires * 1000;
        window.localStorage.setItem("sessionTime", String(expires));
    } else {
        expires = Number(window.localStorage.getItem("sessionTime")) ?? 0;
    }

    let time = expires - Date.now();
    clearTimeout(appStates.sessionTimeoutId);
    if (time > 0) {
        appStates.sessionTimeout = false;
        appStates.sessionTimeoutId = setTimeout(() => {
            clearToken();
            appStates.sessionTimeout = true;
            console.log("session timed out");
        }, time);
    } else {
        clearToken();
        appStates.sessionTimeout = true;
    }
}

export function fetchImgPreview(id: string) {
    childWorker.postMessage({
        context: "IMG_PREVIEW",
        ids: [id],
        token: getToken(),
    });
}

/******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/

export const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
export const DIR_MIME_TYPE = "application/vnd.google-apps.folder";
export const IMG_MIME_TYPE = "image/";
export const FILE_API = "https://www.googleapis.com/drive/v3/files";
export const FIELDS_IMG =
    "id,name,description,thumbnailLink,starred,mimeType,size";
export const FIELDS_FOLDER = "id,name,starred,parents";
export const FIELDS_SINGLE = "id,name,parents";
// export const DEFAULT_PAGESIZE = 1000;
export const PAGESIZE = 100;

export const wait = (s: number) => new Promise((res) => setTimeout(res, s));

/***********************************************/

export async function makeFetch(request: Request) {
    try {
        return fetch(request);
    } catch (error) {
        console.log(error);
    }
}

export function constructRequest(
    { parent, mimeType, pageSize, pageToken }: ParamsObject,
    accessToken: string
) {
    let mime =
        mimeType === FOLDER_MIME_TYPE
            ? `mimeType contains '${mimeType}'`
            : `mimeType contains '${mimeType}' or mimeType contains 'video/'`;
    let q = `q='${parent}' in parents and (${mime})`;
    let p = `&pageSize=${pageSize || PAGESIZE}`;
    let f = `&fields=nextPageToken,files(${
        mimeType === IMG_MIME_TYPE ? FIELDS_IMG : FIELDS_FOLDER
    })`;
    // let f = `&fields=files(${
    //     mimeType === IMG_MIME_TYPE ? FIELDS_IMG : FIELDS_FOLDER
    // })`;
    let o =
        `&orderBy=` +
        (mimeType === FOLDER_MIME_TYPE ? "name" : "createdTime desc");
    let t = Boolean(pageToken) === true ? `&pageToken=${pageToken}` : "";
    let url = `${FILE_API}?${q}${f}${o}${t}${p}`;

    const req = new Request(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return req;
}

export const createFolder = async (
    name: string,
    parent: string,
    token: string
): Promise<any> => {
    const url = "https://www.googleapis.com/drive/v3/files/";
    let req = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parent],
        }),
    });
    let { status, statusText } = req;
    let data = (await req.json()) as CreateResourceResponse;
    if (status !== 200) {
        console.log(
            `error while creating root dir ${status} ${statusText}`,
            data
        );
        if (status === 401) {
            appStates.sessionTimeout === false &&
                (appStates.sessionTimeout = true);
            return;
        }
    }
    return data;
};

export const updateFolder = async (
    name: string,
    id: string,
    parent: string,
    token: string
): Promise<any> => {
    const { status, data } = await updateSingle(id, { name }, token);
    if (status !== 200) {
        return;
    }
    return data;
};

export const deleteFolder = async (
    id: string,
    parent: string,
    token: string
): Promise<any> => {
    const url = `https://www.googleapis.com/drive/v3/files/${id}`;
    let req = await fetch(url, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    let { status, statusText } = req;
    if (status !== 204) {
        console.log(
            `error while deleting root dir ${status} ${statusText}`,
            await req.text()
        );
        if (status === 401) {
            appStates.sessionTimeout === false &&
                (appStates.sessionTimeout = true);
            return;
        }
    }
};

export const createRootFolder = async (accessToken: string) => {
    const req = new Request(FILE_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            name: "Pocket_#Drive",
            mimeType: "application/vnd.google-apps.folder",
            folderColorRgb: colorPalette.Cardinal,
            description: "",
        }),
    });
    let res = await makeFetch(req);
    if (res?.status === 200) {
        return (await res?.json()) as CreateResourceResponse;
    }
};

export async function getRootFolder(accessToken: string): Promise<string> {
    let root = window.localStorage.getItem("root");
    if (root) return root;
    const req = new Request(
        `${FILE_API}?&pageSize=1&fields=files(id,name)&orderBy=createdTime`,
        {
            headers: { authorization: `Bearer ${accessToken}` },
        }
    );
    const res = await makeFetch(req);
    if (res?.status === 200) {
        const { files } = await res.json();
        if (files.length !== 0) {
            const id = files[0].id;
            window.localStorage.setItem("root", id);
            return id;
        }
        const { id } = await createRootDir(accessToken);
        window.localStorage.setItem("root", id);
        return id;
    }
}

export async function searchHandler(token: string, search: string) {
    const req = new Request(
        FILE_API +
            `?q=mimeType contains '${DIR_MIME_TYPE}' and name contains '${search}'&pageSize=1000&fields=files(${FIELDS_SINGLE})&orderBy=createdTime desc`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const res = await makeFetch(req);
    if (res?.status === 200) {
        return (await res?.json()).files;
    }
}

export async function fetchMultiple(
    params: ParamsObject,
    accessToken: string,
    updateCache: Boolean = false,
    stopNewReq: Boolean = false
): Promise<GoogleDriveResponse<DriveFolder | DriveFile>> {
    return new Promise(async (resolve, reject) => {
        const req = constructRequest(params, accessToken);
        try {
            if (updateCache) await (await caches.open(CACHE_DATA)).delete(req);
            if (stopNewReq) {
                resolve();
                return;
            }
        } catch (error) {
            console.log(error);
        }
        const res = await makeFetch(req);
        if (res.status < 200 || res.status > 300) {
            reject(res);
            return;
        }
        resolve(res?.json() as Promise<GoogleDriveResponse>);
        return;
    });
}

export async function fetchSingle(
    id: string,
    mimeType: "FOLDER" | "IMG",
    accessToken: string
): Promise<DriveFile> {
    let req = new Request(
        `${FILE_API}/${id}?fields=${
            mimeType === "FOLDER" ? FIELDS_FOLDER : FIELDS_IMG
        }`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    const res = await makeFetch(req);
    return res?.json();
}

export const moveSingle = async (
    parent: string,
    id: string,
    accessToken: string
): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        let req = new Request(`${FILE_API}/${id}?addParents=${parent}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const res = await makeFetch(req);
        resolve(res?.status);
    });
};

export const updateSingle = async (
    id: string,
    imgMeta: ImgMeta,
    accessToken: string
) => {
    let req = new Request(`${FILE_API}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(imgMeta),
    });
    const res = await makeFetch(req);
    let data = (await res.json()) as CreateResourceResponse;
    return { status: res?.status, data };
};

export const loadAll = (
    parent: string,
    accessToken: string
): Promise<GoogleDriveResponse[]> => {
    return new Promise(async (resolve, reject) => {
        const proms = [
            fetchMultiple({ parent, mimeType: FOLDER_MIME_TYPE }, accessToken),
            fetchMultiple({ parent, mimeType: IMG_MIME_TYPE }, accessToken),
        ];
        Promise.all(proms)
            .then((data) => {
                resolve(data);
            })
            .catch(async (error) => {
                console.warn(await error.text());
                resolve([]);
            });
    });
};

export async function afterFolderAction(parent: string, accessToken: string) {
    fetchMultiple({ parent, mimeType: FOLDER_MIME_TYPE }, accessToken, true);
}

/******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/

export function setPreviewFile(id: string, url: string) {
    let preview = document.querySelector(".preview");
    let ele = preview?.querySelector(`[data-id="${id}"]`) as
        | HTMLImageElement
        | HTMLVideoElement;
    if (!ele) return;
    if (ele.localName === "img") {
        ele.src = url;
    } else if (ele.localName === "video") {
        setTimeout(() => {
            ele.src = url;
        }, 1000);
    }
    activeImage.update((prev) => ({ ...prev, download: url }));
    ele.nextElementSibling.style.display = "none";
}

if (browser) {
    childWorker = new ChildWorker();
    childWorker.onerror = (e) => console.warn(e);
    childWorker.onmessage = async ({ data }: { data: WorkerMessage }) => {
        let { parent, success, activeParent: aParent, view } = data;

        switch (data.context) {
            case "IMG_PREVIEW":
                let { id, blob } = data;
                let url = URL.createObjectURL(blob);
                setPreviewFile(id, url);
                if (!imageCache.has(id)) {
                    imageCache.set(id, url);
                }
                imageFetchLog.delete(id);
                return;

            case "EDIT":
                let imgMeta = data.imgMeta;
                if (aParent === get(activeFolder).id) {
                    fileStore.update((prev) => ({
                        nextPageToken: prev?.nextPageToken,
                        files: prev?.files.map((file) => {
                            if (success.has(file.id)) {
                                imgMeta?.name && (file.name = imgMeta.name);
                                imgMeta?.description &&
                                    (file.description = imgMeta.description);
                            }
                            return file;
                        }),
                    }));
                }
                fetchMultiple(
                    { parent: aParent, mimeType: IMG_MIME_TYPE },
                    getToken(),
                    true
                );

                return;

            case "TOP":
            case "COPY":
                fetchMultiple(
                    { parent, mimeType: IMG_MIME_TYPE },
                    getToken(),
                    true
                ).then((files) => {
                    if (data?.context === "TOP") {
                        fileStore.set(files);
                    }

                    if (pocketStore.has(parent)) {
                        pocketStore.set(parent, {
                            ...pocketStore.get(parent),
                            files: files,
                        });
                    }
                });
                fetchMultiple(
                    { parent, mimeType: IMG_MIME_TYPE, pageSize: 3 },
                    getToken(),
                    true
                );
                return;
            case "MOVE":
            case "DELETE":
                success = new Set(success);
                let currentActiveParent = get(activeFolder).id;
                if (aParent === currentActiveParent) {
                    if (view === "FILE") {
                        fileStore.update((prev) => ({
                            nextPageToken: prev?.nextPageToken,
                            files: prev?.files.filter(
                                (file) => !success.has(file.id)
                            ),
                        }));
                    } else {
                        folderStore.update((prev) => ({
                            nextPageToken: prev?.nextPageToken,
                            files: prev?.files.filter(
                                (file) => !success.has(file.id)
                            ),
                        }));
                    }
                } else {
                    pocketStore.delete(activeFolder);
                }
                parent && pocketStore.delete(parent);

                if (view === "FILE") {
                    fetchMultiple(
                        { parent: aParent, mimeType: IMG_MIME_TYPE },
                        getToken(),
                        true
                    );
                    fetchMultiple(
                        {
                            parent: aParent,
                            mimeType: IMG_MIME_TYPE,
                            pageSize: 3,
                        },
                        getToken(),
                        true
                    );
                    if (parent) {
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
                    }
                } else {
                    fetchMultiple(
                        { parent: aParent, mimeType: FOLDER_MIME_TYPE },
                        getToken(),
                        true
                    );
                    if (data.context === "MOVE") {
                        fetchMultiple(
                            {
                                parent: aParent,
                                mimeType: FOLDER_MIME_TYPE,
                                pageSize: 500,
                            },
                            getToken(),
                            true,
                            true
                        );
                    }
                    if (parent) {
                        fetchMultiple(
                            { parent, mimeType: FOLDER_MIME_TYPE },
                            getToken(),
                            true
                        );
                    }
                }

                return;

            case "DROP":
                clearDropItems();
                dropItems.set(
                    get(dropItems).map((item) => {
                        if (item.id === data.id) item.progress = data.status;
                        return item;
                    })
                );
                setTimeout(async () => {
                    const res = await fetchMultiple(
                        { parent, mimeType: IMG_MIME_TYPE },
                        getToken(),
                        true
                    );
                    fetchMultiple(
                        {
                            parent,
                            mimeType: IMG_MIME_TYPE,
                            pageSize: 3,
                        },
                        getToken(),
                        true
                    );
                    if (parent === get(activeFolder).id) {
                        fileStore.set(res);
                    } else {
                        pocketStore.delete(parent);
                    }
                }, 2000);
                return;

            case "PROGRESS":
                let type = data.progressType;
                if (type === "DELETE" || type === "MOVE" || type === "TOP") {
                    let ele = document.querySelector(`[data-id="${data.id}"]`);
                    if (data.status === 1) {
                        ele?.remove();
                        updateProgressStore(0, 1, 0);
                        return;
                    }
                    updateProgressStore(0, 0, 1);
                    ele.style.display = "initial";
                    return;
                }
                if (type === "COPY" || type === "EDIT") {
                    if (data.status === 1) {
                        updateProgressStore(0, 1, 0);
                        return;
                    }
                    updateProgressStore(0, 0, 1);
                    return;
                }
                if (type === "DROP") {
                    let dropItem = document.querySelector(
                        `.drop-item[data-id="${data.id}"]`
                    );
                    dropItem.querySelector(
                        ".progress-count"
                    ).innerHTML = `${data.progress}%`;
                }
                return;

            case "IDB_RELOAD_REQUIRED":
                return;
        }
    };

    globalThis.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.ctrlKey) return;
        switch (e.key) {
            case "Escape":
                if (appStates.mode !== "edit") appStates.mode = "";
                appStates.profile = false;
                appStates.shortcuts = false;
                return;

            case "a":
            case "A":
                appStates.mask = !appStates.mask;
                return;

            case "c":
            case "C":
                toggleTheme();
                return;

            case "d":
            case "D":
                appStates.starred = !appStates.starred;
                return;

            case "e":
                appStates.view =
                    appStates.view === "FOLDER" ? "FILE" : "FOLDER";
                return;

            case "E":
                appStates.mode = "edit";
                return;

            case "h":
            case "H":
                appStates.shortcuts = !appStates.shortcuts;
                return;

            case "s":
            case "S":
                appStates.mode = "search";
                return;
        }
    });

    globalThis.addEventListener("offline", () => {
        window.alert("No Internet connection");
    });

    // navigator.serviceWorker.addEventListener("message", (event) => {
    //     if (event.data && event.data.type === "SHARED_FILES") {
    //         window.alert("message received");
    //     }
    // });
}
