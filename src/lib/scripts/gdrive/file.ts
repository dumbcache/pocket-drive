import { activeImgs } from "../stores";
import { FILE_API, fetchFiles, moveResource, updateResource } from "./utils";

// export async function downloadImage(id: string, token: string): Promise<Blob> {
//     return new Promise(async (resolve, reject) => {
//         let res = await fetch(`${FILE_API}/${id}?alt=media`, {
//             method: "GET",
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         });
//         if (res.status !== 200) {
//             if (res.status === 401) reject({ status: 401 });
//             reject({ status: res.status });
//         }
//         const data = await res.blob();
//         resolve(data);
//     });
// }

// export const uploadImg = async (
//     location: string,
//     bytes: Uint8Array
//     // mimeType: string
// ) => {
//     let req = await fetch(location, {
//         method: "PUT",
//         // headers: {
//         //     "Content-Type": mimeType,
//         // },
//         body: bytes,
//     });
//     let { status, statusText } = req;
//     if (status !== 200) {
//         console.log(`error while uploadingImg ${status} ${statusText}`);
//         return { status };
//     }
//     return { status };
// };

export async function fetchImgs(
    parent: string,
    cache: Boolean = false
): Promise<void> {
    activeImgs.set(undefined);
    return new Promise((resolve, reject) => {
        fetchFiles(parent!, "imgs", 1000, cache)
            .then(async (imgs) => {
                activeImgs.set(imgs?.files);
                resolve();
                return;
            })
            .catch((status) => reject(status));
    });
}

export const createImgMetadata = (
    imgMeta: ImgMeta,
    token: string
): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const url =
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable";
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
    const proms = [];
    for (let id of imgs) {
        proms.push(
            fetch(`${FILE_API}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        );
    }
    Promise.allSettled(proms).then(() => {
        postMessage({ context: "IMG_DELETE" });
    });
};

export const moveImgs = (parent: string, imgs: string[], token: string) => {
    let proms = [];
    for (let id of imgs) {
        proms.push(moveResource(id, parent, token));
    }
    Promise.allSettled(proms).then(() => {
        postMessage({ context: "MOVE_IMGS", parent });
    });
};
export const editImgs = (url: string, imgs: string[], token: string) => {
    let proms = [];
    for (let id of imgs) {
        proms.push(updateResource(id, { description: url }, token));
    }
    Promise.allSettled(proms).then(() => {
        postMessage({ context: "EDIT_IMGS" });
    });
};
