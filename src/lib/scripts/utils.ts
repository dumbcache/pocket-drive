import { browser } from "$app/environment";
import { clearToken, getToken } from "$lib/scripts/login";
import ChildWorker from "$lib/scripts/worker.ts?worker";
import { clearDropItems } from "$lib/scripts/image";
import { goto } from "$app/navigation";
import {
    pocketStore,
    folderStore,
    fileStore,
    preferences,
    states,
    tempStore,
    imageCache,
    imageFetchLog,
    DATA_CACHE,
    progressStore,
    TEMP_CACHE,
    HOME_PATH,
} from "$lib/scripts/stores.svelte";

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

export function userLoggedIn() {
    return Boolean(window.localStorage.getItem("token")) && !isTokenExpired();
}

export function checkNetworkError(error: Error) {
    if (error instanceof TypeError && error?.message.includes("NetworkError")) {
        console.log("NET_ERROR");
    }
}

export async function clearTempCache() {
    await caches.delete(TEMP_CACHE);
}

export async function clearDataCache() {
    await caches.delete(DATA_CACHE);
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

export async function signUserOutPartial() {
    clearLocalImages();
    states.setPocketState(HOME_PATH);
    let preferences = window.localStorage.getItem("preferences");
    let recents = window.localStorage.getItem("recents");
    clearLocalStorage();
    window.localStorage.setItem("preferences", preferences);
    window.localStorage.setItem("recents", recents);
    clearTempCache();
}

export async function signUserOut() {
    clearLocalImages();
    clearDataCache();
    clearTempCache();
    let preferences = window.localStorage.getItem("preferences");
    clearLocalStorage();
    window.localStorage.setItem("preferences", preferences);
    clearSessionStorage();
    states.profile = false;
    states.setPocketState(HOME_PATH);
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
    clearTimeout(states.sessionTimeoutId);
    if (time > 0) {
        states.sessionTimeout = false;
        states.sessionTimeoutId = setTimeout(() => {
            clearToken();
            states.sessionTimeout = true;
            console.log("session timed out");
        }, time);
    } else {
        clearToken();
        states.sessionTimeout = true;
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
export const IMG_MIME_TYPE = "image/";
export const FILE_API = "https://www.googleapis.com/drive/v3/files";
export const FIELDS_IMG =
    "id,name,description,thumbnailLink,starred,mimeType,size";
export const FIELDS_FOLDER = "id,name,starred,parents";
export const FIELDS_COVER = "thumbnailLink";
export const FIELDS_SINGLE =
    "id,name,parents,description,starred,mimeType,thumbnailLink";
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
    { parent, mimeType, pageSize, pageToken, hidden }: ParamsObject,
    accessToken: string
) {
    pageSize ??= PAGESIZE;
    let mime =
        mimeType === FOLDER_MIME_TYPE
            ? `mimeType contains '${mimeType}'`
            : `mimeType contains '${mimeType}' or mimeType contains 'video/'`;
    let hide = hidden
        ? ""
        : "and not properties has { key='hidden' and value='true' }";
    let q = `q='${parent}' in parents and (${mime}) ${hide}`;
    let p = `&pageSize=${pageSize}`;
    let f = "";
    let t = "";
    if (pageSize === 3) {
        f = `&fields=files(${FIELDS_COVER})`;
    } else {
        f = `&fields=nextPageToken,files(${
            mimeType === IMG_MIME_TYPE ? FIELDS_IMG : FIELDS_FOLDER
        })`;
        t = Boolean(pageToken) === true ? `&pageToken=${pageToken}` : "";
    }
    let o =
        `&orderBy=` +
        (mimeType === FOLDER_MIME_TYPE ? "name" : "createdTime desc");
    let url = `${FILE_API}?${q}${f}${o}${t}${p}`;

    const req = new Request(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return req;
}

export function constructSearchRequest(
    { mimeType, pageSize, pageToken, search }: SearchParamsObject,
    accessToken: string
) {
    pageSize ??= PAGESIZE;
    let q = `q=mimeType contains '${mimeType}' and name contains '${search}'`;
    let p = `&pageSize=${pageSize}`;
    let f = `&fields=nextPageToken,files(${FIELDS_SINGLE})`;
    let t = Boolean(pageToken) === true ? `&pageToken=${pageToken}` : "";

    let o = `&orderBy=createdTime desc`;
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
            states.sessionTimeout === false && (states.sessionTimeout = true);
            return;
        }
    }
    return data;
};

export const updateFolder = async (
    name: string,
    id: string,
    token: string,
    parent?: string
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
            states.sessionTimeout === false && (states.sessionTimeout = true);
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

export async function searchHandler(
    searchParams: SearchParamsObject,
    token: string,
    signal?: AbortSignal
) {
    const req = constructSearchRequest(searchParams, token);
    const res = await fetch(req, { signal });
    if (res?.status === 200) {
        return await res?.json();
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
            if (updateCache) await (await caches.open(DATA_CACHE)).delete(req);
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
            fetchMultiple(
                {
                    parent,
                    mimeType: FOLDER_MIME_TYPE,
                    hidden: preferences.showHidden,
                },
                accessToken
            ),
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
        // setTimeout(() => {
        ele.src = url;
        // }, 1000);
    }
    tempStore.activeFile.download = url;
    tempStore.activeFile.loading = false;
    // activeImage.update((prev) => ({ ...prev, download: url }));
    // ele.nextElementSibling.style.display = "none";
}

if (browser) {
    childWorker = new ChildWorker();
    childWorker.onerror = (e) => console.warn(e);
    childWorker.onmessage = async ({ data }: { data: WorkerMessage }) => {
        let { parent, success, activeParent: aParent, view } = data;

        switch (data.context) {
            case "IMG_PREVIEW":
                let { id, blobURL } = data;
                setPreviewFile(id, blobURL);
                if (!imageCache.has(id)) {
                    imageCache.set(id, blobURL);
                }
                imageFetchLog.delete(id);
                return;

            case "EDIT":
                let imgMeta = data.imgMeta;
                if (aParent === tempStore.activeFolder!.id) {
                    fileStore.files = fileStore.files.map((file) => {
                        if (success.has(file.id)) {
                            imgMeta?.name && (file.name = imgMeta.name);
                            imgMeta?.description &&
                                (file.description = imgMeta.description);
                        }
                        return file;
                    });
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
                        success = new Set(success);
                        fileStore.files = fileStore.files.filter(
                            (file) => !success.has(file.id)
                        );
                        fileStore.set(files as GoogleDriveResponse<DriveFile>);
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
                let currentActiveParent = tempStore.activeFolder!.id;
                if (aParent === currentActiveParent) {
                    if (view === "FILE") {
                        fileStore.files = fileStore.files.filter(
                            (file) => !success.has(file.id)
                        );
                    } else {
                        folderStore.files = folderStore.files.filter(
                            (file) => !success.has(file.id)
                        );
                    }
                } else {
                    pocketStore.delete(tempStore.activeFolder?.id);
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
                let item = tempStore.dropItems.find((i) => i.id === data.id);
                item && (item.progress = data.status as string);
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
                    if (parent === tempStore.activeFolder.id) {
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
                        progressStore.update(0, 1, 0);
                        return;
                    }
                    progressStore.update(0, 0, 1);
                    ele.style.display = "initial";
                    return;
                }
                if (type === "COPY" || type === "EDIT") {
                    if (data.status === 1) {
                        progressStore.update(0, 1, 0);
                        return;
                    }
                    progressStore.update(0, 0, 1);
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
                if (states.mode !== "EDIT") states.mode = "";
                states.searchMode = false;
                states.profile = false;
                states.shortcuts = false;
                return;

            // case "a":
            // case "A":
            //     states.mask = !states.mask;
            //     return;

            case "c":
            case "C":
                preferences.toggleTheme();
                return;

            case "d":
            case "D":
                states.starred = !states.starred;
                return;

            case "e":
                if (states.mode === "EDIT") return;
                states.view = states.view === "FOLDER" ? "FILE" : "FOLDER";
                return;

            case "E":
                states.mode = "EDIT";
                return;

            case "h":
            case "H":
                states.shortcuts = !states.shortcuts;
                return;

            case "s":
            case "S":
                states.searchMode = true;
                return;
        }
    });

    globalThis.addEventListener("offline", () => (states.offline = true));

    globalThis.addEventListener("online", () => (states.offline = false));
}
