<script lang="ts">
    import logoutIcon from "$lib/assets/logout.svg?raw";
    import { signUserOut } from "$lib/scripts/utils";
    import { goto } from "$app/navigation";
    import { isLoggedin } from "$lib/scripts/stores";

    async function signoutHandler() {
        isLoggedin.set(false);
        await signUserOut();
        goto("/");
    }
</script>

<button
    class="button__signout btn s-prime"
    on:click={signoutHandler}
    title="logout"
>
    {@html logoutIcon}
</button>

<style>
</style>
