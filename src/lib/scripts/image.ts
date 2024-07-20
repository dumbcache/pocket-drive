import {
    activeParent,
    autosave,
    dropItems,
    preferences,
} from "$lib/scripts/stores";
import { childWorker, getRoot } from "$lib/scripts/utils";
import { getToken } from "$lib/scripts/login";
import { get } from "svelte/store";

export function previewAndSetDropItems(
    files: FileList,
    parent?: string,
    parentName?: string
) {
    for (let file of files!) {
        const id = Math.round(Math.random() * Date.now()).toString();
        const imgRef = URL.createObjectURL(file);
        if (file.type.match("image/")) {
            if (
                get(preferences).disableWebp ||
                file.type === "image/gif" ||
                file.type === "image/avif" ||
                file.type === "image/webp"
            ) {
                let item = {
                    id,
                    name: file.name,
                    mimeType: file.type,
                    file,
                    imgRef,
                    parent: parent || get(activeParent).id,
                    parentName: parentName || get(activeParent).name,
                };
                dropItems.set([...get(dropItems), item]);
                if (get(autosave)) {
                    setTimeout(() => autosaveItem(item), 500);
                }
            } else {
                const image = new Image();
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                image.onload = function () {
                    canvas.width = this.naturalWidth; // update canvas size to match image
                    canvas.height = this.naturalHeight;
                    ctx.drawImage(this, 0, 0);
                    canvas.toBlob(async function (blob) {
                        // const result =
                        //     (await blob?.arrayBuffer()) as ArrayBuffer;
                        // const bytes = new Uint8Array(result);
                        // const imgRef = URL.createObjectURL(blob);
                        let item = {
                            id,
                            name: file.name.replace(/\..*$/, ".webp"),
                            mimeType: file.type,
                            file: blob,
                            imgRef,
                            parent: parent || get(activeParent).id,
                            parentName: parentName || get(activeParent).name,
                        };
                        dropItems.set([...get(dropItems), item]);
                        if (get(autosave)) {
                            setTimeout(() => autosaveItem(item), 500);
                        }
                    }, "image/webp");
                };
                image.onerror = function () {
                    alert("Error in loading");
                };
                image.crossOrigin = ""; // if from different origin
                image.src = imgRef;
            }
        }
        if (file.type.match("video/")) {
            let item = {
                id,
                name: file.name,
                mimeType: file.type,
                file,
                imgRef,
                parent: parent || get(activeParent).id,
                parentName: parentName || get(activeParent).name,
            };
            dropItems.set([...get(dropItems), item]);
            // if (get(autosave)) {
            //     setTimeout(() => autosaveItem(item), 500);
            // }
        }
    }
}

function autosaveItem(item: DropItem) {
    const tempItems = setExtraInfo([item]);
    let single = tempItems[1][0];
    let items = get(dropItems).map((i) => {
        if (i.id === item.id) {
            return single;
        } else {
            return i;
        }
    });
    dropItems.set(items);
    const { pathname } = window.location;
    const parent = pathname === "/" ? getRoot() : pathname.substring(1);
    const token = getToken();
    let WorkerMessage = {
        context: "DROP",
        dropItem: single,
        parent,
        token,
    };
    childWorker.postMessage(WorkerMessage);
}

export function setExtraInfo(items: DropItem[]) {
    const droppeditems = document.querySelector(
        ".drop-items"
    ) as HTMLDivElement;
    const commonUrl = (
        document.querySelector(".common-url") as HTMLInputElement
    ).value;
    const tempItems = [];
    for (let item of items) {
        if (item.progress === "success" || item.progress === "uploading")
            continue;
        const id = item.id;
        const dropItem = droppeditems.querySelector(
            `[data-id='${id}']`
        ) as HTMLDivElement;
        let dropImg = dropItem.querySelector(".drop-img") as HTMLImageElement;
        dropImg.classList.toggle("drop-item-uploading");
        let name = dropItem.querySelector(".name") as HTMLInputElement;
        item.name = name.value.trim();
        let url = dropItem.querySelector(".url") as HTMLInputElement;
        if (url.value.trim() !== "") {
            item.url = decodeURI(url.value.trim());
        } else {
            item.url = decodeURI(commonUrl.trim());
        }
        item.progress = "uploading";
        tempItems.push(item);
    }
    return [items, tempItems];
}

export function removeDropEntry(id: string) {
    dropItems.set(get(dropItems).filter((item) => item.id !== id));
}

export function clearDropItems() {
    const a = get(dropItems).filter((item) => item.progress !== "success");
    dropItems.set(a);
}

export function dropOkHandlerSingle(id: string) {
    let items = get(dropItems).filter((item) => item.id === id);
    const tempItems = setExtraInfo(items);
    let single = tempItems[1][0];
    items = get(dropItems).map((item) => {
        if (item.id === id) {
            return single;
        } else {
            return item;
        }
    });
    dropItems.set(items);
    const { pathname } = window.location;
    const parent = pathname === "/" ? getRoot() : pathname.substring(1);
    const token = getToken();
    let WorkerMessage = {
        context: "DROP",
        dropItem: single,
        parent,
        token,
    };
    childWorker.postMessage(WorkerMessage);
}

export function dropOkHandler() {
    let [items, tempItems] = setExtraInfo(get(dropItems));
    dropItems.set(items);
    const { pathname } = window.location;
    const parent = pathname === "/" ? getRoot() : pathname.substring(1);
    const token = getToken();
    tempItems.forEach((item) => {
        let WorkerMessage = {
            context: "DROP",
            dropItem: item,
            parent,
            token,
        };
        childWorker.postMessage(WorkerMessage);
    });
}
