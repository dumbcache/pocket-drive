import { activeParent } from "./stores";

const FILE_API = "https://www.googleapis.com/drive/v3/files";
const FILE_API_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";

let idbRequest: IDBOpenDBRequest;

(() => {
    idbRequest = indexedDB.open("Pocket Files", 1);
    idbRequest.onsuccess = () => {
        const db = idbRequest.result;
        db.onversionchange = () => {
            postMessage({ context: "IDB_RELOAD_REQUIRED" });
        };
        db.onclose = (e) => {
            console.log(`db closed`, e);
        };
        db.onerror = (e) => {
            console.log(`db errored out`, e);
        };
    };
    idbRequest.onupgradeneeded = () => {
        const db = idbRequest.result;
        if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images", { keyPath: "id" });
        }
    };
    idbRequest.onerror = () => {
        console.log(idbRequest.error);
    };
    idbRequest.onblocked = (e) => {
        console.log(`dbclosed`, e);
        postMessage({ context: "IDB_RELOAD_REQUIRED" });
    };
})();

function clearImageCache() {
    const db = idbRequest.result;
    const objectStore = db
        .transaction("images", "readwrite")
        .objectStore("images");
    objectStore.clear();
}

function checkForImgLocal(id: string, token: string) {
    const db = idbRequest.result;
    const objectStore = db.transaction("images").objectStore("images");
    const req = objectStore.get(id);
    req.onsuccess = async (e) => {
        const result = (e.target as IDBRequest).result;
        if (!result) {
            downloadImage(id, token)
                .then((blob) => {
                    const objectStore = db
                        .transaction("images", "readwrite")
                        .objectStore("images");
                    objectStore.put({ id, blob });
                    postMessage({ context: "IMG_PREVIEW", id, blob });
                })
                .catch((e) => {
                    postMessage({
                        context: "IMG_PREVIEW_FAILED",
                        status: e.status,
                    });
                    console.warn(e);
                });
            return;
        }
        postMessage({ context: "IMG_PREVIEW", id, blob: result.blob });
    };
}

async function dropSave(dropItems: DropItem[], token: string) {
    let proms = [];
    for (let item of dropItems) {
        const { id, name, url, mimeType, bytes, parent } = item;
        const imgMeta: ImgMeta = {
            name: name || id,
            mimeType,
            parents: [parent],
            description: url || "",
            // appProperties: { origin: url || "" },
        };
        proms.push(
            new Promise((resolve, reject) => {
                createImgMetadata(imgMeta, token)
                    .then(async (location) => {
                        const { status } = await uploadImg(location, bytes);
                        status === 200
                            ? resolve({
                                  id,
                                  parent,
                                  status: "success",
                              })
                            : resolve({
                                  id,
                                  parent,
                                  status: "failure",
                              });
                    })
                    .catch((e) => {
                        resolve({
                            id,
                            parent,
                            status: "failure",
                        });
                    });
            })
        );
    }
    Promise.allSettled(proms).then((proms) => {
        postMessage({
            context: "DROP_SAVE",
            data: proms,
        });
    });
}

export async function downloadImage(id: string, token: string): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
        let res = await fetch(`${FILE_API}/${id}?alt=media`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (res.status !== 200) {
            if (res.status === 401) reject({ status: 401 });
            reject({ status: res.status });
        }
        const data = await res.blob();
        resolve(data);
    });
}

export const createImgMetadata = (
    imgMeta: ImgMeta,
    token: string
): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const url = `${FILE_API_UPLOAD}?uploadType=resumable`;
        let req = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(imgMeta),
        });
        let { status, statusText } = req;
        if (status !== 200) {
            console.log(
                `error while creatingImgMetaData ${status} ${statusText}`
            );
            reject({ status });
        }
        resolve(req.headers.get("Location")!);
    });
};

export const uploadImg = async (
    location: string,
    bytes: Uint8Array
    // mimeType: string
) => {
    let req = await fetch(location, {
        method: "PUT",
        // headers: {
        //     "Content-Type": mimeType,
        // },
        body: bytes,
    });
    let { status, statusText } = req;
    if (status !== 200) {
        console.log(`error while uploadingImg ${status} ${statusText}`);
        return { status };
    }
    return { status };
};

export const deleteImgs = async (imgs: string[], token: string) => {
    return new Promise((res) => {
        const proms = [];
        for (let id of imgs) {
            proms.push(
                fetch(`${FILE_API}/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }).then((res) => {
                    if (res.status === 204) {
                        postMessage({
                            context: "PROGRESS",
                            type: "DELETE",
                            id,
                            status: 1,
                        });
                    } else {
                        postMessage({
                            context: "PROGRESS",
                            type: "DELETE",
                            id,
                            status: 0,
                        });
                    }
                })
            );
        }
        Promise.allSettled(proms).then(() => {
            res("");
        });
    });
};

async function makeFetch(request: Request) {
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

export const copySingle = async (
    parent: string,
    id: string,
    accessToken: string
): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        let req = new Request(`${FILE_API}/${id}/copy`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ parents: [parent] }),
        });
        const res = await makeFetch(req);
        resolve(res?.status);
    });
};

export function copyMulitple(
    parent: string,
    data: string[],
    accessToken: string
) {
    return new Promise((res) => {
        let proms = [];
        for (let id of data) {
            proms.push(copySingle(parent, id, accessToken));
        }
        Promise.allSettled(proms).then(() => {
            res("");
        });
    });
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
    activeParent: string,
    data: string[],
    accessToken: string
) {
    let proms = [];
    for (let id of data) {
        proms.push(
            moveSingle(parent, id, accessToken).then((status) => {
                if (status === 200) {
                    postMessage({
                        context: "PROGRESS",
                        type: "MOVE",
                        id,
                        status: 1,
                    });
                } else {
                    postMessage({
                        context: "PROGRESS",
                        type: "MOVE",
                        id,
                        status: 0,
                    });
                }
            })
        );
    }
    Promise.allSettled(proms).then(() => {
        postMessage({ context: "MOVE", parent, activeParent, set: data });
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

export function updateMultiple(
    parent: string,
    imgMeta: ImgMeta,
    data: string[],
    accessToken: string
) {
    let proms = [];
    for (let id of data) {
        proms.push(updateSingle(id, imgMeta, accessToken));
    }
    Promise.allSettled(proms).then(() => {
        postMessage({ context: "EDIT", parent });
    });
}

onmessage = ({ data }) => {
    let { parent, activeParent, files, token } = data;
    switch (data.context) {
        case "IMG_PREVIEW":
            checkForImgLocal(data.id, data.token);
            return;
        case "DELETE":
            deleteImgs(files, token).then(() => {
                postMessage({ context: "DELETE", set: files, activeParent });
            });
            return;
        case "CLEAR_IMAGE_CACHE":
            clearImageCache();
            return;
        case "MOVE":
            moveMulitple(parent, activeParent, files, token);
            return;
        case "COPY":
            copyMulitple(parent, files, token).then(() => {
                postMessage({
                    context: "COPY",
                    parent,
                    set: files,
                });
            });
            return;
        case "TOP":
            copyMulitple(parent, files, token).then(() => {
                deleteImgs(data.files, data.token).then(() => {
                    postMessage({
                        context: "COPY",
                        parent,
                        activeParent,
                        set: files,
                        top: true,
                    });
                });
            });
            return;
        case "EDIT":
            updateMultiple(data.parent, data.detail, data.files, data.token);
            return;
        case "DROP_SAVE":
            dropSave(data.dropItems, data.token);
            return;
    }
};
