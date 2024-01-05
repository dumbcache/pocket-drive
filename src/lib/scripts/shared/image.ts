import { activeParent, dropItems } from "$lib/scripts/shared/stores";
import { childWorker, getRoot, getToken } from "$lib/scripts/shared/utils";
import { get } from "svelte/store";

export function previewAndSetDropItems(
    files: FileList,
    parent?: string,
    parentName?: string
) {
    for (let file of files!) {
        if (file.type.match("image/")) {
            // previewLoadDropItem(img, dropArea);
            // dropZone.hidden = false;
            const id = Math.round(Math.random() * Date.now()).toString();
            const imgRef = URL.createObjectURL(file);
            if (
                file.type === "image/gif" ||
                file.type === "image/avif" ||
                file.type === "image/webp"
            ) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result! as ArrayBuffer;
                    const bytes = new Uint8Array(result);
                    dropItems.set([
                        ...get(dropItems),
                        {
                            id,
                            name: file.name,
                            mimeType: file.type,
                            bytes,
                            imgRef,
                            parent: parent || get(activeParent).id,
                            parentName: parentName || get(activeParent).name,
                        },
                    ]);
                };
                reader.readAsArrayBuffer(file);
            } else {
                const image = new Image();
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                image.onload = function () {
                    canvas.width = this.naturalWidth; // update canvas size to match image
                    canvas.height = this.naturalHeight;
                    ctx.drawImage(this, 0, 0);
                    canvas.toBlob(async function (blob) {
                        const result =
                            (await blob?.arrayBuffer()) as ArrayBuffer;
                        const bytes = new Uint8Array(result);
                        const imgRef = URL.createObjectURL(blob);
                        dropItems.set([
                            ...get(dropItems),
                            {
                                id,
                                name: file.name.split(".")[0],
                                mimeType: blob?.type!,
                                bytes,
                                imgRef,
                                parent: parent || get(activeParent).id,
                                parentName:
                                    parentName || get(activeParent).name,
                            },
                        ]);
                    }, "image/webp");
                };
                image.onerror = function () {
                    alert("Error in loading");
                };
                image.crossOrigin = ""; // if from different origin
                image.src = imgRef;
            }
        }
    }
}

export function setExtraInfo(items: DropItem[]) {
    const droppeditems = document.querySelector(
        ".drop-items"
    ) as HTMLDivElement;
    const commonUrl = (
        document.querySelector(".common-url") as HTMLInputElement
    ).value;
    const tempDirItems = [];
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
        tempDirItems.push(item);
    }
    return tempDirItems;
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
    const [itemSingle] = setExtraInfo(items);
    items = get(dropItems).map((item) => {
        if (item.id === id) {
            return itemSingle;
        } else {
            return item;
        }
    });
    dropItems.set(items);
    const { pathname } = window.location;
    const parent = pathname === "/" ? getRoot() : pathname.substring(1);
    const token = getToken();
    childWorker.postMessage({
        context: "DROP_SAVE",
        dropItems: [itemSingle],
        parent,
        token,
    });
}

export function dropOkHandler() {
    const tempDropItems = setExtraInfo(get(dropItems));
    const { pathname } = window.location;
    const parent = pathname === "/" ? getRoot() : pathname.substring(1);
    const token = getToken();
    childWorker.postMessage({
        context: "DROP_SAVE",
        dropItems: tempDirItems,
        parent,
        token,
    });
}

export function dropCloseHandler() {
    const running = get(dropItems).filter(
        (item) => item.progress === "uploading"
    );
    if (running.length === 0) {
        // dropFull.set(false);
        dropItems.set([]);
        // autosave.set(false);
    } else {
        // dropMini.set(!get(dropMini));
        // dropFull.set(false);
    }
}
