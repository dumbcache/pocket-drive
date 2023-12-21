<script lang="ts">
    import logoutIcon from "$lib/assets/logout.svg?raw";
    import { childWorker } from "$lib/scripts/utils";
    import { clearFiles } from "$lib/scripts/shared/utils";
    import { goto } from "$app/navigation";
    import { isLoggedin } from "$lib/scripts/shared/stores";

    function signoutHandler() {
        isLoggedin.set(false);
        childWorker.postMessage({ context: "CLEAR_IMAGE_CACHE" });
        window.localStorage.clear();
        clearFiles();
        console.log("logging user out");
        goto("/");
    }
</script>

<button class="button__signout btn" on:click={signoutHandler} title="logout">
    {@html logoutIcon}
</button>

<style>
</style>
