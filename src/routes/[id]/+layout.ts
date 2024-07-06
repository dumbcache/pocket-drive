import { browser } from "$app/environment";
import { isLoggedin } from "$lib/scripts/stores";
import { checkLoginStatus } from "$lib/scripts/utils";

export const ssr = false;
export const prerender = false;

export const load = () => {
    try {
        if (browser) {
            if (checkLoginStatus()) {
                isLoggedin.set(true);
                window.localStorage.getItem("refreshTime") ??
                    window.localStorage.setItem(
                        "refreshTime",
                        String(Date.now() + 1 * 60 * 60 * 1000)
                    );
            }
        }
    } catch (error) {
        console.warn(error);
    }
};
