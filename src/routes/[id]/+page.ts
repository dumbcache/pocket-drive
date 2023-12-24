import { browser } from "$app/environment";
import type { PageLoad } from "./$types";
import { getInfo, getRoot, loadAll } from "$lib/scripts/gdrive/utils";
import { checkLoginStatus, getToken } from "$lib/scripts/shared/utils";
import { activeParentId, activeParentName } from "$lib/scripts/stores";
import { goto } from "$app/navigation";
import {
    activeParent,
    fileStore,
    folderStore,
    isLoggedin,
} from "$lib/scripts/shared/stores";

async function loadContent(parent: string) {
    const [folders, files] = await loadAll(parent, getToken());
    folderStore.set(folders);
    fileStore.set(files);
    return;
}

export const load = (async ({ params, fetch }) => {
    if (browser) {
        if (!checkLoginStatus()) {
            isLoggedin.set(false);
            goto("/");
            return;
        }
        isLoggedin.set(true);
        let id = params.id;
        if (id === "r") {
            id = window.localStorage.getItem("root");
            if (!id) id = await getRoot(getToken());
            activeParent.set({ name: "#Pocket_Drive", id });
            return loadContent(id);
        }
        let data = await getInfo(id);
        activeParent.set({
            id: data.id,
            name: data.name,
            parents: data.parents,
        });
        return loadContent(id);
    }
}) satisfies PageLoad;
