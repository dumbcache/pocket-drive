import { checkLoginStatus, getRoot } from "$lib/scripts/utils";
import { browser } from "$app/environment";
import { getPocketState, HOME_PATH } from "$lib/scripts/stores";
import { goto } from "$app/navigation";
import { redirect } from "@sveltejs/kit";

export const load = async () => {
    if (browser) {
        if (checkLoginStatus()) {
            let state = getPocketState();
            state === getRoot() && (state = HOME_PATH);
            goto(`/${state}`, { replaceState: true });
        }
    }
};
