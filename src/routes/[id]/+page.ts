import { browser } from "$app/environment";
import type { PageLoad } from "./$types";
import { get } from "svelte/store";
import { loadMain, loadMainContent } from "$lib/scripts/gdrive/utils";
import { checkLoginStatus, getToken } from "$lib/scripts/shared/utils";
import { activeParentId, activeParentName } from "$lib/scripts/stores";
import { goto } from "$app/navigation";
import { fileStore, folderStore, isLoggedin } from "$lib/scripts/shared/stores";

async function loadContent(parent: string) {
    const [folders, files] = await loadMain(parent, getToken());
    folderStore.set(folders);
    fileStore.set(files);
}

export const load = (async ({ params, fetch }) => {
    if (browser) {
        if (!checkLoginStatus()) {
            goto("/");
            return;
        }
        isLoggedin.set(true);
        console.log("logged in");
        const parent =
            params.id === "r" ? window.localStorage.getItem("root") : params.id;
        if (params.id === "r") activeParentName.set("root");
        activeParentId.set(parent!);
        loadContent(parent);
        return;
    }
}) satisfies PageLoad;
