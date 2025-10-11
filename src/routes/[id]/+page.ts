import { browser } from "$app/environment";
import type { PageLoad } from "./$types";
import {
    userLoggedIn,
    signUserOutPartial,
    loadAll,
    getRootFolder,
    fetchSingle,
} from "$lib/scripts/utils";
import { getToken } from "$lib/scripts/login";
import { goto } from "$app/navigation";
import { pocketStore, HOME_PATH, states } from "$lib/scripts/stores.svelte";

async function loadContent(parent: string) {
    try {
        if (pocketStore.has(parent)) {
            const data = pocketStore.get(parent);
            return { ...data };
        }
        const activeFolder = await fetchSingle(parent, "FOLDER", getToken());
        const [folders, files] = await loadAll(parent, getToken());
        if (folders && files && activeFolder) {
            pocketStore.set(parent, {
                folders,
                files,
                activeFolder,
            });
            return { folders, files, activeFolder };
        }
    } catch (error) {
        console.log("erored,", error);
    }
}

export const load = (async ({ params }) => {
    if (browser) {
        if (!userLoggedIn()) {
            console.log("not looged");
            await signUserOutPartial();
            states.setPocketState(params?.id);
            goto("/", { replaceState: true });
            return;
        }
        let id = params.id;
        // if (id === HOME_PATH) {
        //     id = window.localStorage.getItem("root");
        //     if (!id) id = await getRootFolder(getToken());
        // }
        if (id === HOME_PATH) {
            id = "appDataFolder";
        }

        return loadContent(id);
    }
}) satisfies PageLoad;
