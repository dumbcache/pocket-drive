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
    fileStore,
    activeParent,
    recentStore,
    dropItems,
    previewLoading,
    editProgress,
} from "$lib/scripts/stores";
import ChildWorker from "$lib/scripts/worker.ts?worker";
import { clearDropItems } from "$lib/scripts/image";

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

export function checkLoginStatus() {
    if (browser) {
        return (
            Boolean(window.localStorage.getItem("token")) && !isTokenExpired()
        );
    }
}

export function signUserOutPartial() {
    childWorker.postMessage({ context: "CLEAR_IMAGE_CACHE" });
    let theme = window.localStorage.getItem("theme");
    let refreshTime = window.localStorage.getItem("refreshTime");
    window.localStorage.clear();
    window.localStorage.setItem("theme", theme);
    window.localStorage.setItem("refreshTime", refreshTime);
}

export async function signUserOut() {
    await clearFiles();
    console.info("logging user out");
}

export async function clearFiles() {
    childWorker.postMessage({ context: "CLEAR_IMAGE_CACHE" });
    await caches.delete("pd-data");
    let theme = window.localStorage.getItem("theme");
    window.localStorage.clear();
    window.localStorage.setItem("theme", theme);
}

export async function setCache(refresh: Boolean) {
    let name = "pd-data";
    dataCacheName.set(name);
    if (!refresh) return;
    await caches.delete(name);
    // let parent = getRoot();
    // let token = getToken();
    // fetchMultiple({ parent, mimeType: FOLDER_MIME_TYPE }, token, false);
    // fetchMultiple({ parent, mimeType: IMG_MIME_TYPE }, token, false);
}

export function checkSessionTimeout(time: number) {
    activeTimeout.set(
        setTimeout(() => {
            if (isTokenExpired()) {
                console.log("session timed out");
                sessionTimeout.set(true);
            } else {
                clearTimeout(get(activeTimeout));
                checkSessionTimeout(time);
            }
        }, time)
    );
}

export function setSessionTimeout(expires?: number) {
    expires &&
        window.localStorage.setItem(
            "sessionTime",
            String(Date.now() + expires * 1000)
        );
    sessionTimeout.set(false);
    let time = Number(window.localStorage.getItem("sessionTime")) - Date.now();
    checkSessionTimeout(time);
}

