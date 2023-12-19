import { browser } from "$app/environment";
import type { PageLoad } from "./$types";
import { get } from "svelte/store";
import { loadMain, loadMainContent } from "$lib/scripts/gdrive/utils";
import { checkLoginStatus, getToken } from "$lib/scripts/shared/utils";
import {
    activeParentId,
    activeParentName,
    isLoggedin,
} from "$lib/scripts/stores";
import { goto } from "$app/navigation";

export const load = (({ params, fetch }) => {
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
        loadMain(parent, getToken());
        return loadMainContent(parent!);
    }
}) satisfies PageLoad;
