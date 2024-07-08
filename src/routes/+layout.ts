import { browser } from "$app/environment";
import { preferences } from "$lib/scripts/stores";
import { setCache } from "$lib/scripts/utils";

export const ssr = true;
export const prerender = true;

export const load = async () => {
    try {
        if (browser) {
            let time =
                Number(window.localStorage.getItem("refreshTime")) - Date.now();
            if (time < 0) {
                await setCache(true);
                window.localStorage.removeItem("refreshTime");
            }
            let state = localStorage.getItem("preferences");
            if (state) {
                const data = JSON.parse(state);
                preferences.set(data);
            }
        }
    } catch (error) {
        console.warn(error);
    }
};
