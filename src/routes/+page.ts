import { redirect } from "@sveltejs/kit";
import { checkLoginStatus, setCache } from "$lib/scripts/utils";
import { browser } from "$app/environment";
import { get } from "svelte/store";
import { pocketState } from "$lib/scripts/stores";

export const load = async () => {
    if (browser) {
        if (checkLoginStatus()) {
            let state = get(pocketState) || "r";
            throw redirect(302, `/${state}`);
        }
    }
};
