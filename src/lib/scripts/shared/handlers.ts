import { mode, activeImage } from "$lib/scripts/shared/stores";
import { get } from "svelte/store";

export function handleImageClick(e) {
    if (get(mode) === "") {
        let target = e.target as HTMLElement;
        activeImage.set(target.dataset.id);
        mode.set("view");
        return;
    }
    mode.set("");
}
