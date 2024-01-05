import { get } from "svelte/store";
import { dataCacheName, searchItems, sessionTimeout } from "../shared/stores";
import { colorPalette, getToken } from "../shared/utils";

export const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
export const DIR_MIME_TYPE = "application/vnd.google-apps.folder";
export const IMG_MIME_TYPE = "image/";
export const FILE_API = "https://www.googleapis.com/drive/v3/files";
export const FIELDS_IMG =
    "id,name,description,appProperties(origin),thumbnailLink,starred";
export const FIELDS_FOLDER = "id,name,starred,parents";
export const FIELDS_SINGLE = "id,name,parents";
export const FIELDS_MULTIPLE =
    "files(id,name,description,appProperties(origin),thumbnailLink,starred)";
export const DEFAULT_PAGESIZE = 1000;
export const PAGESIZE = 100;

export const wait = (s: number) => new Promise((res) => setTimeout(res, s));

export function constructAPI(
    parent: string,
    mimeType: string,
    pageSize?: number,
    pageToken?: string
) {
    let api = `${FILE_API}?q='${parent}' in parents and mimeType contains '${mimeType}'&fields=${FIELDS_MULTIPLE}&pageSize=${pageSize}`;
    pageToken && (api = api + `&pageToken=` + pageToken);
    api =
        `${api}&orderBy=` +
        (mimeType === DIR_MIME_TYPE ? "name" : "createdTime desc");
    return api;
}

export const createRootDir = async (accessToken: string) => {
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

export async function getRoot(accessToken: string): Promise<string> {
    let root = window.localStorage.getItem("root");
    if (root) return root;
    const req = await fetch(
        `${FILE_API}?&pageSize=1&fields=files(id,name)&orderBy=createdTime`,
        {
            headers: { authorization: `Bearer ${accessToken}` },
        }
    );
    const { files } = await req.json();
    if (files.length !== 0) {
        const id = files[0].id;
        window.localStorage.setItem("root", id);
        return id;
    }
    const { id } = await createRootDir(accessToken);
    window.localStorage.setItem("root", id);
    return id;
}

export async function searchHandler(token: string, search: string) {
    const req = new Request(
        FILE_API +
            `?q=mimeType contains '${DIR_MIME_TYPE}' and name contains '${search}'&pageSize=1000&fields=${FIELDS_MULTIPLE}&orderBy=createdTime desc`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const res = await makeFetch(req);
    if (res?.status === 200) {
        searchItems.set((await res?.json()).files);
    }
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

export const getInfo = async (id: string): Promise<GoogleFile> => {
    let res = await fetch(`${FILE_API}/${id}?fields=${FIELDS_SINGLE}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
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

export async function fetchFiles(
    parent: string,
    type: "dirs" | "imgs" | "covers",
    pageSize: number = 1000,
    updateCache: Boolean = false
): Promise<GoogleFileRes | undefined> {
    try {
        let mimeType = type == "dirs" ? DIR_MIME_TYPE : IMG_MIME_TYPE;
        const token = window.localStorage.getItem("token");
        const req = new Request(constructAPI(parent, mimeType, pageSize), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (updateCache)
            await (await caches.open(get(dataCacheName))).delete(req);
        return new Promise(async (resolve, reject) => {
            let res = await makeFetch(req);
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
    let q = `q='${parent}' in parents and mimeType contains '${mimeType}'`;
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

export async function fetchMultiple(
    params: ParamsObject,
    accessToken: string,
    updateCache: Boolean = false
): Promise<GoogleFileResponse> {
    return new Promise(async (resolve, reject) => {
        const req = constructRequest(params, accessToken);
        if (updateCache) await (await caches.open("pd-data")).delete(req);
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
    let data = (await req.json()) as CreateResourceResponse;
    return { status: res?.status, data };
};

export const deleteSingle = async (id: string, accessToken: string) => {
    let req = new Request(`${FILE_API}/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return makeFetch(req);
};

export const deleteMultiple = async (data: string[], accessToken: string) => {
    const proms = [];
    for (let id of data) {
        proms.push(deleteSingle(id, accessToken));
    }
    Promise.allSettled(proms).then(() => {
        postMessage({ context: "IMG_DELETE" });
    });
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