export function setRefreshTimeout() {
    let time = Number(window.localStorage.getItem("refreshTime")) - Date.now();
    let id = get(activeRefreshTimeout);
    id && clearTimeout(id);
    if (time > 0) {
        activeRefreshTimeout.set(setTimeout(setRefreshTimeout, time));
        return;
    }
    time = Date.now() + 24 * 60 * 60 * 1000;
    window.localStorage.setItem("refreshTime", String(time));
    setCache(true);
    activeRefreshTimeout.set(setTimeout(setRefreshTimeout, time));
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
    previewLoading.set(true);
    if (img) {
        url = img.src;
        img.src = src;
        URL.revokeObjectURL(url);
    }
    const [file] = get(fileStore)?.files.filter((file) => file.id === id);
    activeImage.set(file);
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

/******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/

export const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
export const DIR_MIME_TYPE = "application/vnd.google-apps.folder";
export const IMG_MIME_TYPE = "image/";
export const FILE_API = "https://www.googleapis.com/drive/v3/files";
export const FIELDS_IMG = "id,name,description,thumbnailLink,starred,mimeType";
export const FIELDS_FOLDER = "id,name,starred,parents";
export const FIELDS_SINGLE = "id,name,parents";
export const DEFAULT_PAGESIZE = 1000;
export const PAGESIZE = 100;

export const wait = (s: number) => new Promise((res) => setTimeout(res, s));

/***********************************************/

export async function makeFetch(request: Request) {
    try {
        const res = await fetch(request);
        if (res.status < 200 || res.status > 300) {
            console.info(await res.text());
            return;
        }
        return res;
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
    let url = `${FILE_API}?${q}${f}${p}${o}${t}`;

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
            get(sessionTimeout) === false && sessionTimeout.set(true);
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
            get(sessionTimeout) === false && sessionTimeout.set(true);
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
    updateCache: Boolean = false
): Promise<GoogleFileResponse> {
    return new Promise(async (resolve, reject) => {
        const req = constructRequest(params, accessToken);
        try {
            if (updateCache) await (await caches.open("pd-data")).delete(req);
        } catch (error) {
            console.log(error);
        }
        const res = await makeFetch(req);
        resolve(res?.json() as Promise<GoogleFileResponse>);
        return;
    });
}

export async function fetchSingle(
    id: string,
    mimeType: "FOLDER" | "IMG",
    accessToken: string
): Promise<GoogleFile> {
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

export function moveMulitple(
    parent: string,
    data: string[],
    accessToken: string
) {
    let proms = [];
    for (let id of data) {
        proms.push(moveSingle(parent, id, accessToken));
    }
    Promise.allSettled(proms).then(() => {
        postMessage({ context: "MOVE", parent });
    });
}

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
): Promise<GoogleFileResponse[]> => {
    return new Promise(async (resolve, reject) => {
        const proms = [
            fetchMultiple({ parent, mimeType: FOLDER_MIME_TYPE }, accessToken),
            fetchMultiple({ parent, mimeType: IMG_MIME_TYPE }, accessToken),
        ];
        Promise.all(proms)
            .then((data) => {
                resolve(data);
            })
            .catch(async (e) => {
                console.warn(e);
                if (e.status === 401) {
                    get(sessionTimeout) === false && sessionTimeout.set(true);
                    return;
                }
            });
    });
};

export async function afterFolderAction(parent: string, accessToken: string) {
    fetchMultiple({ parent, mimeType: FOLDER_MIME_TYPE }, accessToken, true);
}

/******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/

if (browser) {
    childWorker = new ChildWorker();
    childWorker.onerror = (e) => console.warn(e);
    childWorker.onmessage = async ({ data }) => {
        let parent: string, aParent: string, set: Set;
        switch (data.context) {
            case "IMG_PREVIEW":
                const { id, blob } = data;
                const img = document.querySelector(
                    `.preview-img`
                ) as HTMLImageElement;
                const video = document.querySelector(
                    `.preview-video`
                ) as HTMLVideoElement;
                if (img && img.dataset.id !== id) return;
                let active = get(activeImage);
                if (blob.type.match("video/")) {
                    let url = video.src;
                    video.style.display = "block";
                    img.style.display = "none";
                    setTimeout(() => {
                        video.src = URL.createObjectURL(blob);
                    }, 0);
                    video.poster = active.thumbnailLink;
                    URL.revokeObjectURL(url);
                    previewLoading.set(false);
                    return;
                }

                let url = URL.createObjectURL(blob);
                img.src = url;
                video.style.display = "none";
                img.style.display = "block";
                previewLoading.set(false);
                return;

            case "EDIT":
                fileStore.set(
                    await fetchMultiple(
                        { parent: data.parent, mimeType: IMG_MIME_TYPE },
                        getToken(),
                        true
                    )
                );
                editProgress.set(false);
                return;

            case "COPY":
                parent = data.parent;
                fetchMultiple(
                    { parent, mimeType: IMG_MIME_TYPE },
                    getToken(),
                    true
                ).then((files) => {
                    data.top && fileStore.set(files);
                });
                fetchMultiple(
                    { parent, mimeType: IMG_MIME_TYPE, pageSize: 3 },
                    getToken(),
                    true
                );
                editProgress.set(false);
                return;
            case "MOVE":
                parent = data.parent;
                aParent = data.activeParent;
                set = new Set(data?.set);
                if (aParent === get(activeParent).id) {
                    fileStore.update((prev) => ({
                        nextPageToken: prev?.nextPageToken,
                        files: prev?.files.filter((file) => !set.has(file.id)),
                    }));
                }
                editProgress.set(false);
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
                return;

            case "DELETE":
                aParent = data.activeParent;
                set = new Set(data.set);
                if (aParent === get(activeParent).id) {
                    fileStore.update((prev) => ({
                        nextPageToken: prev?.nextPageToken,
                        files: prev?.files.filter((file) => !set.has(file.id)),
                    }));
                }
                editProgress.set(false);
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
                return;
            case "DROP_SAVE":
                clearDropItems();
                parent = data.parent;
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
                    if (parent === get(activeParent).id) {
                        fileStore.set(res);
                    }
                }, 2000);
                return;

            case "DROP_PROGRESS":
                let dropItem = document.querySelector(
                    `.drop-item[data-id="${data.id}"]`
                );
                dropItem.querySelector(
                    ".progress-count"
                ).innerHTML = `${data.progress}%`;
                return;

            case "PROGRESS":
                if (data.type === "DELETE" || data.type === "MOVE") {
                    if (data.status === 1) {
                        document
                            .querySelector(`[data-id="${data.id}"]`)
                            ?.remove();
                        return;
                    }
                }
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
