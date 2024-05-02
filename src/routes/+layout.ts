import { browser } from "$app/environment";
import { setCache } from "$lib/scripts/utils";

export const ssr = true;
export const prerender = true;

export const load = async () => {
    if (browser) {
        let time =
            Number(window.localStorage.getItem("refreshTime")) - Date.now();
        if (time < 0) {
            await setCache(true);
            window.localStorage.removeItem("refreshTime");
        }
    }
};
