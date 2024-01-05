import { redirect } from "@sveltejs/kit";
import { checkLoginStatus } from "$lib/scripts/shared/utils";
import { browser } from "$app/environment";

export const load = () => {
    if (browser) {
        if (checkLoginStatus()) {
            throw redirect(302, "/r");
        }
    }
};
