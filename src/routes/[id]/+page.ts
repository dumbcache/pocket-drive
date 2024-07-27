import { browser } from "$app/environment";
import type { PageLoad } from "./$types";
import {
    checkLoginStatus,
    signUserOutPartial,
    loadAll,
    getRootFolder,
    fetchSingle,
} from "$lib/scripts/utils";
import { getToken } from "$lib/scripts/login";
import { pocketStore, HOME_PATH, setPocketState } from "$lib/scripts/stores";
import { goto } from "$app/navigation";

async function loadContent(parent: string) {
    try {
        if (pocketStore.has(parent)) {
            const data = pocketStore.get(parent);
            return { ...data };
        }
        const [folders, files] = await loadAll(parent, getToken());
        const info = await fetchSingle(parent, "FOLDER", getToken());
        if (folders && files && info) {
            pocketStore.set(parent, {
                folders,
                files,
                info,
            });
            return { folders, files, info };
        }
    } catch (error) {
        console.log("erored,", error);
    }
}

export const load = (async ({ params }) => {
    if (browser) {
        setPocketState(params?.id);
        if (!checkLoginStatus()) {
            signUserOutPartial();
            goto("/", { replaceState: true });
            return;
        }
        let id = params.id;
        if (id === HOME_PATH) {
            id = window.localStorage.getItem("root");
            if (!id) id = await getRootFolder(getToken());
        }

        return loadContent(id);
    }
}) satisfies PageLoad;
