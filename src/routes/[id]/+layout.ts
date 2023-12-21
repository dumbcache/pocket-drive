import { browser } from "$app/environment";
import { isLoggedin } from "$lib/scripts/shared/stores";
import { checkLoginStatus } from "$lib/scripts/shared/utils";

export const ssr = false;

export const load = () => {
    if (browser) {
        if (checkLoginStatus()) {
            isLoggedin.set(true);
        }
    }
};
