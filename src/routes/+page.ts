import { userLoggedIn, getRoot, signUserOutPartial } from "$lib/scripts/utils";
import { browser } from "$app/environment";
import { HOME_PATH, states } from "$lib/scripts/stores.svelte";
import { goto } from "$app/navigation";

export const load = async () => {
    if (browser) {
        if (userLoggedIn()) {
            let state = states.getPocketState();
            state === getRoot() && (state = HOME_PATH);
            goto(`/${state}`, { replaceState: true });
        } else {
            // await signUserOutPartial();
        }
    }
};
