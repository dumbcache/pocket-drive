import { browser } from "$app/environment";
import type { PageLoad } from "./$types";
import { fetchSingle, getRoot, loadAll } from "$lib/scripts/gdrive/utils";
import {
    checkLoginStatus,
    getToken,
    signUserOutPartial,
} from "$lib/scripts/shared/utils";
import { goto } from "$app/navigation";
import {
    activeParent,
    fileStore,
    folderStore,
    isLoggedin,
    sessionTimeout,
} from "$lib/scripts/shared/stores";
import { get } from "svelte/store";

async function loadContent(parent: string) {
    const [folders, files] = await loadAll(parent, getToken());
    folderStore.set(folders);
    fileStore.set(files);
    return;
}

export const load = (async ({ params, fetch }) => {
    if (browser) {
        if (!checkLoginStatus()) {
            if (get(isLoggedin)) {
                sessionTimeout.set(true);
                return;
            }
            isLoggedin.set(false);
            signUserOutPartial();
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
        let data = await fetchSingle(id, "FOLDER", getToken());
        activeParent.set({
            id: data.id,
            name: data.name,
            parents: data.parents,
        });
        return loadContent(id);
    }
}) satisfies PageLoad;
