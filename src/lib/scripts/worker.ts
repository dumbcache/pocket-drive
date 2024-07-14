export const wait = (s: number) => new Promise((res) => setTimeout(res, s));
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
                        status: 0,
                    });
                    console.warn(e);
                });
            return;
        }
        postMessage({ context: "IMG_PREVIEW", id, blob: result.blob });
    };
}

async function uploadFile(
    file: File | Blob,
    location: string,
    id: string
): Promise<number> {
    const chunkSize = 20 * 256 * 1024; // 5 MB chunk size
    let offset = 0;
    let fileSize = file.size;
    while (offset < fileSize) {
        const chunk = file.slice(offset, offset + chunkSize);

        const startByte = offset;
        const endByte = Math.min(offset + chunkSize - 1, fileSize - 1);
        const contentRange = `bytes ${startByte}-${endByte}/${fileSize}`;

        const headers = new Headers();
        headers.append("Content-Length", chunk.size.toString());
        headers.append("Content-Range", contentRange);

        const res = await fetch(location, {
            method: "PUT",
            headers,
            body: chunk,
        });

        if (res.status === 200) {
            console.info("Upload completed");
            return 200;
        }
        if (res.status !== 200 && res.status !== 308) {
            return 500;
        }
        postMessage({
            context: "PROGRESS",
            type: "DROP",
            id,
            progress: Math.trunc((endByte / fileSize) * 100),
        });
        const rangeHeader = res.headers.get("Range");
        if (rangeHeader) {
            const [_, nextOffset] = rangeHeader.split("-").map(Number);
            offset = nextOffset + 1;
        } else {
            console.error("Range header not found in response.");
            return 500;
        }
    }
    return 200;
}

async function dropSave(item: DropItem, token: string) {
    const { id, name, url, mimeType, parent, file } = item;
    const imgMeta: ImgMeta = {
        name: name || id,
        mimeType,
        parents: [parent],
        description: url || "",
        // appProperties: { origin: url || "" },
    };

    createImgMetadata(imgMeta, token)
        .then(async (location) => {
            uploadFile(file, location, id)
                .then((status) => {
                    postMessage({
                        context: "DROP",
                        id,
                        parent,
                        status: status === 200 ? "success" : " failure",
                    });
                })
                .catch((e) => {
                    postMessage({
                        context: "DROP",
                        id,
                        parent,
                        status: "failure",
                    });
                });
        })
        .catch((e) => {
            postMessage({
                context: "DROP",
                id,
                parent,
                status: "failure",
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

async function makeFetch(request: Request) {
    try {
        const res = await fetch(request);
        if (res.status < 200 || res.status > 300) {
            console.info(await res.text());
            return;
        }
        return res.status;
    } catch (error) {
        console.log(error);
        return 500;
    }
}

function deleteRequest({ id, token }: WorkerMessage) {
    return new Request(`${FILE_API}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

function moveRequest({ id, token, parent }: WorkerMessage) {
    return new Request(`${FILE_API}/${id}?addParents=${parent}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

function copyRequest({ id, token, parent }: WorkerMessage) {
    return new Request(`${FILE_API}/${id}/copy`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parents: [parent] }),
    });
}

function editRequest({ id, token, imgMeta }: WorkerMessage) {
    return new Request(`${FILE_API}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(imgMeta),
    });
}

async function performOperation(params: WorkerMessage) {
    let { context, parent, activeParent, view, ids } = params;
    let tempIds: Array<string> = Array.from(ids);
    let success = new Set<string>();
    let request: Function;
    let offset = 0;
    let count = 10;
    switch (context) {
        case "EDIT":
            request = editRequest;
            break;
        case "DELETE":
            request = deleteRequest;
            break;
        case "MOVE":
            request = moveRequest;
            break;
        case "COPY":
        case "TOP":
            request = copyRequest;
            break;
    }

    for (let i = 0; i < Math.ceil(tempIds.length) / count; i++) {
        let batch = tempIds.slice(offset, offset + count);
        offset += count;
        let proms = [];
        batch.forEach((id: string) =>
            proms.push(
                new Promise((res) => {
                    makeFetch(request({ ...params, id })).then((status) => {
                        if (status === 200 || status === 204) {
                            if (context === "TOP") {
                                makeFetch(
                                    deleteRequest({ ...params, id })
                                ).then((status) => {
                                    if (status === 200 || status === 204) {
                                        postMessage({
                                            context: "PROGRESS",
                                            progressType: context,
                                            id,
                                            status: 1,
                                        });
                                        success.add(id);
                                        res(true);
                                    } else {
                                        postMessage({
                                            context: "PROGRESS",
                                            progressType: context,
                                            id,
                                            status: 0,
                                        });
                                        res(true);
                                    }
                                });
                                return;
                            }
                            postMessage({
                                context: "PROGRESS",
                                progressType: context,
                                id,
                                status: 1,
                            });
                            success.add(id);
                            res(true);
                        } else {
                            postMessage({
                                context: "PROGRESS",
                                progressType: context,
                                id,
                                status: 0,
                            });
                            res(true);
                        }
                    });
                })
            )
        );
        await Promise.allSettled(proms);
    }
    postMessage({ ...params, success });
}

onmessage = ({ data }: { data: WorkerMessage }) => {
    let { ids, token } = data;
    switch (data.context) {
        case "EDIT":
        case "DELETE":
        case "MOVE":
        case "COPY":
        case "TOP":
            performOperation(data);
            return;

        case "IMG_PREVIEW":
            checkForImgLocal(ids[0], token);
            return;

        case "CLEAR_IMAGE_CACHE":
            clearImageCache();
            return;

        case "DROP":
            dropSave(data?.dropItem, data.token);
            return;
    }
};
