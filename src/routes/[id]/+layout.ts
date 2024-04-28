import { browser } from "$app/environment";
import { isLoggedin } from "$lib/scripts/stores";
import { checkLoginStatus } from "$lib/scripts/utils";

export const ssr = false;
export const prerender = false;

export const load = () => {
    if (browser) {
        if (checkLoginStatus()) {
            isLoggedin.set(true);
        }
    }
};
