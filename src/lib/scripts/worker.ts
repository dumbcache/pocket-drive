import { moveMulitple } from "$lib/scripts/gdrive/utils";
import {
    downloadImage,
    createImgMetadata,
    uploadImg,
    editImgs,
    deleteImgs,
} from "$lib/scripts/gdrive/file";

let idbRequest: IDBOpenDBRequest;
(() => {
    idbRequest = indexedDB.open("krabfiles", 1);
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
                            ? postMessage({
                                  context: "DROP_SAVE",
                                  id,
                              })
                            : postMessage({
                                  context: "DROP_SAVE_FAILED",
                                  id,
                                  status,
                              });
                        resolve("");
                    })
                    .catch((e) => {
                        postMessage({
                            context: "DROP_SAVE_FAILED",
                            id,
                            status: e.status,
                        });
                        reject();
                    });
            })
        );
    }
    Promise.allSettled(proms).then(() => {
        postMessage({
            context: "DROP_SAVE_COMPLETE",
        });
    });
}
onmessage = ({ data }) => {
    switch (data.context) {
        case "IMG_PREVIEW":
            checkForImgLocal(data.id, data.token);
            return;
        case "IMG_DELETE":
            deleteImgs(data.imgs, data.token);
            return;
        case "CLEAR_IMAGE_CACHE":
            clearImageCache();
            return;
        case "MOVE":
            moveMulitple(data.parent, data.imgs, data.token);
            return;
        case "EDIT_IMGS":
            editImgs(data.url, data.imgs, data.token);
            return;
        case "DROP_SAVE":
            dropSave(data.dropItems, data.token);
            return;
    }
};
