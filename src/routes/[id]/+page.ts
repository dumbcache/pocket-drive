import { browser } from "$app/environment";
import type { PageLoad } from "./$types";
import {
    checkLoginStatus,
    getToken,
    signUserOutPartial,
    loadAll,
    getRootFolder,
    fetchSingle,
} from "$lib/scripts/utils";
import { goto } from "$app/navigation";
import {
    activeParent,
    fileStore,
    folderStore,
    isLoggedin,
    sessionTimeout,
    pocketStore,
    pocketState,
} from "$lib/scripts/stores";
import { get } from "svelte/store";

async function loadContent(parent: string) {
    if (pocketStore.has(parent)) {
        const { folders, files } = pocketStore.get(parent);
        folderStore.set(folders);
        fileStore.set(files);
        return;
    }
    const [folders, files] = await loadAll(parent, getToken());
    folderStore.set(folders);
    fileStore.set(files);
    return;
}

export const load = (async ({ params, fetch }) => {
    if (browser) {
        if (!checkLoginStatus()) {
            if (!get(isLoggedin)) {
                isLoggedin.set(false);
                signUserOutPartial();
                pocketState.set(params.id);
                goto("/");
                return;
            }
            sessionTimeout.set(true);
            return;
        }
        isLoggedin.set(true);
        let id = params.id;
        if (id === "r") {
            id = window.localStorage.getItem("root");
            if (!id) id = await getRootFolder(getToken());
            activeParent.set({ name: "#Pocket_Drive", id });
            pocketState.set(id);
            return loadContent(id);
        }
        let data = await fetchSingle(id, "FOLDER", getToken());
        activeParent.set({
            id: data.id,
            name: data.name,
            parents: data.parents,
        });
        pocketState.set(id);
        return loadContent(id);
    }
}) satisfies PageLoad;
