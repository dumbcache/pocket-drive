import { childWorker, getRoot } from "$lib/scripts/utils";
import { getToken } from "$lib/scripts/login";
import { preferences, states, tempStore } from "$lib/scripts/state.svelte";

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
                preferences.disableWebp ||
                file.type === "image/gif" ||
                file.type === "image/avif" ||
                file.type === "image/webp"
            ) {
                let item: DropItem = {
                    id,
                    name: file.name,
                    mimeType: file.type,
                    file,
                    imgRef,
                    parent: parent || tempStore.activeFolder?.id,
                    parentName: parentName || tempStore.activeFolder?.name,
                };
                tempStore.dropItems.push(item);
                if (states.autosave) {
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
                        let item: DropItem = {
                            id,
                            name: file.name.replace(/\..*$/, ".webp"),
                            mimeType: file.type,
                            file: blob,
                            imgRef,
                            parent: parent || tempStore.activeFolder?.id,
                            parentName:
                                parentName || tempStore.activeFolder?.name,
                        };
                        tempStore.dropItems.push(item);
                        if (states.autosave) {
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
            let item: DropItem = {
                id,
                name: file.name,
                mimeType: file.type,
                file,
                imgRef,
                parent: parent || tempStore.activeFolder?.id,
                parentName: parentName || tempStore.activeFolder?.name,
            };
            tempStore.dropItems.push(item);
            // if (get(autosave)) {
            //     setTimeout(() => autosaveItem(item), 500);
            // }
        }
    }
}

function autosaveItem(item: DropItem) {
    const tempItems = setExtraInfo([item]);
    let single = tempItems[1][0];
    tempStore.dropItems = tempStore.dropItems.map((i) => {
        if (i.id === item.id) {
            return single;
        } else {
            return i;
        }
    });
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
    tempStore.dropItems = tempStore.dropItems.filter((item) => item.id !== id);
}

export function clearDropItems() {
    tempStore.dropItems = tempStore.dropItems.filter(
        (item) => item.progress !== "success"
    );
}

export function dropOkHandlerSingle(id: string) {
    let items = tempStore.dropItems.filter((item) => item.id !== id);
    const tempItems = setExtraInfo(items);
    let single = tempItems[1][0];
    tempStore.dropItems = tempStore.dropItems.map((item) => {
        if (item.id === id) {
            return single;
        } else {
            return item;
        }
    });
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
    let [items, tempItems] = setExtraInfo(tempStore.dropItems);
    tempStore.dropItems = items;
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
