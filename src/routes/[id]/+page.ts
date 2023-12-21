import { browser } from "$app/environment";
import type { PageLoad } from "./$types";
import { loadAll } from "$lib/scripts/gdrive/utils";
import { checkLoginStatus, getToken } from "$lib/scripts/shared/utils";
import { activeParentId, activeParentName } from "$lib/scripts/stores";
import { goto } from "$app/navigation";
import { fileStore, folderStore, isLoggedin } from "$lib/scripts/shared/stores";

async function loadContent(parent: string) {
    const [folders, files] = await loadAll(parent, getToken());
    folderStore.set(folders);
    fileStore.set(files);
    return;
}

export const load = (async ({ params, fetch }) => {
    if (browser) {
        if (!checkLoginStatus()) {
            goto("/");
            return;
        }
        isLoggedin.set(true);
        const parent =
            params.id === "r" ? window.localStorage.getItem("root") : params.id;
        if (params.id === "r") activeParentName.set("root");
        activeParentId.set(parent!);
        return loadContent(parent);
    }
}) satisfies PageLoad;
