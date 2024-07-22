import { checkLoginStatus, getRoot, setCache } from "$lib/scripts/utils";
import { browser } from "$app/environment";
import { get } from "svelte/store";
import { HOME_PATH, pocketState } from "$lib/scripts/stores";
import { goto } from "$app/navigation";

export const load = async () => {
    if (browser) {
        if (checkLoginStatus()) {
            let state =
                get(pocketState) ||
                window.localStorage.getItem("pocketState") ||
                HOME_PATH;
            state === getRoot() && (state = HOME_PATH);
            goto(`/${state}`, { replaceState: true });
            // throw redirect(302, `/${state}`);
        }
    }
};
