import { redirect } from "@sveltejs/kit";
import { checkLoginStatus, setCache } from "$lib/scripts/shared/utils";
import { browser } from "$app/environment";

export const load = async () => {
    if (browser) {
        try {
            let time =
                Number(window.localStorage.getItem("refreshTime")) - Date.now();
            if (time < 0) {
                await setCache(true);
            }
        } catch (error) {}
        if (checkLoginStatus()) {
            throw redirect(302, "/r");
        }
    }
};
