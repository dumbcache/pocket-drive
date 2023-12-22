import { mode, activeImage } from "$lib/scripts/shared/stores";
import { get } from "svelte/store";

export function handleImageClick(e) {
    switch (get(mode)) {
        case "edit":
            return;
        case "":
        default:
            let target = e.target as HTMLElement;
            let { id } = target.dataset;
            if (!id) return;
            activeImage.set(id);
            mode.set("view");
            return;
    }
}
