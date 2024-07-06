import { redirect } from "@sveltejs/kit";
import { checkLoginStatus, setCache } from "$lib/scripts/utils";
import { browser } from "$app/environment";
import { get } from "svelte/store";
import { HOME_PATH, pocketState } from "$lib/scripts/stores";

export const load = async () => {
    try {
        if (browser) {
            if (checkLoginStatus()) {
                let state =
                    get(pocketState) ||
                    window.localStorage.getItem("pocketState") ||
                    HOME_PATH;
                throw redirect(302, `/${state}`);
            }
        }
    } catch (error) {
        console.warn(error);
    }
};
