import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";
import { checkLoginStatus } from "$lib/scripts/shared/utils";
import { signUserOut } from "$lib/scripts/shared/utils";
import { isLoggedin } from "$lib/scripts/stores";
import { browser } from "$app/environment";

export const load = ({ params }) => {
    if (browser) {
        if (!checkLoginStatus()) {
            params.id && signUserOut();
            return;
        }
        isLoggedin.set(true);
        throw redirect(302, "/r");
    }
};
