import { browser } from "$app/environment";
// import { pocketStore } from "$lib/scripts/stores.svelte";
import { userLoggedIn } from "$lib/scripts/utils";

export const ssr = false;
export const prerender = false;

export const load = ({ params }) => {
    try {
        if (browser) {
            if (userLoggedIn()) {
                window.localStorage.getItem("refreshTime") ??
                    window.localStorage.setItem(
                        "refreshTime",
                        String(Date.now() + 1 * 60 * 60 * 1000)
                    );
                // let state = sessionStorage.getItem("pocketStore");
                // if (state) {
                //     const data = JSON.parse(state);
                //     for (let [key, val] of data) {
                //         pocketStore.set(key, val);
                //     }
                // }
            }
        }
    } catch (error) {
        console.warn(error);
    }
};
