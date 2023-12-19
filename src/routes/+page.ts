import { redirect } from "@sveltejs/kit";
import { checkLoginStatus } from "$lib/scripts/shared/utils";
import { browser } from "$app/environment";
import { get } from "svelte/store";
import { isLoggedin } from "$lib/scripts/stores";

export const load = () => {
    if (browser) {
        if (checkLoginStatus()) {
            throw redirect(302, "/r");
        }
    }
};
