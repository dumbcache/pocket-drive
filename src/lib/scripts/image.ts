import { childWorker } from "$lib/scripts/utils";
import { getToken } from "$lib/scripts/login";
import { preferences, states, tempStore } from "$lib/scripts/stores.svelte";

export function previewAndSetDropItems(
    files: FileList,
    parent?: string,
    parentName?: string
) {
    for (let file of files!) {
        const id = Math.round(Math.random() * Date.now()).toString();
        const imgRef = URL.createObjectURL(file);
        let item: DropItem = {
            id,
            imgRef,
            parent: parent || tempStore.activeFolder!.id,
            parentName: parentName || tempStore.activeFolder!.name,
            file: "",
            name: "",
            mimeType: file.type,
            loaded: false,
        };
        tempStore.dropItems.push(item);
        if (file.type.match("image/")) {
            if (
                preferences.disableWebp ||
                file.type === "image/gif" ||
                file.type === "image/avif" ||
                file.type === "image/webp"
            ) {
                let t = tempStore.dropItems.find((i) => i.id === item.id);
                if (!t) continue;
                t.file = file;
                t.name = file.name;
                t.mimeType = file.type;
                t.loaded = true;

                if (states.autosave) {
                    setTimeout(() => save(t), 500);
                }
            } else {
                const image = new Image();
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                image.onload = function () {
                    canvas.width = this.naturalWidth;
                    canvas.height = this.naturalHeight;
                    ctx.drawImage(this, 0, 0);
                    canvas.toBlob(async function (blob) {
                        let t = tempStore.dropItems.find(
                            (i) => i.id === item.id
                        );
                        if (!t) return;
                        t.file = blob!;
                        t.mimeType = blob!?.type;
                        t.name = file.name.replace(/\..*$/, ".webp");
                        t.loaded = true;

                        if (states.autosave) {
                            setTimeout(() => save(t), 500);
                        }
                    }, "image/webp");
                };
                image.onerror = function () {
                    alert("Error in loading");
                };
                image.crossOrigin = "";
                image.src = imgRef;
            }
        }
        if (
            file.type.match("video/") ||
            file.name.toLowerCase().endsWith(".mov")
        ) {
            let t = tempStore.dropItems.find((i) => i.id === item.id);
            if (!t) continue;
            t.file = file;
            t.name = file.name;
            t.mimeType = file.type;
            t.loaded = true;
        }
    }
}

export function removeDropEntry(id: string) {
    let index = tempStore.dropItems.findIndex((i) => i.id === id);
    tempStore.dropItems.splice(index, 1);
}

export function clearDropItems() {
    tempStore.dropItems = tempStore.dropItems.filter(
        (item) => item.progress !== "success"
    );
}

function save(item: DropItem, token?: string) {
    if (
        item.progress === "success" ||
        item.progress === "uploading" ||
        item.loaded === false
    )
        return;
    item.progress = "uploading";
    item.url = item.url || tempStore.dropURL;
    token ??= getToken();
    let WorkerMessage = {
        context: "DROP",
        dropItem: { ...item },
        token,
    };
    childWorker.postMessage(WorkerMessage);
}

export function dropOkHandlerSingle(id: string) {
    let item = tempStore.dropItems.find((i) => i.id === id)!;
    save(item);
}

export function dropOkHandler() {
    const token = getToken();
    tempStore.dropItems.forEach((item) => {
        save(item, token);
    });
}
