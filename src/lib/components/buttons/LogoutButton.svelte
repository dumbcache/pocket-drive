<script lang="ts">
    import logoutIcon from "$lib/assets/logout.svg?raw";
    import { signUserOut } from "$lib/scripts/shared/utils";
    import { goto } from "$app/navigation";
    import { isLoggedin } from "$lib/scripts/shared/stores";

    function signoutHandler() {
        isLoggedin.set(false);
        signUserOut();
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
