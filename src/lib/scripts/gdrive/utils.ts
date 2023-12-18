import { get } from "svelte/store";
import { dataCacheName, searchItems, sessionTimeout } from "../shared/stores";
import { fetchDirs } from "./folder";
import { fetchImgs } from "./file";
import { checkLoginStatus, colorPalette } from "../shared/utils";
import { activeParentId, recents, refreshClicked } from "../stores";

export const DIR_MIME_TYPE = "application/vnd.google-apps.folder";
export const IMG_MIME_TYPE = "image/";
export const FILE_API = "https://www.googleapis.com/drive/v3/files";
export const FIELDS_REQUIRED =
    "files(id,name,description,appProperties(origin),thumbnailLink,starred)";

export const wait = (s: number) => new Promise((res) => setTimeout(res, s));

export function constructAPI(
    parent: string,
    mimeType: string,
    pageSize?: number,
    pageToken?: string
) {
    let api = `${FILE_API}?q='${parent}' in parents and mimeType contains '${mimeType}'&fields=${FIELDS_REQUIRED}&pageSize=${pageSize}`;
    pageToken && (api = api + `&pageToken=` + pageToken);
    api =
        `${api}&orderBy=` +
        (mimeType === DIR_MIME_TYPE ? "name" : "createdTime desc");
    return api;
}

export async function searchHandler(token: string, search: string) {
    const res = await fetch(
        FILE_API +
            `?q=mimeType contains '${DIR_MIME_TYPE}' and name contains '${search}'&pageSize=1000&fields=${FIELDS_REQUIRED}&orderBy=createdTime desc`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const { status, statusText } = res;
    if (status !== 200) {
        console.log(
            `error while creating root dir ${status} ${statusText}`,
            await res.json()
        );
        if (status === 401) {
            get(sessionTimeout) === false && sessionTimeout.set(true);
            return;
        }
    }
    searchItems.set((await res.json()).files);
}

export const createRootDir = async (accessToken: string) => {
    let req = await fetch(FILE_API, {
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
    let { status, statusText } = req;
    let data = (await req.json()) as CreateResourceResponse;
    if (status !== 200)
        console.log(
            `error while creating root dir ${status} ${statusText}`,
            data
        );
    return data;
};

export async function fetchFiles(
    parent: string,
    type: "dirs" | "imgs" | "covers",
    pageSize: number = 1000,
    cache: Boolean = false
): Promise<GoogleFileRes | undefined> {
    try {
        // if (!pageSize) {
        //     pageSize = mimeType === DIR_MIME_TYPE ? 1000 : 100;
        // }
        let mimeType = type == "dirs" ? DIR_MIME_TYPE : IMG_MIME_TYPE;
        const token = window.localStorage.getItem("token");
        const req = new Request(constructAPI(parent, mimeType, pageSize), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (cache) await (await caches.open(get(dataCacheName))).delete(req);
        return new Promise(async (resolve, reject) => {
            let res = await fetch(req);
            if (res.status !== 200) {
                if (res.status === 401) {
                    reject({ status: 401 });
                    return;
                }
                reject({ status: res.status });
                return;
            }
            resolve(res.json());
        });
    } catch (error) {
        console.warn(error);
    }
}

export const refreshMainContent = (
    parent: string,
    type?: "dirs" | "imgs"
): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const proms: Promise<void>[] = [];
        switch (type) {
            case "dirs":
                proms.push(fetchDirs(parent, true));
                break;
            case "imgs":
                proms.push(fetchImgs(parent, true));
                break;
            default:
                proms.push(fetchDirs(parent, true), fetchImgs(parent, true));
                break;
        }

        Promise.all(proms)
            .then(() => {
                resolve();
            })
            .catch(async (e) => {
                if (e.status === 401) {
                    get(sessionTimeout) === false && sessionTimeout.set(true);
                    return;
                }
                console.warn(e);
            });
    });
};

export const loadMainContent = (parent: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const proms = [fetchDirs(parent!), fetchImgs(parent!)];
        Promise.all(proms)
            .then(() => {
                resolve();
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

export function localFetch(url: string, krabsCache: Cache) {
    return krabsCache.match(url);
}

export async function refreshCache() {
    if (!checkLoginStatus()) {
        sessionTimeout.set(true);
        return;
    }
    refreshClicked.set(true);
    window.localStorage.setItem("recents", "[]");
    recents.set([]);
    for (const key of await caches.keys()) {
        if (key === get(dataCacheName)) await caches.delete(key);
    }
    refreshMainContent(get(activeParentId)).then(() => {
        refreshClicked.set(false);
    });
}

export const updateResource = async (
    id: string,
    imgMeta: ImgMeta,
    token: string
): Promise<any> => {
    const url = `https://www.googleapis.com/drive/v3/files/${id}`;
    let req = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(imgMeta),
    });
    let { status, statusText } = req;
    let data = (await req.json()) as CreateResourceResponse;
    if (status !== 200) {
        console.log(
            `error while updating resource ${status} ${statusText}`,
            data
        );
        if (status === 401) {
            get(sessionTimeout) === false && sessionTimeout.set(true);
            return;
        }
        return status;
    }
    return { status, data };
};

export const getResource = async (id: string): Promise<GoogleFile> => {
    let res = await fetch(`${FILE_API}/${id}?fields=id,name,parents`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
    });
    let { status, statusText } = res;
    let data = (await res.json()) as CreateResourceResponse;
    if (status !== 200) {
        console.log(
            `error while updating resource ${status} ${statusText}`,
            data
        );
        if (res.status === 401) {
            get(sessionTimeout) === false && sessionTimeout.set(true);
            return;
        }
        return;
    }
    return data;
};

export const moveResource = async (
    id: string,
    parent: string,
    token: string
): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        const url = `https://www.googleapis.com/drive/v3/files/${id}?addParents=${parent}`;
        let req = await fetch(url, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        let { status, statusText } = req;
        let data = (await req.json()) as CreateResourceResponse;
        if (status !== 200) {
            console.log(
                `error while updating resource ${status} ${statusText}`,
                data
            );
            reject({ status });
        }
        resolve({ status, data });
    });
};
