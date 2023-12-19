import { browser } from "$app/environment";
import { isLoggedin } from "$lib/scripts/shared/stores";
import { checkLoginStatus } from "$lib/scripts/shared/utils";
import { redirect } from "@sveltejs/kit";

export const ssr = false;

export const load = () => {
    if (browser) {
        if (checkLoginStatus()) {
            isLoggedin.set(true);
        }
    }
};
