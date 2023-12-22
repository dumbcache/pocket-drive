import { mode, activeImage } from "$lib/scripts/shared/stores";
import { get } from "svelte/store";

export function handleImageClick(e) {
    console.log(e);
    switch (get(mode)) {
        case "edit":
            return;
        case "":
        default:
            let target = e.target as HTMLImageElement;
            let { id } = target.dataset;
            if (!id) return;
            activeImage.set({ id, src: target.src });
            mode.set("view");
            return;
    }
}
