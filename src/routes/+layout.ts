import { browser } from "$app/environment";
import { clearDataCache } from "$lib/scripts/utils";

export const ssr = true;
export const prerender = true;

export const load = async ({ params }) => {
    try {
        if (browser) {
            let time =
                Number(window.localStorage.getItem("refreshTime")) - Date.now();
            if (time < 0) {
                clearDataCache();
                window.localStorage.removeItem("refreshTime");
            }
        }
    } catch (error) {
        console.warn(error);
    }
};
