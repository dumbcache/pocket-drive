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
import {
    isLoggedin,
    sessionTimeout,
    pocketStore,
    pocketState,
    HOME_PATH,
} from "$lib/scripts/stores";
import { get } from "svelte/store";
import { redirect } from "@sveltejs/kit";
import { goto } from "$app/navigation";

async function loadContent(parent: string) {
    if (pocketStore.has(parent)) {
        const data = pocketStore.get(parent);
        return { ...data, parent };
    }
    const [folders, files] = await loadAll(parent, getToken());
    pocketStore.set(parent, {
        folders,
        files,
    });
    return { folders, files, parent };
}

export const load = (async ({ params, fetch }) => {
    if (browser) {
        if (!checkLoginStatus()) {
            if (!get(isLoggedin)) {
                isLoggedin.set(false);
                signUserOutPartial();
                pocketState.set(params.id);
                goto("/", { replaceState: true });
                return;
            }
            sessionTimeout.set(true);
            return;
        }
        isLoggedin.set(true);
        let id = params.id;
        if (id === HOME_PATH) {
            id = window.localStorage.getItem("root");
            if (!id) id = await getRootFolder(getToken());
        }
        return loadContent(id);
    }
}) satisfies PageLoad;
