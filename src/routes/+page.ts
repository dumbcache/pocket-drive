import { redirect } from "@sveltejs/kit";
import { checkLoginStatus, setCache } from "$lib/scripts/utils";
import { browser } from "$app/environment";
import { get } from "svelte/store";
import { pocketState } from "$lib/scripts/stores";

export const load = async () => {
    if (browser) {
        try {
            let time =
                Number(window.localStorage.getItem("refreshTime")) - Date.now();
            if (time < 0) {
                await setCache(true);
            }
        } catch (error) {}
        if (checkLoginStatus()) {
            let state = get(pocketState) || "r";
            throw redirect(302, `/${state}`);
        }
    }
};
