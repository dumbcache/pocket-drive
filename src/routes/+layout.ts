import { browser } from "$app/environment";
import { preferences } from "$lib/scripts/stores.svelte.js";
import { clearCache } from "$lib/scripts/utils";

export const ssr = true;
export const prerender = true;

export const load = async ({ params }) => {
    try {
        if (browser) {
            let time =
                Number(window.localStorage.getItem("refreshTime")) - Date.now();
            if (time < 0) {
                clearCache();
                window.localStorage.removeItem("refreshTime");
            }
            let pref = localStorage.getItem("preferences");
            if (pref) {
                const data = JSON.parse(pref);
                preferences.set(data);
            }
        }
    } catch (error) {
        console.warn(error);
    }
};
