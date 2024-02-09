import { mode } from "$lib/scripts/shared/stores";
import { get } from "svelte/store";
import { setActiveImage } from "$lib/scripts/shared/utils";

export function handleImageClick(e) {
    switch (get(mode)) {
        case "edit":
            return;
        case "":
        default:
            let eles = e.composedPath();
            let [target] = eles.filter((ele) => ele.localName === "li");
            let { id } = target?.dataset;
            if (!id) return;
            setActiveImage(id, target.src);
            mode.set("view");
            return;
    }
}
