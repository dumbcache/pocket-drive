<script lang="ts">
    import logoutIcon from "$lib/assets/logout.svg?raw";
    import { childWorker } from "$lib/scripts/utils";
    import { signUserOut } from "$lib/scripts/shared/utils";

    function signoutHandler() {
        childWorker.postMessage({ context: "CLEAR_IMAGE_CACHE" });
        window.localStorage.clear();
        signUserOut();
    }
</script>

<button class="button__signout btn" on:click={signoutHandler} title="logout">
    {@html logoutIcon}
</button>

<style>
</style>
